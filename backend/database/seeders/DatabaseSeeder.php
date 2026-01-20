<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleCategorySeeder::class,
            RoleSeeder::class,
            ParametreSeeder::class,
            MoroccanGeoSeeder::class,
            UserSeeder::class,
            EmployeSeeder::class,
            DemandePermutationSeeder::class,
            LogSeeder::class,
        ]);
    }
}
