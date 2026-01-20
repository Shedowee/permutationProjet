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
            'etablissementSouhaite',
        ])->orderByDesc('date_soumission');

        if (in_array($roleCode, ['FORMATEUR', 'EMPLOYE'])) {
            $employe = Employe::where('user_id', $user->id)->first();
            if ($employe) {
                $query->where('employe_id', $employe->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'motif' => 'nullable|string',
            'region_souhaitee_id' => 'nullable|exists:parametres,id',
            'etablissement_souhaite_id' => 'nullable|exists:etablissements,id',
        ]);

        $user = $request->user();
        $employe = Employe::where('user_id', $user->id)->first();
        if (!$employe) {
            return response()->json(['message' => 'Employe not found'], 422);
        }

        $etatEnAttente = Parametre::where('type', 'ETAT')->where('code', 'EN_ATTENTE')->first();
        if (!$etatEnAttente) {
            return response()->json(['message' => 'Etat EN_ATTENTE not configured'], 500);
        }

        $demande = DemandePermutation::create([
            'motif' => $request->motif,
            'etat_id' => $etatEnAttente->id,
            'employe_id' => $employe->id,
            'region_souhaitee_id' => $request->region_souhaitee_id,
            'etablissement_souhaite_id' => $request->etablissement_souhaite_id,
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
