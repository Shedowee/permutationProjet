<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::query()
            ->orderBy('libelle')
            ->get(['id', 'code', 'libelle', 'role_category_id']);

        return response()->json(['data' => $roles]);
    }
}

