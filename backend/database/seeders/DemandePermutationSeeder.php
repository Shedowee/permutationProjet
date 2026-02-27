<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DemandePermutation;
use App\Models\Employe;
use App\Models\Parametre;
use App\Models\Etablissement;
use App\Models\User;

class DemandePermutationSeeder extends Seeder
{
    public function run(): void
    {
        $etatPending = Parametre::where('type', 'ETAT')->where('code', 'EN_ATTENTE')->first();
        $etatValide = Parametre::where('type', 'ETAT')->where('code', 'VALIDE')->first();
        
        $regionRabat = Parametre::where('type', 'REGION')->where('code', 'RABAT')->first();
        $cityRabat = Parametre::where('type', 'VILLE')->where('code', 'RABAT')->first();
        $etabRabat = Etablissement::where('code', 'ISTA_RABAT_AGDAL')->first();

        $regionCasa = Parametre::where('type', 'REGION')->where('code', 'CASA')->first();
        $cityCasa = Parametre::where('type', 'CASABLANCA')->first();
        $etabMaarif = Etablissement::where('code', 'ISTA_MAARIF')->first();

        $commissionUser = User::where('email', 'a.alaoui@ofppt.ma')->first();

        // 1. Pending Request from Hamza (Casa -> Rabat)
        $hamza = Employe::where('matricule', 'M001')->first();
        if ($hamza && $etatPending) {
            DemandePermutation::updateOrCreate(
                ['employe_id' => $hamza->id, 'etat_id' => $etatPending->id],
                [
                    'motif' => 'Rapprochement familial à Rabat.',
                    'region_souhaitee_id' => $regionRabat?->id,
                    'ville_souhaitee_id' => $cityRabat?->id,
                    'etablissement_souhaite_id' => $etabRabat?->id,
                    'date_soumission' => now()->subDays(5),
                ]
            );
        }

        // 2. Validated Request from Sami (Sale -> Casa)
        $sami = Employe::where('matricule', 'M002')->first();
        if ($sami && $etatValide) {
            DemandePermutation::updateOrCreate(
                ['employe_id' => $sami->id, 'etat_id' => $etatValide->id],
                [
                    'motif' => 'Mutation professionnelle vers Casablanca.',
                    'region_souhaitee_id' => $regionCasa?->id,
                    'ville_souhaitee_id' => $cityCasa?->id,
                    'etablissement_souhaite_id' => $etabMaarif?->id,
                    'date_soumission' => now()->subDays(20),
                    'date_traitement' => now()->subDays(10),
                    'commentaire_commission' => 'Demande acceptée après revue du dossier.',
                    'traite_par_utilisateur_id' => $commissionUser?->id,
                ]
            );
        }
    }
}
