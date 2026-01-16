<?php
// database/seeders/RoleSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create(['libelle' => 'Admin', 'code' => 'ADMIN', 'role_category_id' => 1]);
        Role::create(['libelle' => 'Commission', 'code' => 'COMMISSION', 'role_category_id' => 2]);
          Role::create(['libelle' => 'Employé', 'code' => 'EMPLOYE', 'role_category_id' => 3]);
    }
}