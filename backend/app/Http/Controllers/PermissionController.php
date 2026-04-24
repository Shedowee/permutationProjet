<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $permissions = Permission::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return response()->json(['data' => $permissions]);
    }
}
