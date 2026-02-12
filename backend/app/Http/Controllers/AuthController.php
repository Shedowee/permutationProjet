<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs,email',
            'password' => 'required|string|min:6',
        ]);

        $role = \App\Models\Role::where('code', 'USER')->first();

        $user = \App\Models\User::create([
            'nom' => $validated['nom'],
            'email' => $validated['email'],
            'mot_de_passe' => Hash::make($validated['password']),
            'role_id' => $role?->id,
            'actif' => false,
        ]);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        \Illuminate\Support\Facades\Cache::put('email_verif:' . $validated['email'], $code, now()->addMinutes(15));
        try {
            \Illuminate\Support\Facades\Mail::raw(
                'Votre code de confirmation OFPPT est: ' . $code,
                function ($message) use ($validated) {
                    $message->to($validated['email'])->subject('Code de confirmation');
                }
            );
        } catch (\Throwable $e) {
            // ignore mail failures in dev; code is stored in cache
        }

        \App\Models\LogAction::record(
            $user->id,
            'Création compte utilisateur',
            'utilisateurs',
            $user->id,
            $request->ip()
        );

        return response()->json([
            'message' => 'Compte créé. Un code a été envoyé à votre email.',
        ], 201);
    }

    public function confirm(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $user = \App\Models\User::where('email', $validated['email'])->first();
        $expected = \Illuminate\Support\Facades\Cache::get('email_verif:' . $validated['email']);
        if (!$user || !$expected || $expected !== $validated['code']) {
            return response()->json(['message' => 'Code de confirmation invalide'], 422);
        }

        \Illuminate\Support\Facades\Cache::forget('email_verif:' . $validated['email']);

        \App\Models\LogAction::record(
            $user->id,
            'Confirmation de compte',
            'utilisateurs',
            $user->id,
            $request->ip()
        );

        return response()->json(['message' => 'Compte confirmé. Vous pouvez maintenant vous connecter.']);
    }
    /**
     * Login user and set session cookie
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Fetch user by email
        $user = User::where('email', $request->email)->with('role')->first();

        if (!$user || !Hash::check($request->password, $user->mot_de_passe)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Log in user via session
        Auth::login($user);

        // Regenerate session to prevent fixation attacks
        $request->session()->regenerate();

        \App\Models\LogAction::record(
            $user->id,
            'Connexion',
            'utilisateurs',
            $user->id,
            $request->ip()
        );

        // Return safe user info to frontend
        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id'      => $user->id,
                'nom'     => $user->nom,
                'email'   => $user->email,
                'role_id' => $user->role_id,
                'role'    => $user->role ? strtolower($user->role->code) : null,
                'actif'   => $user->actif,
            ]
        ]);
    }

    /**
     * Return the currently authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }

        return response()->json([
            'user' => [
                'id'      => $user->id,
                'nom'     => $user->nom,
                'email'   => $user->email,
                'role_id' => $user->role_id,
                'role'    => $user->role ? strtolower($user->role->code) : null,
                'actif'   => $user->actif,
            ]
        ]);
    }

    /**
     * Logout the current user and clear session
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Manually expire cookies
        $cookie = cookie(config('session.cookie'), '', -1);
        $xsrfCookie = cookie('XSRF-TOKEN', '', -1);

        if ($request->user()) {
            \App\Models\LogAction::record(
                $request->user()->id,
                'Déconnexion',
                'utilisateurs',
                $request->user()->id,
                $request->ip()
            );
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ])->withCookie($cookie)->withCookie($xsrfCookie);
    }
}
