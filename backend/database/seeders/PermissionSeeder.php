<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $resources = [
            'users',
            'roles',
            'permissions',
            'role_permissions',
            'admins',
            'formateurs',
            'commissions',
            'etablissements',
            'etablissement_formateur',
            'user_documents',
            'otps',
            'sessions',
            'personal_access_tokens',
            'notifications',
            'log_actions',
            'parametres',
            'permission_requests',
            'demandes',
        ];

        $permissions = [];
        foreach ($resources as $resource) {
            foreach (['read', 'create', 'update', 'delete'] as $action) {
                $name = "{$action}_{$resource}";
                $permissions[$name] = [
                    'name' => $name,
                    'description' => ucfirst($action) . " {$resource}",
                ];
            }
        }

        $workflow = [
            'approve_permission_requests' => 'Approve permission requests',
            'reject_permission_requests' => 'Reject permission requests',
            'approve_demandes' => 'Approve demandes',
            'reject_demandes' => 'Reject demandes',
        ];

        foreach ($workflow as $name => $description) {
            $permissions[$name] = [
                'name' => $name,
                'description' => $description,
            ];
        }

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                ['description' => $permission['description']]
            );
        }
    }
}
