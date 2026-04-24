<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Commission;
use App\Models\User;

class CommissionSeeder extends Seeder
{
    public function run(): void
    {
        $assign = [
            'a.alaoui@ofppt.ma' => [
                'jurisdiction' => 'CASABLANCA_SETTAT',
            ],
            'f.zahra@ofppt.ma' => [
                'jurisdiction' => 'RABAT_SALE_KENITRA',
            ],
        ];

        foreach ($assign as $email => $conf) {
            $user = User::where('email', $email)->first();
            if (!$user) continue;

            Commission::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'commission_name' => 'Commission Régionale',
                    'jurisdiction' => $conf['jurisdiction'],
                    'metadata' => [],
                ]
            );
        }
    }
}
