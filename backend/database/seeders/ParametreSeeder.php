<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Parametre;
use App\Models\Etablissement;

class ParametreSeeder extends Seeder
{
    public function run(): void
    {
        // Etat
        Parametre::updateOrCreate(['type' => 'ETAT', 'code' => 'EN_ATTENTE'], ['libelle' => 'En attente', 'ordre' => 1]);
        Parametre::updateOrCreate(['type' => 'ETAT', 'code' => 'VALIDE'], ['libelle' => 'Validée', 'ordre' => 2]);
        Parametre::updateOrCreate(['type' => 'ETAT', 'code' => 'REFUSE'], ['libelle' => 'Refusée', 'ordre' => 3]);

        // Grades
        Parametre::updateOrCreate(['type' => 'GRADE', 'code' => 'A'], ['libelle' => 'Grade A', 'ordre' => 1]);
        Parametre::updateOrCreate(['type' => 'GRADE', 'code' => 'B'], ['libelle' => 'Grade B', 'ordre' => 2]);

        // Etablissement
        Etablissement::firstOrCreate(['code' => 'ETAB01'], ['nom' => 'OFPPT Casablanca', 'adresse' => 'Casablanca']);
    }
}
