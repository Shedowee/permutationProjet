<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Parametre;
use App\Models\Etablissement;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Events\UserActionOccurred;
use App\Http\Controllers\Concerns\HandlesMailSending;

class UtilisateursController extends Controller
{
    use HandlesMailSending;

    private function allowedEtablissementIds(User $user): ?array
    {
        if ($user->admin) {
            $admin = optional($user->admin);
            $ids = is_array($admin?->metadata['etablissements'] ?? null) ? $admin->metadata['etablissements'] : [];
            return $ids ?: null; // null means no restriction (super admin without metadata)
        }
        if ($user->commission) {
            $com = optional($user->commission);
            $ids = is_array($com?->metadata['etablissements'] ?? null) ? $com->metadata['etablissements'] : [];
            return $ids ?: null;
        }
        if ($user->formateur) {
            $ids = $user->formateur->etablissements()->pluck('etablissements.id')->values()->all();
            return $ids ?: ($user->formateur->establishment_id ? [$user->formateur->establishment_id] : null);
        }
        return null;
    }

    private function syncProfileForRole(User $user, ?string $roleCode, ?string $specialite = null): void
    {
        $roleCode = strtolower((string) $roleCode);

        if ($roleCode === 'formateur') {
            $payload = [
                'employee_number' => 'F' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
                'position' => 'Formateur',
            ];

            if ($specialite !== null) {
                $payload['specialite'] = $specialite;
            }

            \App\Models\Formateur::updateOrCreate(
                ['user_id' => $user->id],
                $payload
            );
        }

        if ($roleCode === 'commission') {
            \App\Models\Commission::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'commission_name' => 'Commission',
                ]
            );
        }

        if ($roleCode === 'admin') {
            \App\Models\Admin::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'admin_level' => 1,
                ]
            );
        }
    }

    private function formateurIsWithinAllowedEstablishments(User $user, array $allowed): bool
    {
        if (!$user->formateur) {
            return true;
        }

        $pivotIds = $user->formateur->etablissements()->pluck('etablissements.id')->all();
        if (collect($pivotIds)->intersect($allowed)->isNotEmpty()) {
            return true;
        }

        return in_array($user->formateur->establishment_id, $allowed);
    }

    private function buildUserDetailPayload(User $user): array
    {
        $role = $user->relationLoaded('role') ? $user->role : $user->role()->with('permissions')->first();

        return [
            'id' => $user->id,
            'uuid' => $user->uuid,
            'name' => $user->name,
            'nom' => $user->name,
            'email' => $user->email,
            'role_id' => $user->role_id,
            'role' => $role?->code ?? null,
            'role_label' => $role?->name ?? null,
            'permissions' => $role?->permissions?->pluck('name')->values()->all() ?? [],
            'status' => $user->status,
            'email_verified_at' => $user->email_verified_at,
            'phone' => $user->phone,
            'age' => $user->age,
            'address' => $user->address,
            'photo_url' => $user->photo_url,
            'created_at' => $user->created_at,
            'admin' => $user->admin ? [
                'id' => $user->admin->id,
                'admin_level' => $user->admin->admin_level,
                'notes' => $user->admin->notes,
                'metadata' => $user->admin->metadata,
            ] : null,
            'commission' => $user->commission ? [
                'id' => $user->commission->id,
                'commission_name' => $user->commission->commission_name,
                'jurisdiction' => $user->commission->jurisdiction,
                'start_date' => $user->commission->start_date,
                'end_date' => $user->commission->end_date,
                'notes' => $user->commission->notes,
                'metadata' => $user->commission->metadata,
            ] : null,
            'formateur' => $user->formateur ? [
                'id' => $user->formateur->id,
                'employee_number' => $user->formateur->employee_number,
                'position' => $user->formateur->position,
                'specialite' => $user->formateur->specialite,
                'establishment_id' => $user->formateur->establishment_id,
                'etablissement' => $user->formateur->etablissement ? [
                    'id' => $user->formateur->etablissement->id,
                    'name' => $user->formateur->etablissement->name,
                ] : null,
                'etablissements' => $user->formateur->etablissements?->map(fn ($e) => [
                    'id' => $e->id,
                    'name' => $e->name,
                ])->values()->all() ?? [],
            ] : null,
            'documents' => $user->documents?->map(fn ($document) => [
                'id' => $document->id,
                'document_type' => $document->document_type,
                'file_path' => $document->file_path,
                'created_at' => $document->created_at,
            ])->values()->all() ?? [],
            'logs' => $user->logs?->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'type' => $log->type,
                'date' => $log->date ?? $log->created_at,
                'description' => $log->description ?? null,
            ])->values()->all() ?? [],
        ];
    }

    /**
     * Update user profile information
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'age' => 'sometimes|nullable|integer|min:0|max:120',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|nullable|string|max:255',
            'specialite' => 'sometimes|nullable|string|max:255',
            'region_id' => 'nullable|exists:parametres,id',
            'city_id' => 'nullable|exists:parametres,id',
            'establishment_id' => 'nullable|exists:etablissements,id',
        ]);

        $profileData = array_intersect_key($validated, array_flip(['name', 'age', 'phone', 'address']));

        $formateurPayload = null;
        $formateur = null;
        $hasFormateurUpdate = $request->has('specialite') || $request->filled('region_id') || $request->filled('city_id') || $request->filled('establishment_id');
        if (($user->formateur || $request->has('specialite')) && $hasFormateurUpdate) {
            if (($request->filled('region_id') || $request->filled('city_id') || $request->filled('establishment_id'))
                && (!$request->filled('region_id') || !$request->filled('city_id') || !$request->filled('establishment_id'))) {
                return response()->json([
                    'message' => 'Veuillez sélectionner une région, une ville et un établissement.',
                ], 422);
            }

            $formateurPayload = [];
            $formateur = $user->formateur ?? \App\Models\Formateur::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_number' => 'F' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
                    'position' => 'Formateur',
                ]
            );

            if ($request->filled('region_id') || $request->filled('city_id') || $request->filled('establishment_id')) {
                $region = Parametre::query()
                    ->where('type', 'REGION')
                    ->find($validated['region_id']);
                $city = Parametre::query()
                    ->where('type', 'VILLE')
                    ->find($validated['city_id']);
                $etablissement = Etablissement::with('ville')->find($validated['establishment_id']);

                if (!$region || !$city || !$etablissement) {
                    return response()->json([
                        'message' => 'Sélection invalide pour l\'affectation.',
                    ], 422);
                }

                if ((int) $city->parent_id !== (int) $region->id) {
                    return response()->json([
                        'message' => 'La ville sélectionnée ne correspond pas à la région choisie.',
                    ], 422);
                }

                if ((int) $etablissement->city_id !== (int) $city->id) {
                    return response()->json([
                        'message' => 'L\'établissement sélectionné ne correspond pas à la ville choisie.',
                    ], 422);
                }
                $formateurPayload['establishment_id'] = $etablissement->id;
            }

            if (array_key_exists('specialite', $validated)) {
                $formateurPayload['specialite'] = $validated['specialite'];
            }
        }

        DB::transaction(function () use ($user, $profileData, $formateurPayload, $formateur) {
            if (!empty($profileData)) {
                $user->update($profileData);
            }

            if ($formateurPayload && $formateur) {
                $formateur->update($formateurPayload);
            }
        });

        event(new UserActionOccurred(
            $user->id,
            'profile_update',
            "Profil mis à jour pour l'utilisateur: {$user->email}"
        ));

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => $user->fresh()->load(['role.permissions', 'formateur.etablissement.ville.region', 'formateur.etablissements'])
        ]);
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password_hash)) {
            return response()->json(['message' => 'Le mot de passe actuel est incorrect'], 422);
        }

        $user->update([
            'password_hash' => Hash::make($request->new_password)
        ]);

        event(new UserActionOccurred(
            $user->id,
            'password_change',
            "Mot de passe modifié pour l'utilisateur: {$user->email}"
        ));

        return response()->json(['message' => 'Mot de passe mis à jour avec succès']);
    }

    /**
     * Request email change
     */
    public function updateEmail(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        if ($request->email === $user->email) {
            return response()->json(['message' => 'C\'est déjà votre adresse email actuelle'], 422);
        }

        $oldEmail = $user->email;
        $user->forceFill([
            'email' => $request->email,
            'email_verified_at' => null,
        ])->save();

        $mailSent = $this->sendMailSafely(
            fn () => $user->sendEmailVerificationNotification(),
            'Verification email could not be sent after profile email change.',
            [
                'user_id' => $user->id,
                'email' => $user->email,
            ]
        );

        event(new UserActionOccurred(
            $user->id,
            'email_change',
            "Email changé de {$oldEmail} vers {$request->email}"
        ));

        return response()->json([
            'message' => 'Adresse email mise à jour. Un lien de vérification a été envoyé à la nouvelle adresse.',
            'email' => $request->email,
            'mail_sent' => $mailSent,
        ]);
    }

    /**
     * Get user notifications
     */
    public function getNotifications(Request $request)
    {
        $user = $request->user();
        $user->loadMissing('role');
        $query = Notification::query()->visibleTo($user);

        if ($search = trim((string) $request->query('q', ''))) {
            $like = '%' . mb_strtolower($search) . '%';
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(type) LIKE ?', [$like])
                  ->orWhereRaw("LOWER(COALESCE(payload->>'title', '')) LIKE ?", [$like])
                  ->orWhereRaw("LOWER(COALESCE(payload->>'message', '')) LIKE ?", [$like]);
            });
        }

        $paginator = $query
            ->orderByRaw('CASE WHEN read_at IS NULL THEN 0 ELSE 1 END')
            ->latest()
            ->paginate(20);

        // Return a flat array plus meta to match frontend expectations
        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
            ],
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markNotificationRead(Request $request, \App\Models\Notification $notification)
    {
        $user = $request->user();
        $user->loadMissing('role');

        if (! $notification->newQuery()->visibleTo($user)->whereKey($notification->id)->exists()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    /**
     * Clear all notifications for the authenticated user.
     */
    public function clearNotifications(Request $request)
    {
        $user = $request->user();
        $user->loadMissing('role');
        Notification::query()->visibleTo($user)->delete();

        return response()->json(['message' => 'Notifications supprimées avec succès']);
    }

    /**
     * Get a single notification.
     */
    public function getNotification(Request $request, Notification $notification)
    {
        $user = $request->user();
        $user->loadMissing('role');

        if (! $notification->newQuery()->visibleTo($user)->whereKey($notification->id)->exists()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json([
            'data' => $notification->load('user'),
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadNotificationsCount(Request $request)
    {
        $user = $request->user();
        $user->loadMissing('role');
        $count = Notification::query()
            ->visibleTo($user)
            ->whereNull('read_at')
            ->count();
        return response()->json(['count' => $count]);
    }
    /**
     * Update profile picture
     */
    public function updateProfilePicture(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();

        if ($user->photo_url) {
            Storage::disk('public')->delete($user->photo_url);
        }

        $path = $request->file('image')->store('profile_pictures', 'public');
        $user->update(['photo_url' => $path]);

        return response()->json([
            'message' => 'Photo de profil mise à jour',
            'url' => asset('storage/' . $path),
            'photo_url' => $path
        ]);
    }

    /**
     * Upload professional document
     */
    public function uploadDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx,jpg,png|max:5120',
            'document_type' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $file = $request->file('document');
        $path = $file->store('user_documents/' . $user->id, 'public');

        $document = $user->documents()->create([
            'document_type' => $request->document_type,
            'file_path' => $path,
        ]);

        return response()->json([
            'message' => 'Document ajouté avec succès',
            'document' => $document
        ]);
    }

    /**
     * List user documents
     */
    public function listDocuments(Request $request)
    {
        $documents = $request->user()->documents()->latest()->get();
        return response()->json(['data' => $documents]);
    }

    /**
     * Delete user document
     */
    public function deleteDocument(Request $request, \App\Models\UserDocument $document)
    {
        if ($document->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'Document supprimé']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['role.permissions']);

        $requestUser = $request->user();
        if ($requestUser && !$requestUser->admin) {
            $allowed = $this->allowedEtablissementIds($requestUser);
            if (is_array($allowed) && ($requestUser->commission || $requestUser->formateur)) {
                $query->whereHas('formateur', function ($q) use ($allowed) {
                    $q->whereIn('establishment_id', $allowed)
                      ->orWhereHas('etablissements', function ($etabQuery) use ($allowed) {
                          $etabQuery->whereIn('etablissements.id', $allowed);
                      });
                });
            }
        }

        // Filters
        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%");
            });
        }
        if ($role = $request->query('role')) {
            $query->whereHas('role', function($rq) use ($role) {
                $rq->whereRaw('LOWER(name) = ?', [strtolower($role)]);
            });
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($request->boolean('pending')) {
            $query->where(function ($q) {
                $q->whereNull('role_id')
                  ->orWhere('status', '!=', 'actif');
            });
        }

        $limit = (int) $request->query('limit', 5);
        if ($limit === -1) {
            $users = $query->orderBy('name')->get();
            $data = $users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'nom' => $u->name,
                'email' => $u->email,
                'role' => $u->role?->code ?? strtolower((string) $u->role?->name),
                'status' => $u->status,
                'phone' => $u->phone,
                'age' => $u->age,
                'address' => $u->address,
                'photo_url' => $u->photo_url,
            ]);
            return response()->json(['data' => $data]);
        }

        $page = (int) $request->query('page', 1);
        $paginator = $query->orderBy('name')->paginate($limit, ['*'], 'page', $page);
        $data = collect($paginator->items())->map(fn($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'nom' => $u->name,
            'email' => $u->email,
            'role' => $u->role?->code ?? strtolower((string) $u->role?->name),
            'status' => $u->status,
            'phone' => $u->phone,
            'age' => $u->age,
            'address' => $u->address,
            'photo_url' => $u->photo_url,
        ]);

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string',
            'status' => 'nullable|string',
            'specialite' => 'nullable|string|max:255',
        ]);

        $roleCode = strtolower($validated['role']);
        $roleId = \App\Models\Role::where('code', $roleCode)->value('id');

        if (!$roleId) {
            return response()->json(['message' => 'Role not found'], 422);
        }

        $user = User::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'role_id' => $roleId,
            'status' => $validated['status'] ?? 'pending',
            'email_verified_at' => now(), // Assume admin created users are verified
        ]);

        $this->syncProfileForRole($user, $roleCode, $validated['specialite'] ?? null);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user->load('role.permissions')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $user = User::with([
            'role.permissions',
            'formateur.etablissements',
            'admin',
            'commission',
            'documents',
            'logs',
        ])->findOrFail($id);
        $requestUser = $request->user();
        if ($requestUser && !$requestUser->admin) {
            $allowed = $this->allowedEtablissementIds($requestUser);
            if (is_array($allowed) && !$this->formateurIsWithinAllowedEstablishments($user, $allowed)) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }
        }

        return response()->json(['data' => $this->buildUserDetailPayload($user)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $allowed = $this->allowedEtablissementIds($request->user());
        if (is_array($allowed) && !$this->formateurIsWithinAllowedEstablishments($user, $allowed)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'age' => 'sometimes|nullable|integer|min:0|max:120',
            'phone' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|string',
            'status' => 'sometimes|string',
            'specialite' => 'sometimes|nullable|string|max:255',
        ]);

        if (isset($validated['role'])) {
            $roleCode = strtolower($validated['role']);
            $roleId = \App\Models\Role::where('code', $roleCode)->value('id');
            if ($roleId) {
                $validated['role_id'] = $roleId;
                $this->syncProfileForRole($user, $roleCode, $validated['specialite'] ?? null);
            }
            unset($validated['role']);
        }

        $beforeRoleId = $user->role_id;
        $user->update($validated);

        if ($beforeRoleId !== $user->role_id) {
            event(new UserActionOccurred(
                $user->id,
                'role_change',
                "Rôle mis à jour pour l'utilisateur: {$user->email}"
            ));
        }

        $payload = $user->load(['role.permissions', 'formateur.etablissements', 'admin', 'commission', 'documents', 'logs']);

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $this->buildUserDetailPayload($payload)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user)
    {
        $allowed = $this->allowedEtablissementIds($request->user());
        if (is_array($allowed) && !$this->formateurIsWithinAllowedEstablishments($user, $allowed)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}
