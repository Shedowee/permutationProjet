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
        $grades = Parametre::where('type', 'GRADE')->pluck('id', 'code');
        $establishments = Etablissement::pluck('id', 'code');

        $employeeData = [
            'h.majdoub@ofppt.ma' => [
                'matricule' => 'M001',
                'cin' => 'AB123456',
                'grade_code' => 'A',
                'etab_code' => 'ISTA_MAARIF',
                'date_recrutement' => '2018-09-01',
            ],
            's.mansouri@ofppt.ma' => [
                'matricule' => 'M002',
                'cin' => 'CD789012',
                'grade_code' => 'B',
                'etab_code' => 'ISTA_SALE_TABRIQUET',
                'date_recrutement' => '2019-03-15',
            ],
            'y.benani@ofppt.ma' => [
                'matricule' => 'M003',
                'cin' => 'EF345678',
                'grade_code' => 'A',
                'etab_code' => 'ISTA_FES_ADARIS',
                'date_recrutement' => '2020-01-10',
            ],
            'm.amrani@ofppt.ma' => [
                'matricule' => 'M004',
                'cin' => 'GH901234',
                'grade_code' => 'B',
                'etab_code' => 'ISTA_MARRAKECH_GUELIZ',
                'date_recrutement' => '2021-11-20',
            ],
        ];

        foreach ($employeeData as $email => $data) {
            $user = User::where('email', $email)->first();
            if (!$user) continue;

            $etab = Etablissement::where('code', $data['etab_code'])->first();
            if (!$etab) continue;

            Employe::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'matricule' => $data['matricule'],
                    'cin' => $data['cin'],
                    'grade_id' => $grades[$data['grade_code']] ?? null,
                    'etablissement_id' => $etab->id,
                    'region_id' => $etab->region_id,
                    'date_recrutement' => $data['date_recrutement'],
                ]
            );
        }
    }
}
