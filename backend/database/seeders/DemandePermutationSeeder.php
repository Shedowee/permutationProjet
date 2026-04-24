<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DemandePermutation;
use App\Models\Formateur;
use App\Models\Parametre;
use App\Models\Etablissement;
use App\Models\User;

class DemandePermutationSeeder extends Seeder
{
    public function run(): void
    {
        $etatPending = Parametre::where('type', 'ETAT')->where('key', 'EN_ATTENTE')->first();
        $etatValide = Parametre::where('type', 'ETAT')->where('key', 'VALIDE')->first();
        
        $regionRabat = Parametre::where('type', 'REGION')->where('key', 'RABAT_SALE')->first();
        $citySale = Parametre::where('type', 'VILLE')->where('key', 'SALE')->first();
        $etabSale = Etablissement::where('name', 'ISTA SALE TABRIQUET')->first();

        $regionCasa = Parametre::where('type', 'REGION')->where('key', 'CASA_SETTAT')->first();
        $cityCasa = Parametre::where('type', 'VILLE')->where('key', 'CASABLANCA')->first();
        $etabMaarif = Etablissement::where('name', 'ISTA MAARIF')->first();

        $commissionUser = User::where('email', 'a.alaoui@ofppt.ma')->first();

        // 1. Pending Request from Hamza (Casa -> Sale)
        $hamza = Formateur::where('employee_number', 'M001')->first();
        if ($hamza && $etatPending) {
            DemandePermutation::updateOrCreate(
                ['formateur_id' => $hamza->id, 'etat_id' => $etatPending->id],
                [
                    'motif' => 'Rapprochement familial à Salé.',
                    'region_souhaitee_id' => $regionRabat?->id,
                    'ville_souhaitee_id' => $citySale?->id,
                    'etablissement_souhaite_id' => $etabSale?->id,
                    'date_soumission' => now()->subDays(5),
                ]
            );
        }

        // 2. Validated Request from Sami (Sale -> Casa)
        $sami = Formateur::where('employee_number', 'M002')->first();
        if ($sami && $etatValide) {
            DemandePermutation::updateOrCreate(
                ['formateur_id' => $sami->id, 'etat_id' => $etatValide->id],
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
