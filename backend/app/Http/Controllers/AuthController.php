<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Services\EmailVerificationService;
use App\Events\UserActionOccurred;

class AuthController extends Controller
{
    protected EmailVerificationService $emailVerificationService;

    public function __construct(EmailVerificationService $emailVerificationService)
    {
        $this->emailVerificationService = $emailVerificationService;
    }

    public function signup(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs,email',
            'password' => 'required|string|min:6',
        ]);

        $role = \App\Models\Role::where('code', 'USER')->first();

        $user = User::create([
            'nom' => $validated['nom'],
            'email' => $validated['email'],
            'mot_de_passe' => Hash::make($validated['password']),
            'role_id' => $role?->id,
            'actif' => false,
            'email_verified' => false,
        ]);

        $code = $this->emailVerificationService->sendOtp($validated['email']);
        
        // Mocking email sending for now as per sendVerificationEmail logic
        $this->sendVerificationEmail($validated['email'], $code);

        event(new UserActionOccurred(
            $user->id,
            'registration',
            "Nouvel utilisateur enregistré: {$user->email}"
        ));

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

        $user = User::where('email', $validated['email'])->first();
        
        if (!$user || !$this->emailVerificationService->verifyOtp($validated['email'], $validated['code'])) {
            return response()->json(['message' => 'Code de confirmation invalide ou expiré'], 422);
        }

        $user->update([
            'actif' => true,
            'email_verified' => true,
            'email_verified_at' => now()
        ]);

        event(new UserActionOccurred(
            $user->id,
            'email_verified',
            "Email vérifié pour l'utilisateur: {$user->email}"
        ));

        return response()->json([
            'message' => 'Compte confirmé. Vous pouvez maintenant vous connecter.',
        ]);
    }

    public function resendCode(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        if ($user->email_verified) {
            return response()->json(['message' => 'Email déjà vérifié'], 422);
        }

        $code = $this->emailVerificationService->sendOtp($validated['email']);
        $this->sendVerificationEmail($validated['email'], $code);

        return response()->json(['message' => 'Nouveau code envoyé']);
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

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Utilisez ce lien pour réinitialiser votre mot de passe: " . config('app.frontend_url', 'http://localhost:5173') . "/reset-password?token=" . $token . "&email=" . urlencode($validated['email']),
                function ($message) use ($validated) {
                    $message->to($validated['email'])->subject('Réinitialisation du mot de passe');
                }
            );
        } catch (\Throwable $e) {}

        return response()->json(['message' => 'Si cet email correspond à un compte, un lien de réinitialisation sera envoyé.']);
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
            $user->update(['mot_de_passe' => Hash::make($validated['password'])]);
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

        $code = $this->emailVerificationService->sendOtp($user->email, 'email_verification');
        $this->sendVerificationEmail($user->email, $code);

        event(new UserActionOccurred(
            $user->id,
            'otp_resend',
            "Nouveau code de vérification envoyé à: {$user->email}"
        ));

        return response()->json(['message' => 'Un nouveau code a été envoyé.']);
    }

    public function verifyOtp(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'code' => 'required|string',
        ]);

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email déjà vérifié'], 422);
        }

        if (!$this->emailVerificationService->verifyOtp($user->email, $request->code, 'email_verification')) {
            return response()->json(['message' => 'Code de vérification invalide ou expiré'], 422);
        }

        $user->update([
            'actif' => true,
            'email_verified' => true,
            'email_verified_at' => now()
        ]);

        event(new UserActionOccurred(
            $user->id,
            'email_verified',
            "Email vérifié avec succès pour: {$user->email}"
        ));

        return response()->json(['message' => 'Email vérifié avec succès.']);
    }

    private function sendVerificationEmail($email, $code)
    {
        try {
            \Illuminate\Support\Facades\Mail::raw(
                'Votre code de confirmation OFPPT est: ' . $code,
                function ($message) use ($email) {
                    $message->to($email)->subject('Code de confirmation');
                }
            );
        } catch (\Throwable $e) {
            // ignore mail failures in dev; code is stored in cache
        }
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
                'nom'     => $user->nom,
                'email'   => $user->email,
                'role_id' => $user->role_id,
                'role'    => $user->role ? strtolower($user->role->code) : null,
                'actif'   => $user->actif,
                'email_verified_at' => $user->email_verified_at,
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
                'email_verified_at' => $user->email_verified_at,
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
        $user = Auth::user();

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Manually expire cookies
        $cookie = cookie(config('session.cookie'), '', -1);
        $xsrfCookie = cookie('XSRF-TOKEN', '', -1);

        if ($user) {
            event(new UserActionOccurred(
                $user->id,
                'logout',
                "Déconnexion réussie: {$user->email}"
            ));
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ])->withCookie($cookie)->withCookie($xsrfCookie);
    }
}
