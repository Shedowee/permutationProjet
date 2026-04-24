<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('code', 'admin')->first();
        $commissionRole = Role::where('code', 'commission')->first();
        $formateurRole = Role::where('code', 'formateur')->first();
        $userRole = Role::where('code', 'user')->first();

        // 1. Admin
        User::updateOrCreate(
            ['email' => 'admin@ofppt.ma'],
            [
                'uuid' => Str::uuid(),
                'name' => 'System Administrator',
                'password_hash' => Hash::make('Admin123!'),
                'role_id' => $adminRole?->id,
                'status' => 'actif',
                'email_verified_at' => now(),
                'age' => 41,
                'address' => 'Rabat, Maroc',
            ]
        );

        // 2. Commission Members
        $commissionMembers = [
            ['name' => 'Ahmed Alaoui', 'email' => 'a.alaoui@ofppt.ma'],
            ['name' => 'Fatima Zahra', 'email' => 'f.zahra@ofppt.ma'],
        ];

        foreach ($commissionMembers as $member) {
            User::updateOrCreate(
                ['email' => $member['email']],
                [
                'uuid' => Str::uuid(),
                'name' => $member['name'],
                'password_hash' => Hash::make('Commission123!'),
                'role_id' => $commissionRole?->id,
                'status' => 'actif',
                    'email_verified_at' => now(),
                    'age' => 38,
                    'address' => 'Casablanca, Maroc',
                ]
            );
        }

        // 3. Formateur Users
        $formateurs = [
            ['name' => 'Hamza Majdoub', 'email' => 'h.majdoub@ofppt.ma'],
            ['name' => 'Sami Mansouri', 'email' => 's.mansouri@ofppt.ma'],
            ['name' => 'Yassine Benani', 'email' => 'y.benani@ofppt.ma'],
            ['name' => 'Meriam El Amrani', 'email' => 'm.amrani@ofppt.ma'],
        ];

        foreach ($formateurs as $form) {
            User::updateOrCreate(
                ['email' => $form['email']],
                [
                'uuid' => Str::uuid(),
                'name' => $form['name'],
                'password_hash' => Hash::make('Formateur123!'),
                'role_id' => $formateurRole?->id,
                'status' => 'actif',
                'email_verified_at' => now(),
                'age' => 35,
                'address' => 'Marrakech, Maroc',
            ]
            );
        }

        User::updateOrCreate(
            ['email' => 'user@ofppt.ma'],
            [
                'uuid' => Str::uuid(),
                'name' => 'Basic User',
                'password_hash' => Hash::make('User123!'),
                'role_id' => $userRole?->id,
                'status' => 'actif',
                'email_verified_at' => now(),
                'age' => 29,
                'address' => 'Fès, Maroc',
            ]
        );

        User::updateOrCreate(
            ['email' => 'unassigned.user@ofppt.ma'],
            [
                'uuid' => Str::uuid(),
                'name' => 'Unassigned User',
                'password_hash' => Hash::make('Profile123!'),
                'role_id' => null,
                'status' => 'actif',
                'email_verified_at' => now(),
                'age' => 26,
                'address' => 'Tanger, Maroc',
            ]
        );
    }
}
