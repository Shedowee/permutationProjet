<?php
// database/seeders/RoleSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\RoleCategory;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $adminCat = RoleCategory::where('code', 'ADMIN')->first();
        $metierCat = RoleCategory::where('code', 'METIER')->first();

        Role::firstOrCreate(['code' => 'ADMIN'], ['libelle' => 'Admin', 'role_category_id' => $adminCat?->id]);
        Role::firstOrCreate(['code' => 'EMPLOYE'], ['libelle' => 'Employé', 'role_category_id' => $metierCat?->id]);
        Role::firstOrCreate(['code' => 'COMISSION'], ['libelle' => 'Commission', 'role_category_id' => $metierCat?->id]);
    }
}
