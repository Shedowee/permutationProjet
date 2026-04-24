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
            RoleCategorySeeder::class,  // Role groupings
            RoleSeeder::class,          // Roles (Admin, Commission, Formateur, User)
            PermissionSeeder::class,    // CRUD permissions + workflow permissions
            RolePermissionSeeder::class, // Role-permission mapping
            ParametreSeeder::class,     // Basic states, grades, regions, cities, and initial etablissements
            UserSeeder::class,           // Users with roles
            FormateurSeeder::class,      // Formateur professional profiles
            AdminSeeder::class,           // Admin profile assignment
            CommissionSeeder::class,      // Commission profile + jurisdictions
            PermissionRequestSeeder::class, // Sample permission workflow records
            DemandePermutationSeeder::class, // Sample requests
            PermutationMarketSeeder::class,  // Available and reciprocal demandes
        ]);
    }
}
