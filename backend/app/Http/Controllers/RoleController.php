<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::query()
            ->with('permissions')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'role_category_id', 'description']);

        return response()->json(['data' => $roles]);
    }

    public function syncPermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $permissionIds = \App\Models\Permission::whereIn('name', $validated['permissions'])->pluck('id')->all();
        $role->permissions()->sync($permissionIds);

        return response()->json([
            'message' => 'Permissions mises à jour avec succès',
            'data' => $role->load('permissions'),
        ]);
    }
}
