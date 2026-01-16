<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Users;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = Users::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->mot_de_passe)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        Auth::login($user); // 🔥 THIS sets the HTTP-only session cookie

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
        ]);
    }

    // CURRENT USER
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }
}