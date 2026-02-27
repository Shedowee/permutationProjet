<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ParametreSeeder::class,     // Basic states & grades
            MoroccanGeoSeeder::class,   // Regions & Cities
            RoleCategorySeeder::class,  // Role groupings
            RoleSeeder::class,          // Roles (Admin, Commission, Employe)
            EtablissementSeeder::class,    // Establishments linked to cities
            UserSeeder::class,           // Users with roles
            EmployeSeeder::class,        // Employee professional profiles
            DemandePermutationSeeder::class, // Sample requests
        ]);
    }
}
