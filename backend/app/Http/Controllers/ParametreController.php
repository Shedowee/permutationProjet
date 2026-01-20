<?php

namespace App\Http\Controllers;

use App\Models\Parametre;
use Illuminate\Http\Request;

class ParametreController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');

        $query = Parametre::query()->where('actif', true)->orderBy('ordre');
        if ($type) {
            $query->where('type', $type);
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }
}

