<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('code', 'ADMIN')->first();
        $employeRole = Role::where('code', 'EMPLOYE')->first();
        $commissionRole = Role::where('code', 'COMISSION')->first();

        User::firstOrCreate(['username' => 'admin'], [
            'username' => 'admin',
            'nom' => 'Administrateur',
            'email' => 'admin@ofppt.ma',
            'mot_de_passe' => Hash::make('Admin123!'),
            'role_id' => $adminRole?->id,
            'actif' => 1,
        ]);

        User::firstOrCreate(['username' => 'employe1'], [
            'username' => 'employe1',
            'nom' => 'Employe Exemple',
            'email' => 'employe@ofppt.ma',
            'mot_de_passe' => Hash::make('Employe123!'),
            'role_id' => $employeRole?->id,
            'actif' => 1,
        ]);

        User::firstOrCreate(['username' => 'commission1'], [
            'username' => 'commission1',
            'nom' => 'Membre Commission',
            'email' => 'commission@ofppt.ma',
            'mot_de_passe' => Hash::make('Commission123!'),
            'role_id' => $commissionRole?->id,
            'actif' => 1,
        ]);
    }
}
