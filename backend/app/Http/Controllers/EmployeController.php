<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmployeController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        $employe = Employe::with(['grade', 'region', 'etablissement'])
            ->where('user_id', $user->id)
            ->first();

        if (!$employe) {
            return response()->json(['message' => 'Employe not found'], 404);
        }

        return response()->json(['data' => $employe]);
    }
}

