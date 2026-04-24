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
        $formateur = User::where('email', 'h.majdoub@ofppt.ma')->first();
        $commission = User::where('email', 'a.alaoui@ofppt.ma')->first();

        if ($admin) {
            $log = LogAction::create([
                'action' => 'Création utilisateur',
                'table_name' => 'users',
                'record_id' => $formateur?->id,
                'ip_address' => '127.0.0.1',
                'after' => ['description' => 'Création utilisateur'],
                'user_id' => $admin->id,
            ]);
            $log->forceFill(['created_at' => now()->subDays(15), 'updated_at' => now()->subDays(15)])->saveQuietly();
        }

        if ($formateur) {
            $log = LogAction::create([
                'action' => 'Soumission demande permutation',
                'table_name' => 'demande_permutations',
                'record_id' => 1,
                'ip_address' => '127.0.0.1',
                'after' => ['description' => 'Soumission demande permutation'],
                'user_id' => $formateur->id,
            ]);
            $log->forceFill(['created_at' => now()->subDays(10), 'updated_at' => now()->subDays(10)])->saveQuietly();
        }

        if ($commission) {
            $log = LogAction::create([
                'action' => 'Validation demande permutation',
                'table_name' => 'demande_permutations',
                'record_id' => 2,
                'ip_address' => '127.0.0.1',
                'after' => ['description' => 'Validation demande permutation'],
                'user_id' => $commission->id,
            ]);
            $log->forceFill(['created_at' => now()->subDays(5), 'updated_at' => now()->subDays(5)])->saveQuietly();
        }
    }
}
