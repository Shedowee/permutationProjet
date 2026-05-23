<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Events\Registered;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Events\UserActionOccurred;
use App\Http\Controllers\Concerns\HandlesMailSending;

class AuthController extends Controller
{
    use HandlesMailSending;

    public function signup(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
            $role = \App\Models\Role::where('code', 'user')->first();

            return User::create([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password_hash' => Hash::make($validated['password']),
                'role_id' => $role?->id,
                'status' => 'pending',
            ]);
        });

        $verificationMailSent = true;

        $verificationMailSent = $this->sendMailSafely(
            fn () => event(new Registered($user)),
            'Verification email could not be sent during signup.',
            [
                'user_id' => $user->id,
                'email' => $user->email,
            ]
        );

        event(new UserActionOccurred(
            $user->id,
            'registration',
            "Nouvel utilisateur enregistré: {$user->email}",
            ['table_name' => 'users', 'record_id' => $user->id]
        ));

        return response()->json([
            'message' => $verificationMailSent
                ? 'Compte créé. Vérifiez votre boîte mail pour activer votre adresse email.'
                : 'Compte créé, mais l\'email de vérification n\'a pas pu être envoyé. Vérifiez la configuration mail ou demandez un renvoi.',
            'mail_sent' => $verificationMailSent,
        ], 201);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            // Pour des raisons de sécurité, ne pas confirmer si l'email existe ou non
            return response()->json(['message' => 'Si cet email correspond à un compte, un lien de réinitialisation sera envoyé.']);
        }

        $token = \Illuminate\Support\Str::random(64);
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validated['email']],
            ['token' => $token, 'created_at' => now()]
        );

        $mailSent = $this->sendMailSafely(
            function () use ($validated, $token) {
                \Illuminate\Support\Facades\Mail::raw(
                    "Utilisez ce lien pour réinitialiser votre mot de passe: " . config('app.frontend_url', 'http://localhost:5173') . "/reset-password?token=" . $token . "&email=" . urlencode($validated['email']),
                    function ($message) use ($validated) {
                        $message->to($validated['email'])->subject('Réinitialisation du mot de passe');
                    }
                );
            },
            'Reset password email could not be sent.',
            [
                'email' => $validated['email'],
            ]
        );

        return response()->json([
            'message' => 'Si cet email correspond à un compte, un lien de réinitialisation sera envoyé.',
            'mail_sent' => $mailSent,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $reset = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->where('token', $validated['token'])
            ->first();

        if (!$reset || now()->parse($reset->created_at)->addMinutes(60)->isPast()) {
            return response()->json(['message' => 'Lien invalide ou expiré'], 422);
        }

        $user = User::where('email', $validated['email'])->first();
        if ($user) {
            $user->update(['password_hash' => Hash::make($validated['password'])]);
        }

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    public function resendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email déjà vérifié'], 422);
        }

        $mailSent = $this->sendMailSafely(
            fn () => $user->sendEmailVerificationNotification(),
            'Verification email could not be resent for authenticated user.',
            [
                'user_id' => $user->id,
                'email' => $user->email,
            ]
        );

        event(new UserActionOccurred(
            $user->id,
            'email_verification_resent',
            "Nouveau lien de vérification envoyé à: {$user->email}"
        ));

        return response()->json([
            'message' => 'Un nouveau lien de vérification a été envoyé.',
            'mail_sent' => $mailSent,
        ]);
    }

    public function resendVerificationLink(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email déjà vérifié'], 422);
        }

        $mailSent = $this->sendMailSafely(
            fn () => $user->sendEmailVerificationNotification(),
            'Verification email could not be sent to a newly provided email address.',
            [
                'user_id' => $user->id,
                'email' => $user->email,
            ]
        );

        return response()->json([
            'message' => 'Un nouveau lien de vérification a été envoyé.',
            'mail_sent' => $mailSent,
        ]);
    }

    /**
     * Normalize role name for frontend
     */
    private function normalizeRole($roleName)
    {
        if (!$roleName) return null;

        $mapping = [
            'admin' => 'admin',
            'administrateur' => 'admin',
            'commission' => 'commission',
            'membre de commission' => 'commission',
            'formateur' => 'formateur',
            'user' => 'user',
            'utilisateur standard' => 'user',
        ];

        $lower = strtolower($roleName);
        return $mapping[$lower] ?? $lower;
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
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        // 1. Try to find the user by email or employee_number
        $user = User::where('email', $request->email)
            ->orWhere(function($query) use ($request) {
                $query->whereHas('formateur', function($q) use ($request) {
                    $q->where('employee_number', $request->email);
                });
            })
            ->with(['role.permissions', 'formateur.etablissement.ville.region', 'formateur.etablissements'])
            ->first();

        // 2. If user not found, return specific error
        if (!$user) {
            return response()->json([
                'message' => 'Email ou matricule incorrect.',
                'error_code' => 'IDENTIFIER_NOT_FOUND',
                'field' => 'email'
            ], 401);
        }

        // 3. If user found, verify password
        if (!Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'message' => 'Mot de passe incorrect.',
                'error_code' => 'INVALID_PASSWORD',
                'field' => 'password'
            ], 401);
        }

        // 4. Block only explicitly suspended/inactive accounts.
        if ($user->isBlockedAccount()) {
            return response()->json([
                'message' => 'Votre compte est suspendu ou désactivé.',
                'error_code' => 'ACCOUNT_BLOCKED'
            ], 403);
        }

        // 5. Proceed with login
        Auth::login($user);

        // Regenerate session to prevent fixation attacks
        $request->session()->regenerate();

        event(new UserActionOccurred(
            $user->id,
            'login',
            "Connexion réussie: {$user->email}"
        ));

        // Return safe user info to frontend
        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id'      => $user->id,
                'name'    => $user->name,
                'nom'     => $user->name,
                'email'   => $user->email,
                'role_id' => $user->role_id,
                'role'    => $this->normalizeRole($user->role?->code ?? $user->role?->name),
                'permissions' => $user->permissions,
                'status'  => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'phone'   => $user->phone,
                'age'     => $user->age,
                'address' => $user->address,
                'photo_url' => $user->photo_url,
                'created_at' => $user->created_at,
                'formateur' => $user->formateur ? [
                    'id' => $user->formateur->id,
                    'employee_number' => $user->formateur->employee_number,
                    'position' => $user->formateur->position,
                    'specialite' => $user->formateur->specialite,
                    'establishment_id' => $user->formateur->establishment_id,
                    'etablissement' => $user->formateur->etablissement ? [
                        'id' => $user->formateur->etablissement->id,
                        'name' => $user->formateur->etablissement->name,
                        'ville' => $user->formateur->etablissement->ville ? [
                            'id' => $user->formateur->etablissement->ville->id,
                            'key' => $user->formateur->etablissement->ville->key,
                            'value' => $user->formateur->etablissement->ville->value,
                            'region' => $user->formateur->etablissement->ville->region ? [
                                'id' => $user->formateur->etablissement->ville->region->id,
                                'key' => $user->formateur->etablissement->ville->region->key,
                                'value' => $user->formateur->etablissement->ville->region->value,
                            ] : null,
                        ] : null,
                    ] : null,
                    'etablissements' => $user->formateur->etablissements?->map(fn ($e) => [
                        'id' => $e->id,
                        'name' => $e->name,
                    ])->values()->all() ?? [],
                ] : null,
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
            $user->load('role.permissions');
        }

        return response()->json([
            'user' => [
                'id'      => $user->id,
                'name'    => $user->name,
                'nom'     => $user->name,
                'email'   => $user->email,
                'role_id' => $user->role_id,
                'role'    => $this->normalizeRole($user->role?->code ?? $user->role?->name),
                'permissions' => $user->permissions,
                'status'  => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'phone'   => $user->phone,
                'age'     => $user->age,
                'address' => $user->address,
                'photo_url' => $user->photo_url,
                'created_at' => $user->created_at,
                'formateur' => $user->formateur ? [
                    'id' => $user->formateur->id,
                    'employee_number' => $user->formateur->employee_number,
                    'position' => $user->formateur->position,
                    'specialite' => $user->formateur->specialite,
                    'establishment_id' => $user->formateur->establishment_id,
                    'etablissement' => $user->formateur->etablissement ? [
                        'id' => $user->formateur->etablissement->id,
                        'name' => $user->formateur->etablissement->name,
                        'ville' => $user->formateur->etablissement->ville ? [
                            'id' => $user->formateur->etablissement->ville->id,
                            'key' => $user->formateur->etablissement->ville->key,
                            'value' => $user->formateur->etablissement->ville->value,
                            'region' => $user->formateur->etablissement->ville->region ? [
                                'id' => $user->formateur->etablissement->ville->region->id,
                                'key' => $user->formateur->etablissement->ville->region->key,
                                'value' => $user->formateur->etablissement->ville->region->value,
                            ] : null,
                        ] : null,
                    ] : null,
                    'etablissements' => $user->formateur->etablissements?->map(fn ($e) => [
                        'id' => $e->id,
                        'name' => $e->name,
                    ])->values()->all() ?? [],
                ] : null,
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
        $user = $request->user();

        // 1. Clear Sanctum tokens if used
        if ($user instanceof User) {
            $user->tokens()->delete();
        }

        // 2. Clear Session and Auth state
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // 3. Clear Remember Token if used
        if ($user instanceof User) {
            $user->setRememberToken(null);
            $user->save();
        }

        if ($user) {
            event(new UserActionOccurred(
                $user->id,
                'logout',
                "Déconnexion réussie: {$user->email}"
            ));
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
