<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = Role::all()->keyBy('code');
        $permissions = Permission::all()->keyBy('name');

        $allPermissions = $permissions->keys()->all();
        $map = [
            'admin' => array_values(array_diff($allPermissions, [
                'create_demandes',
                'read_demandes',
                'update_demandes',
                'approve_demandes',
                'reject_demandes',
                'create_permission_requests',
            ])),
            'commission' => [
                'read_users',
                'read_roles',
                'read_permissions',
                'read_role_permissions',
                'read_formateurs',
                'read_commissions',
                'read_etablissements',
                'read_etablissement_formateur',
                'read_user_documents',
                'read_notifications',
                'read_log_actions',
                'read_parametres',
                'read_permission_requests',
                'create_permission_requests',
                'approve_permission_requests',
                'reject_permission_requests',
                'read_demandes',
                'approve_demandes',
                'reject_demandes',
            ],
            'formateur' => [
                'read_etablissements',
                'read_parametres',
                'read_formateurs',
                'read_notifications',
                'read_user_documents',
                'create_user_documents',
                'delete_user_documents',
                'read_permission_requests',
                'create_permission_requests',
                'read_demandes',
                'create_demandes',
            ],
            'user' => [
                // Basic users only access their authenticated profile and notifications UI.
            ],
        ];

        foreach ($map as $roleCode => $permissionNames) {
            $role = $roles->get($roleCode);
            if (!$role) {
                continue;
            }

            $ids = collect($permissionNames)
                ->filter(fn ($name) => isset($permissions[$name]))
                ->map(fn ($name) => $permissions[$name]->id)
                ->values()
                ->all();

            $role->permissions()->sync($ids);
        }
    }
}
