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
        $enAttente = Parametre::create(['type' => 'ETAT', 'code' => 'EN_ATTENTE', 'libelle' => 'En attente', 'ordre' => 1]);
        $valide = Parametre::create(['type' => 'ETAT', 'code' => 'VALIDE', 'libelle' => 'Validée', 'ordre' => 2]);
        $refuse = Parametre::create(['type' => 'ETAT', 'code' => 'REFUSE', 'libelle' => 'Refusée', 'ordre' => 3]);

        // Grades
        $gradeA = Parametre::create(['type' => 'GRADE', 'code' => 'A', 'libelle' => 'Grade A', 'ordre' => 1]);
        $gradeB = Parametre::create(['type' => 'GRADE', 'code' => 'B', 'libelle' => 'Grade B', 'ordre' => 2]);

        // Regions
        $regionCasa = Parametre::create(['type' => 'REGION', 'code' => 'CASA', 'libelle' => 'Casablanca-Settat', 'ordre' => 1]);
        $regionRabat = Parametre::create(['type' => 'REGION', 'code' => 'RABAT', 'libelle' => 'Rabat-Salé-Kénitra', 'ordre' => 2]);

        // Villes (self association via parent_id to region)
        Parametre::create(['type' => 'VILLE', 'code' => 'CASABLANCA', 'libelle' => 'Casablanca', 'ordre' => 1, 'parent_id' => $regionCasa->id]);
        Parametre::create(['type' => 'VILLE', 'code' => 'SETTAT', 'libelle' => 'Settat', 'ordre' => 2, 'parent_id' => $regionCasa->id]);
        Parametre::create(['type' => 'VILLE', 'code' => 'RABAT_VILLE', 'libelle' => 'Rabat', 'ordre' => 1, 'parent_id' => $regionRabat->id]);
        Parametre::create(['type' => 'VILLE', 'code' => 'SALE', 'libelle' => 'Salé', 'ordre' => 2, 'parent_id' => $regionRabat->id]);

        // Etablissement
        Etablissement::firstOrCreate(['code' => 'ETAB01'], ['nom' => 'OFPPT Casablanca', 'adresse' => 'Casablanca']);
    }
}
