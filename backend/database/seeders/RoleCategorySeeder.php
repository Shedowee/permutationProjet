<?php
// database/seeders/RoleCategorySeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoleCategory;

class RoleCategorySeeder extends Seeder
{
    public function run(): void
    {
        RoleCategory::firstOrCreate(['name' => 'ADMIN'], ['description' => 'Administration roles']);
        RoleCategory::firstOrCreate(['name' => 'METIER'], ['description' => 'Business roles']);
    }
}
