<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LogAction;
use App\Models\User;

class LogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@ofppt.ma')->first();
        $employe = User::where('email', 'employe@ofppt.ma')->first();
        $commission = User::where('email', 'commission@ofppt.ma')->first();

        if ($admin) {
            LogAction::create([
                'action' => 'Création utilisateur',
                'entite' => 'utilisateurs',
                'entite_id' => $employe?->id,
                'date_action' => now()->subDays(15),
                'adresse_ip' => '127.0.0.1',
                'user_id' => $admin->id,
            ]);
        }

        if ($employe) {
            LogAction::create([
                'action' => 'Soumission demande permutation',
                'entite' => 'demande_permutations',
                'entite_id' => 1,
                'date_action' => now()->subDays(10),
                'adresse_ip' => '127.0.0.1',
                'user_id' => $employe->id,
            ]);
        }

        if ($commission) {
            LogAction::create([
                'action' => 'Validation demande permutation',
                'entite' => 'demande_permutations',
                'entite_id' => 2,
                'date_action' => now()->subDays(5),
                'adresse_ip' => '127.0.0.1',
                'user_id' => $commission->id,
            ]);
        }
    }
}
