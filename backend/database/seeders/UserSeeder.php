<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nom' => 'Super Admin',
            'email' => 'admin@ofppt.ma',
            'mot_de_passe' => Hash::make('Admin123!'), // ✅ bcrypt
            'role_id' => 1,
            'actif' => 1,
        ]);
    }
}
