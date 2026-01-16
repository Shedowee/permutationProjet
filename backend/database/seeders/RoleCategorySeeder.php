<?php
// database/seeders/RoleCategorySeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoleCategory;

class RoleCategorySeeder extends Seeder
{
    public function run(): void
    {
        RoleCategory::create(['libelle' => 'Admin Category', 'code' => 'ADMIN']);
        RoleCategory::create(['libelle' => 'Commission Category', 'code' => 'COMMISSION']);
         RoleCategory::create(['libelle' => 'Employé Category', 'code' => 'EMPLOYE']);
    }
}