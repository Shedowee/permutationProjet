<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Formateur;
use App\Models\User;
use App\Models\Etablissement;

class FormateurSeeder extends Seeder
{
    public function run(): void
    {
        $formateurData = [
            'h.majdoub@ofppt.ma' => [
                'employee_number' => 'M001',
                'position' => 'Formateur Permanent',
                'hire_date' => '2018-09-01',
                'salary' => 8500.00,
            ],
            's.mansouri@ofppt.ma' => [
                'employee_number' => 'M002',
                'position' => 'Formateur Contractuel',
                'hire_date' => '2019-03-15',
                'salary' => 7800.00,
            ],
            'y.benani@ofppt.ma' => [
                'employee_number' => 'M003',
                'position' => 'Chef de Travaux',
                'hire_date' => '2020-01-10',
                'salary' => 9200.00,
            ],
            'm.amrani@ofppt.ma' => [
                'employee_number' => 'M004',
                'position' => 'Formateur Permanent',
                'hire_date' => '2021-11-20',
                'salary' => 8200.00,
            ],
        ];

        $assignments = [
            'h.majdoub@ofppt.ma' => 'ISTA MAARIF',
            's.mansouri@ofppt.ma' => 'ISTA SALE TABRIQUET',
            'y.benani@ofppt.ma' => 'ISTA TANGER 1',
            'm.amrani@ofppt.ma' => 'ISTA HAY RIAD',
        ];

        foreach ($formateurData as $email => $data) {
            $user = User::where('email', $email)->first();
            if (!$user) continue;

            $targetName = $assignments[$email] ?? null;
            $etab = $targetName 
                ? Etablissement::where('name', $targetName)->first() 
                : Etablissement::inRandomOrder()->first();

            Formateur::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_number' => $data['employee_number'],
                    'position' => $data['position'],
                    'hire_date' => $data['hire_date'],
                    'salary' => $data['salary'],
                    'establishment_id' => $etab?->id,
                ]
            );

            if ($etab) {
                $formateur = Formateur::where('user_id', $user->id)->first();
                if ($formateur) {
                    $formateur->etablissements()->syncWithoutDetaching([$etab->id]);
                }
            }
        }
    }
}
