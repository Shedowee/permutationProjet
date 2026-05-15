<?php

namespace App\Http\Controllers;

use App\Models\DemandePermutation;
use App\Models\Formateur;
use App\Models\LogAction;
use App\Models\Parametre;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DemandePermutationController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $limit = (int) $request->query('limit', 4);

        if (!$user->hasPermission('read_demandes')) {
            return response()->json(['message' => 'Accès refusé. Seul le formateur peut consulter ses demandes.'], 403);
        }

        $query = DemandePermutation::with([
            'formateur.user',
            'formateur.etablissement.ville.region',
            'etat',
            'regionSouhaitee',
            'villeSouhaitee',
            'etablissementSouhaite',
            'traitePar',
        ])->orderByDesc('date_soumission');

        $scope = strtolower($request->query('scope', 'mine'));

        if ($scope === 'validated') {
            $etatValideId = \App\Models\Parametre::where('type', 'ETAT')->where('key', 'VALIDE')->value('id');
            $query->where('etat_id', $etatValideId);
        } elseif ($user->hasPermission('create_demandes')) {
            $formateur = Formateur::where('user_id', $user->id)->first();
            if (!$formateur) {
                $query->whereRaw('1 = 0');
            } else {
                if ($scope === 'market') {
                    // Show other users' pending demandes, with optional filters
                    $etatPendingId = \App\Models\Parametre::where('type', 'ETAT')->where('key', 'EN_ATTENTE')->value('id');
                    $query->where('etat_id', $etatPendingId)
                        ->where('formateur_id', '!=', $formateur->id);
                    if ($request->boolean('looking_for_me')) {
                        $query->where('etablissement_souhaite_id', $formateur->establishment_id);
                    }
                } else {
                    // Default: only my demandes
                    $query->where('formateur_id', $formateur->id);
                }
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('motif', 'LIKE', '%' . $search . '%')
                  ->orWhereHas('formateur.user', function ($qu) use ($search) {
                      $qu->where('name', 'LIKE', '%' . $search . '%')
                        ->orWhere('email', 'LIKE', '%' . $search . '%');
                  });
            });
        }

        if ($etat = $request->query('etat')) {
            $query->whereHas('etat', function ($q) use ($etat) {
                $q->where('key', strtoupper($etat));
            });
        }

        // Filters by region / city / etablissement (for market browsing or backoffice)
        if ($regionId = $request->query('region_id')) {
            $query->where('region_souhaitee_id', (int) $regionId);
        }
        if ($cityId = $request->query('ville_id')) {
            $query->where('ville_souhaitee_id', (int) $cityId);
        }
        if ($etabId = $request->query('etablissement_id')) {
            $query->where('etablissement_souhaite_id', (int) $etabId);
        }

        if ($limit === -1) {
            $demandes = $query->get();
            return response()->json(['data' => $demandes]);
        }

        $demandes = $query->paginate($limit);

        return response()->json([
            'data' => $demandes->getCollection(),
            'meta' => [
                'current_page' => $demandes->currentPage(),
                'last_page' => $demandes->lastPage(),
                'total' => $demandes->total(),
                'per_page' => $demandes->perPage(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->hasPermission('create_demandes')) {
            return response()->json(['message' => 'Accès refusé. Seul le formateur peut créer une demande.'], 403);
        }

        $formateur = Formateur::firstOrCreate(
            ['user_id' => $user->id],
            [
                'employee_number' => 'F' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
                'position' => 'Formateur',
            ]
        );

        if (!$formateur) {
            return response()->json(['message' => 'Profil formateur non trouvé. Veuillez contacter l\'administrateur.'], 422);
        }

        // Vérifier si une demande est déjà en cours
        $existingPending = DemandePermutation::where('formateur_id', $formateur->id)
            ->whereHas('etat', function($q) {
                $q->where('key', 'EN_ATTENTE');
            })->first();

        if ($existingPending) {
            return response()->json(['message' => 'Vous avez déjà une demande en attente de traitement.'], 422);
        }

        $request->validate([
            'motif' => 'required|string|min:10',
            'region_souhaitee_id' => 'required|exists:parametres,id',
            'ville_souhaitee_id' => 'required|exists:parametres,id',
            'etablissement_souhaite_id' => 'required|exists:etablissements,id',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], [
            'motif.required' => 'Le motif est obligatoire.',
            'motif.min' => 'Le motif doit faire au moins 10 caractères.',
            'region_souhaitee_id.required' => 'La région souhaitée est obligatoire.',
            'ville_souhaitee_id.required' => 'La ville souhaitée est obligatoire.',
            'etablissement_souhaite_id.required' => 'L\'établissement souhaité est obligatoire.',
            'document.mimes' => 'Le document doit être au format PDF, JPG ou PNG.',
            'document.max' => 'Le document ne doit pas dépasser 5 Mo.',
        ]);

        $documentPath = null;
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('demandes', 'public');
        }

        $etatEnAttente = Parametre::where('type', 'ETAT')->where('key', 'EN_ATTENTE')->first();
        if (!$etatEnAttente) {
            return response()->json(['message' => 'Configuration du système incomplète (Etat EN_ATTENTE manquant)'], 500);
        }

        $demande = DemandePermutation::create([
            'motif' => $request->motif,
            'etat_id' => $etatEnAttente->id,
            'formateur_id' => $formateur->id,
            'region_souhaitee_id' => $request->region_souhaitee_id,
            'ville_souhaitee_id' => $request->ville_souhaitee_id,
            'etablissement_souhaite_id' => $request->etablissement_souhaite_id,
            'document_joint' => $documentPath,
            'date_soumission' => now(),
        ]);

        $this->notificationService->notifyUsersWithRole(
            'commission',
            'Nouvelle demande de permutation',
            "{$user->name} a soumis une nouvelle demande de permutation.",
            'demande',
            [
                'demande_id' => $demande->id,
                'route' => "/commission/demandes?demande={$demande->id}",
            ]
        );

        return response()->json(['data' => $demande], 201);
    }

    public function update(Request $request, DemandePermutation $demande)
    {
        $user = $request->user();

        if ($request->filled('etat_code') && $user?->role?->code !== 'commission') {
            return response()->json([
                'message' => 'Accès refusé. Seule la commission peut valider ou refuser une demande de permutation.',
            ], 403);
        }

        $this->authorize('update', $demande);

        $isCommissionReview = $request->filled('etat_code');

        if ($isCommissionReview) {
            $request->validate([
                'etat_code' => 'required|in:VALIDE,REFUSE',
                'commentaire_commission' => 'nullable|string',
            ]);

            $etat = Parametre::where('type', 'ETAT')->where('key', $request->etat_code)->first();
            if (!$etat) {
                return response()->json(['message' => 'Etat not found'], 422);
            }

            $demande->update([
                'etat_id' => $etat->id,
                'commentaire_commission' => $request->commentaire_commission,
                'date_traitement' => now(),
                'traite_par_utilisateur_id' => $user->id,
            ]);

            $demande->loadMissing(['formateur.user', 'etat']);

            $formateurUser = $demande->formateur?->user;
            if ($formateurUser) {
                $isValide = $demande->etat?->key === 'VALIDE';
                $title = $isValide ? 'Demande de permutation validée' : 'Demande de permutation refusée';
                $message = $isValide
                    ? 'Votre demande de permutation a été validée par la commission.'
                    : 'Votre demande de permutation a été refusée par la commission.';

                $this->notificationService->notify(
                    $formateurUser->id,
                    $title,
                    $message,
                    'demande',
                    [
                        'demande_id' => $demande->id,
                        'etat' => $demande->etat?->key,
                        'route' => "/formateur/demandes?demande={$demande->id}",
                        'action' => 'demande_permutation_traitee',
                        'type_detail' => $demande->etat?->key,
                    ]
                );
            }

            return response()->json(['data' => $demande->fresh(['etat'])]);
        }

        if (!$demande->etat || $demande->etat->key !== 'EN_ATTENTE') {
            return response()->json(['message' => 'La demande ne peut être modifiée que lorsqu\'elle est en attente.'], 422);
        }

        $request->validate([
            'motif' => 'required|string|min:10',
            'region_souhaitee_id' => 'required|exists:parametres,id',
            'ville_souhaitee_id' => 'required|exists:parametres,id',
            'etablissement_souhaite_id' => 'required|exists:etablissements,id',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], [
            'motif.required' => 'Le motif est obligatoire.',
            'motif.min' => 'Le motif doit faire au moins 10 caractères.',
            'region_souhaitee_id.required' => 'La région souhaitée est obligatoire.',
            'ville_souhaitee_id.required' => 'La ville souhaitée est obligatoire.',
            'etablissement_souhaite_id.required' => 'L\'établissement souhaité est obligatoire.',
            'document.mimes' => 'Le document doit être au format PDF, JPG ou PNG.',
            'document.max' => 'Le document ne doit pas dépasser 5 Mo.',
        ]);

        $oldDocument = $demande->document_joint;
        $documentPath = $oldDocument;

        if ($request->hasFile('document')) {
            if ($oldDocument) {
                Storage::disk('public')->delete($oldDocument);
            }
            $documentPath = $request->file('document')->store('demandes', 'public');
        }

        $demande->update([
            'motif' => $request->motif,
            'region_souhaitee_id' => $request->region_souhaitee_id,
            'ville_souhaitee_id' => $request->ville_souhaitee_id,
            'etablissement_souhaite_id' => $request->etablissement_souhaite_id,
            'document_joint' => $documentPath,
        ]);

        $this->notificationService->notifyUsersWithRole(
            'commission',
            'Demande de permutation modifiée',
            "{$user->name} a modifié une demande de permutation en attente.",
            'demande',
            [
                'demande_id' => $demande->id,
                'route' => "/commission/demandes?demande={$demande->id}",
            ]
        );

        return response()->json(['data' => $demande->fresh(['etat'])]);
    }

    public function destroy(Request $request, DemandePermutation $demande)
    {
        $this->authorize('delete', $demande);

        if ($demande->document_joint) {
            Storage::disk('public')->delete($demande->document_joint);
        }

        $demande->delete();

        return response()->json(['message' => 'Demande supprimée avec succès']);
    }

    public function show(Request $request, DemandePermutation $demande)
    {
        $user = $request->user();
        if (!$user->hasPermission('read_demandes')) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        if (!$user->hasPermission('approve_demandes')) {
            $formateur = Formateur::where('user_id', $user->id)->first();
            if (!$formateur || $demande->formateur_id !== $formateur->id) {
                return response()->json(['message' => 'Accès refusé.'], 403);
            }
        }

        return response()->json([
            'data' => $demande->load([
                'formateur.user',
                'formateur.etablissement.ville.region',
                'etat',
                'regionSouhaitee',
                'villeSouhaitee',
                'etablissementSouhaite',
                'traitePar',
            ]),
        ]);
    }

    /**
     * List matched pairs of demandes (swap candidates) for the commission role.
     * A pair is (A, B) where:
     *  - A.etablissement_souhaite == B.formateur.establishment_id
     *  - B.etablissement_souhaite == A.formateur.establishment_id
     *  - Their formateur specialties are compatible
     *  - Both are pending (EN_ATTENTE)
     */
    public function matches(Request $request)
    {
        $user = $request->user();
        if ($user?->role?->code !== 'commission') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $etatPendingId = \App\Models\Parametre::where('type','ETAT')->where('key','EN_ATTENTE')->value('id');

        $query = DemandePermutation::with(['formateur', 'formateur.user', 'formateur.etablissement', 'etablissementSouhaite'])
            ->where('etat_id', $etatPendingId);

        if ($user->admin) {
            $admin = optional($user->admin);
            $allowed = is_array($admin?->metadata['etablissements'] ?? null) ? $admin->metadata['etablissements'] : [];
            if ($allowed) {
                $query->where(function($q) use ($allowed) {
                    $q->whereIn('etablissement_souhaite_id', $allowed)
                      ->orWhereHas('formateur', function($fq) use ($allowed) {
                          $fq->whereIn('establishment_id', $allowed);
                      });
                });
            }
        } elseif ($user->commission) {
            $commission = optional($user->commission);
            $allowed = is_array($commission?->metadata['etablissements'] ?? null) ? $commission->metadata['etablissements'] : [];
            if ($allowed) {
                $query->where(function($q) use ($allowed) {
                    $q->whereIn('etablissement_souhaite_id', $allowed)
                      ->orWhereHas('formateur', function($fq) use ($allowed) {
                          $fq->whereIn('establishment_id', $allowed);
                      });
                });
            }
        }

        $demandes = $query->get();

        $byEtabTarget = [];
        foreach ($demandes as $d) {
            $byEtabTarget[$d->etablissement_souhaite_id ?? 0][] = $d;
        }

        $pairs = [];
        $seen = [];
        foreach ($demandes as $a) {
            $aCurrent = $a->formateur?->establishment_id;
            $aTarget = $a->etablissement_souhaite_id;
            $aSpecialite = $a->formateur?->specialite;
            if (!$aCurrent || !$aTarget) continue;
            $candidates = $byEtabTarget[$aCurrent] ?? [];
            foreach ($candidates as $b) {
                if ($b->id === $a->id) continue;
                $bCurrent = $b->formateur?->establishment_id;
                $bTarget = $b->etablissement_souhaite_id;
                $bSpecialite = $b->formateur?->specialite;
                if ($bCurrent && $bTarget && $bTarget == $aCurrent && $aTarget == $bCurrent && $this->specialitiesCompatible($aSpecialite, $bSpecialite)) {
                    $key = implode('-', [min($a->id, $b->id), max($a->id, $b->id)]);
                    if (!isset($seen[$key])) {
                        $pairs[] = [
                            'a' => $a,
                            'b' => $b,
                        ];
                        $seen[$key] = true;
                    }
                }
            }
        }

        return response()->json(['data' => $pairs]);
    }

    private function specialitiesCompatible(?string $left, ?string $right): bool
    {
        $left = $this->normalizeSpecialite($left);
        $right = $this->normalizeSpecialite($right);

        if ($left === '' || $right === '') {
            return true;
        }

        if ($left === $right) {
            return true;
        }

        if (str_contains($left, $right) || str_contains($right, $left)) {
            return true;
        }

        similar_text($left, $right, $percent);

        return $percent >= 70;
    }

    private function normalizeSpecialite(?string $value): string
    {
        return Str::of((string) $value)
            ->ascii()
            ->lower()
            ->squish()
            ->toString();
    }
}
