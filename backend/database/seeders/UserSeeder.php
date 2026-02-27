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
        $commissionRole = Role::where('code', 'COMMISSION')->first();
        $employeRole = Role::where('code', 'EMPLOYE')->first();

        // 1. Admin
        User::updateOrCreate(
            ['email' => 'admin@ofppt.ma'],
            [
                'nom' => 'System Administrator',
                'username' => 'admin',
                'mot_de_passe' => Hash::make('Admin123!'),
                'role_id' => $adminRole?->id,
                'actif' => true,
                'email_verified_at' => now(),
            ]
        );

        // 2. Commission Members
        $commissionMembers = [
            ['nom' => 'Ahmed Alaoui', 'email' => 'a.alaoui@ofppt.ma'],
            ['nom' => 'Fatima Zahra', 'email' => 'f.zahra@ofppt.ma'],
        ];

        foreach ($commissionMembers as $member) {
            User::updateOrCreate(
                ['email' => $member['email']],
                [
                    'nom' => $member['nom'],
                    'username' => explode('@', $member['email'])[0],
                    'mot_de_passe' => Hash::make('Commission123!'),
                    'role_id' => $commissionRole?->id,
                    'actif' => true,
                    'email_verified_at' => now(),
                ]
            );
        }

        // 3. Employee Users (Account only, details in EmployeeSeeder)
        $employees = [
            ['nom' => 'Hamza Majdoub', 'email' => 'h.majdoub@ofppt.ma'],
            ['nom' => 'Sami Mansouri', 'email' => 's.mansouri@ofppt.ma'],
            ['nom' => 'Yassine Benani', 'email' => 'y.benani@ofppt.ma'],
            ['nom' => 'Meriam El Amrani', 'email' => 'm.amrani@ofppt.ma'],
        ];

        foreach ($employees as $emp) {
            User::updateOrCreate(
                ['email' => $emp['email']],
                [
                    'nom' => $emp['nom'],
                    'username' => explode('@', $emp['email'])[0],
                    'mot_de_passe' => Hash::make('Employe123!'),
                    'role_id' => $employeRole?->id,
                    'actif' => true,
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
