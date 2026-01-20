<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employe;
use App\Models\User;
use App\Models\Parametre;
use App\Models\Etablissement;

class EmployeSeeder extends Seeder
{
    public function run(): void
    {
        $employeUser = User::where('email', 'employe@ofppt.ma')->first();
        $gradeA = Parametre::where('type', 'GRADE')->where('code', 'A')->first();
        $regionCasa = Parametre::where('type', 'REGION')->where('code', 'CASA')->first();
        $etab = Etablissement::where('code', 'ETAB01')->first();

        if ($employeUser && $gradeA && $regionCasa && $etab) {
            Employe::firstOrCreate(
                ['cin' => 'AA123456'],
                [
                    'matricule' => 'M001',
                    'nom' => 'Employe',
                    'prenom' => 'Exemple',
                    'date_recrutement' => now()->subYears(3)->toDateString(),
                    'user_id' => $employeUser->id,
                    'grade_id' => $gradeA->id,
                    'region_id' => $regionCasa->id,
                    'etablissement_id' => $etab->id,
                ]
            );
        }
    }
}
