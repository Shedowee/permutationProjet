<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ParametreController;
use App\Http\Controllers\EtablissementController;
use App\Http\Controllers\FormateurController;
use App\Http\Controllers\DemandePermutationController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UtilisateursController;
use App\Http\Controllers\AdminStatsController;
use App\Http\Controllers\LogsController;

// Public endpoints - CSRF protected by EnsureFrontendRequestsAreStateful middleware
Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/resend-verification-link', [AuthController::class, 'resendVerificationLink']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected endpoints - require authentication
Route::middleware(['auth:sanctum', 'check.role'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:3,60');

    // Profile & Notifications (Always accessible if authenticated)
    Route::get('/notifications', [UtilisateursController::class, 'getNotifications']);
    Route::get('/notifications/unread-count', [UtilisateursController::class, 'getUnreadNotificationsCount']);
    Route::get('/notifications/{notification}', [UtilisateursController::class, 'getNotification']);
    Route::put('/notifications/{notification}/read', [UtilisateursController::class, 'markNotificationRead']);
    Route::delete('/notifications', [UtilisateursController::class, 'clearNotifications']);
    
    Route::put('/user/profile', [UtilisateursController::class, 'updateProfile']);
    Route::put('/user/password', [UtilisateursController::class, 'updatePassword']);
    Route::put('/user/email', [UtilisateursController::class, 'updateEmail']);
    Route::post('/user/profile-picture', [UtilisateursController::class, 'updateProfilePicture']);

    Route::middleware('verified')->group(function () {
        // Parametres
        Route::get('/parametres', [ParametreController::class, 'index'])->middleware('permission:read_parametres');
        Route::get('/parametres/regions/{regionId}/cities', [ParametreController::class, 'getCitiesByRegion'])->middleware('permission:read_parametres');
        Route::post('/parametres', [ParametreController::class, 'store'])->middleware('permission:create_parametres');
        Route::put('/parametres/{parametre}', [ParametreController::class, 'update'])->middleware('permission:update_parametres');
        Route::delete('/parametres/{parametre}', [ParametreController::class, 'destroy'])->middleware('permission:delete_parametres');

        // Etablissements
        Route::get('/etablissements', [EtablissementController::class, 'index'])->middleware('permission:read_etablissements');
        Route::post('/etablissements', [EtablissementController::class, 'store'])->middleware('permission:create_etablissements');
        Route::get('/etablissements/cities/{cityId}', [EtablissementController::class, 'getByCity'])->middleware('permission:read_etablissements');
        Route::put('/etablissements/{etablissement}', [EtablissementController::class, 'update'])->middleware('permission:update_etablissements');
        Route::delete('/etablissements/{etablissement}', [EtablissementController::class, 'destroy'])->middleware('permission:delete_etablissements');

        // Formateur
        Route::get('/formateur/me', [FormateurController::class, 'me'])->middleware('permission:read_formateurs');
        Route::get('/formateurs', [FormateurController::class, 'index'])->middleware('permission:read_formateurs');
        Route::get('/formateurs/{id}', [FormateurController::class, 'show'])->middleware('permission:read_formateurs');

        // Demandes
        Route::get('/demandes', [DemandePermutationController::class, 'index'])->middleware('permission:read_demandes');
        Route::post('/demandes', [DemandePermutationController::class, 'store'])->middleware('permission:create_demandes');
        Route::get('/demandes/{demande}', [DemandePermutationController::class, 'show'])->middleware('permission:read_demandes');
        Route::put('/demandes/{demande}', [DemandePermutationController::class, 'update']);
        Route::delete('/demandes/{demande}', [DemandePermutationController::class, 'destroy']);
        Route::get('/demandes/matches', [DemandePermutationController::class, 'matches'])->middleware('permission:approve_demandes');

        // Roles
        Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:read_roles');
        Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:read_permissions');
        Route::patch('/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->middleware('permission:update_role_permissions');

        // Users
        Route::get('/users', [UtilisateursController::class, 'index'])->middleware('permission:read_users');
        Route::post('/users', [UtilisateursController::class, 'store'])->middleware('permission:create_users');
        Route::get('/users/{id}', [UtilisateursController::class, 'show'])->middleware('permission:read_users');
        Route::put('/users/{user}', [UtilisateursController::class, 'update'])->middleware('permission:update_users');
        Route::delete('/users/{user}', [UtilisateursController::class, 'destroy'])->middleware('permission:delete_users');

        Route::get('/user/documents', [UtilisateursController::class, 'listDocuments'])->middleware('permission:read_user_documents');
        Route::post('/user/documents', [UtilisateursController::class, 'uploadDocument'])->middleware('permission:create_user_documents');
        Route::delete('/user/documents/{document}', [UtilisateursController::class, 'deleteDocument'])->middleware('permission:delete_user_documents');

        // Logs
        Route::get('/logs', [LogsController::class, 'index'])->middleware('permission:read_log_actions');
        Route::get('/logs/{log}', [LogsController::class, 'show'])->middleware('permission:read_log_actions');
        Route::get('/admin/stats', [AdminStatsController::class, 'index']);

    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
