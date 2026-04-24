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
        $adminCat = RoleCategory::where('name', 'ADMIN')->first();
        $metierCat = RoleCategory::where('name', 'METIER')->first();

        $roles = [
            ['name' => 'admin', 'code' => 'admin', 'role_category_id' => $adminCat?->id, 'description' => 'Administration system-wide'],
            ['name' => 'commission', 'code' => 'commission', 'role_category_id' => $metierCat?->id, 'description' => 'Commission reviewer'],
            ['name' => 'user', 'code' => 'user', 'role_category_id' => $metierCat?->id, 'description' => 'Basic user'],
            ['name' => 'formateur', 'code' => 'formateur', 'role_category_id' => $metierCat?->id, 'description' => 'Trainer'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['code' => $role['code']],
                $role
            );
        }
    }
}
