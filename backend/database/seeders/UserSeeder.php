<?php

// database/seeders/UserSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nom' => 'Super Admin',
            'email' => 'admin@ofppt.ma',
            'mot_de_passe' => 'Admin123!', // will be hashed automatically
            'role_id' => 1,
            'actif' => 1,
        ]);
    }
}