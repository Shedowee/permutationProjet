<?php
// database/seeders/RoleCategorySeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoleCategory;

class RoleCategorySeeder extends Seeder
{
    public function run(): void
    {
        RoleCategory::firstOrCreate(['code' => 'ADMIN'], ['libelle' => 'Administration']);
        RoleCategory::firstOrCreate(['code' => 'METIER'], ['libelle' => 'Métier']);
    }
}
