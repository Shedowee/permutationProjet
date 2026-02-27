<?php

namespace App\Http\Controllers;

use App\Models\DemandePermutation;
use App\Models\Employe;
use App\Models\LogAction;
use App\Models\Parametre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DemandePermutationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $roleCode = $user->role ? $user->role->code : null;

        $query = DemandePermutation::with([
            'employe.user',
            'etat',
            'regionSouhaitee',
            'villeSouhaitee',
            'etablissementSouhaite',
        ])->orderByDesc('date_soumission');

        if (in_array($roleCode, ['FORMATEUR', 'EMPLOYE'])) {
            $employe = Employe::where('user_id', $user->id)->first();
            if ($employe) {
                $query->where('employe_id', $employe->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        } elseif (!in_array($roleCode, ['COMISSION', 'ADMIN'])) {
            $query->whereRaw('1 = 0');
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $employe = Employe::where('user_id', $user->id)->first();
        
        if (!$employe) {
            return response()->json(['message' => 'Profil employé non trouvé. Veuillez contacter l\'administrateur.'], 422);
        }

        $this->authorize('create', DemandePermutation::class);

        // Vérifier si une demande est déjà en cours
        $existingPending = DemandePermutation::where('employe_id', $employe->id)
            ->whereHas('etat', function($q) {
                $q->where('code', 'EN_ATTENTE');
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

        $etatEnAttente = Parametre::where('type', 'ETAT')->where('code', 'EN_ATTENTE')->first();
        if (!$etatEnAttente) {
            return response()->json(['message' => 'Configuration du système incomplète (Etat EN_ATTENTE manquant)'], 500);
        }

        $demande = DemandePermutation::create([
            'motif' => $request->motif,
            'etat_id' => $etatEnAttente->id,
            'employe_id' => $employe->id,
            'region_souhaitee_id' => $request->region_souhaitee_id,
            'ville_souhaitee_id' => $request->ville_souhaitee_id,
            'etablissement_souhaite_id' => $request->etablissement_souhaite_id,
            'document_joint' => $documentPath,
            'date_soumission' => now(),
        ]);

        LogAction::create([
            'action' => 'CREATE_DEMANDE',
            'entite' => 'DemandePermutation',
            'entite_id' => $demande->id,
            'adresse_ip' => $request->ip(),
            'user_id' => $user->id,
        ]);

        return response()->json(['data' => $demande], 201);
    }

    public function update(Request $request, DemandePermutation $demande)
    {
        $request->validate([
            'etat_code' => 'required|in:VALIDE,REFUSE',
            'commentaire_commission' => 'nullable|string',
        ]);

        $user = $request->user();
        $this->authorize('update', $demande);

        $etat = Parametre::where('type', 'ETAT')->where('code', $request->etat_code)->first();
        if (!$etat) {
            return response()->json(['message' => 'Etat not found'], 422);
        }

        $demande->update([
            'etat_id' => $etat->id,
            'commentaire_commission' => $request->commentaire_commission,
            'date_traitement' => now(),
            'traite_par_utilisateur_id' => $user->id,
        ]);

        LogAction::create([
            'action' => 'TRAITER_DEMANDE',
            'entite' => 'DemandePermutation',
            'entite_id' => $demande->id,
            'adresse_ip' => $request->ip(),
            'user_id' => $user->id,
        ]);

        return response()->json(['data' => $demande->fresh(['etat'])]);
    }
}
