<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Services\EmailVerificationService;
use App\Events\UserActionOccurred;

class UtilisateursController extends Controller
{
    protected EmailVerificationService $emailVerificationService;

    public function __construct(EmailVerificationService $emailVerificationService)
    {
        $this->emailVerificationService = $emailVerificationService;
    }

    /**
     * Update user profile information
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'age' => 'sometimes|integer|min:18|max:100',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:500',
        ]);

        $user->update($validated);

        event(new UserActionOccurred(
            $user->id,
            'profile_update',
            "Profil mis à jour pour l'utilisateur: {$user->email}"
        ));

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => $user
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

        if (!Hash::check($request->current_password, $user->mot_de_passe)) {
            return response()->json(['message' => 'Le mot de passe actuel est incorrect'], 422);
        }

        $user->update([
            'mot_de_passe' => Hash::make($request->new_password)
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
            'email' => 'required|email|unique:utilisateurs,email,' . $user->id,
        ]);

        if ($request->email === $user->email) {
            return response()->json(['message' => 'C\'est déjà votre adresse email actuelle'], 422);
        }

        // Store new email temporarily in OTP table or similar
        $code = $this->emailVerificationService->sendOtp($request->email, 'email_change');
        
        // Mocking email sending
        try {
            \Illuminate\Support\Facades\Mail::raw(
                'Votre code de vérification pour changer votre email est: ' . $code,
                function ($message) use ($request) {
                    $message->to($request->email)->subject('Changement d\'adresse email');
                }
            );
        } catch (\Throwable $e) {}

        return response()->json([
            'message' => 'Un code de vérification a été envoyé à votre nouvelle adresse email.',
            'temp_email' => $request->email
        ]);
    }

    /**
     * Verify and complete email change
     */
    public function verifyNewEmail(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email' => 'required|email|unique:utilisateurs,email,' . $user->id,
            'code' => 'required|string',
        ]);

        if (!$this->emailVerificationService->verifyOtp($request->email, $request->code, 'email_change')) {
            return response()->json(['message' => 'Code de vérification invalide ou expiré'], 422);
        }

        $oldEmail = $user->email;
        $user->update([
            'email' => $request->email,
            'email_verified' => true,
            'email_verified_at' => now()
        ]);

        event(new UserActionOccurred(
            $user->id,
            'email_verified',
            "Email changé de {$oldEmail} vers {$request->email}"
        ));

        return response()->json(['message' => 'Adresse email mise à jour et vérifiée avec succès']);
    }

    /**
     * Get user notifications
     */
    public function getNotifications(Request $request)
    {
        $notifications = $request->user()->notifications()
            ->orderBy('is_read', 'asc')
            ->latest()
            ->paginate(20);

        return response()->json(['data' => $notifications]);
    }

    /**
     * Mark a notification as read
     */
    public function markNotificationRead(Request $request, \App\Models\Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadNotificationsCount(Request $request)
    {
        $count = $request->user()->notifications()->where('is_read', false)->count();
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

        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $path = $request->file('image')->store('profile_pictures', 'public');
        $user->update(['profile_picture' => $path]);

        return response()->json([
            'message' => 'Photo de profil mise à jour',
            'url' => asset('storage/' . $path)
        ]);
    }

    /**
     * Upload professional document
     */
    public function uploadDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx,jpg,png|max:5120',
            'title' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $file = $request->file('document');
        $path = $file->store('user_documents/' . $user->id, 'public');

        $document = $user->documents()->create([
            'title' => $request->title,
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
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
    public function index()
    {
        $users = User::with('role')->orderBy('nom')->get();

        $data = $users->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->nom,
                'email' => $u->email,
                'role' => $u->role ? strtolower($u->role->code) : null,
                'status' => $u->actif ? 'actif' : 'inactif',
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'email' => 'required|email|unique:utilisateurs,email',
                'password' => 'required|string|min:6',
                'role' => 'required|string',
                'status' => 'nullable|string',
            ]);

            $roleCode = strtolower($validated['role']);
            $roleId = \App\Models\Role::whereRaw('LOWER(code) = ?', [$roleCode])->value('id');

            if (!$roleId) {
                return response()->json(['message' => 'Role not found'], 422);
            }

            $user = User::create([
                'nom' => $validated['nom'],
                'email' => $validated['email'],
                'mot_de_passe' => Hash::make($validated['password']),
                'role_id' => $roleId,
                'actif' => isset($validated['status']) ? ($validated['status'] === 'actif' || $validated['status'] === 'active') : true,
            ]);

            $user->load('role');

            return response()->json([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->nom,
                    'email' => $user->email,
                    'role' => $user->role ? strtolower($user->role->code) : null,
                    'status' => $user->actif ? 'actif' : 'inactif',
                ]
            ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = User::with(['role', 'documents', 'employe.grade', 'employe.region', 'employe.etablissement'])->findOrFail($id);
        return response()->json(['data' => $user]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'nom' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:utilisateurs,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        if (isset($validated['role'])) {
            $roleCode = strtolower($validated['role']);
            $roleId = \App\Models\Role::whereRaw('LOWER(code) = ?', [$roleCode])->value('id');
            if (!$roleId) {
                return response()->json(['message' => 'Role not found'], 422);
            }
            $user->role_id = $roleId;
        }

        if (isset($validated['nom'])) {
            $user->nom = $validated['nom'];
        }
        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }
        if (isset($validated['password'])) {
            $user->mot_de_passe = Hash::make($validated['password']);
        }
        if (isset($validated['status'])) {
            $user->actif = ($validated['status'] === 'actif' || $validated['status'] === 'active');
        }

        $user->save();
        $user->load('role');

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->nom,
                'email' => $user->email,
                'role' => $user->role ? strtolower($user->role->code) : null,
                'status' => $user->actif ? 'actif' : 'inactif',
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
