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
        $employe = Employe::first();
        $etatEnAttente = Parametre::where('type', 'ETAT')->where('code', 'EN_ATTENTE')->first();
        $etatValide = Parametre::where('type', 'ETAT')->where('code', 'VALIDE')->first();
        $regionRabat = Parametre::where('type', 'REGION')->where('code', 'RABAT')->first();
        $etabSouhaite = Etablissement::where('code', 'ETAB01')->first();
        $admin = User::where('email', 'admin@ofppt.ma')->first();
        $commission = User::where('email', 'commission@ofppt.ma')->first();

        if ($employe && $etatEnAttente && $regionRabat && $etabSouhaite) {
            DemandePermutation::create([
                'date_soumission' => now()->subDays(10),
                'motif' => 'Rapprochement familial',
                'etat_id' => $etatEnAttente->id,
                'employe_id' => $employe->id,
                'region_souhaitee_id' => $regionRabat->id,
                'etablissement_souhaite_id' => $etabSouhaite->id,
            ]);
        }

        if ($employe && $etatValide && $regionRabat && $etabSouhaite && $commission) {
            DemandePermutation::create([
                'date_soumission' => now()->subDays(20),
                'motif' => 'Affectation proche du domicile',
                'date_traitement' => now()->subDays(5),
                'commentaire_commission' => 'Acceptée sous réserve du poste disponible',
                'etat_id' => $etatValide->id,
                'employe_id' => $employe->id,
                'traite_par_utilisateur_id' => $commission->id,
                'region_souhaitee_id' => $regionRabat->id,
                'etablissement_souhaite_id' => $etabSouhaite->id,
            ]);
        }
    }
}
