<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ParametreController;
use App\Http\Controllers\EtablissementController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\DemandePermutationController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UtilisateursController;
use App\Http\Controllers\LogsController;

// Public endpoints - CSRF protected by EnsureFrontendRequestsAreStateful middleware
Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/confirm', [AuthController::class, 'confirm']);
Route::post('/resend-code', [AuthController::class, 'resendCode']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected endpoints - require authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:3,60');
    Route::post('/email/verify', [AuthController::class, 'verifyOtp']);

    // Profile & Notifications (Always accessible if authenticated)
    Route::get('/notifications', [UtilisateursController::class, 'getNotifications']);
    Route::put('/notifications/{notification}/read', [UtilisateursController::class, 'markNotificationRead']);
    Route::get('/notifications/unread-count', [UtilisateursController::class, 'getUnreadNotificationsCount']);
    
    Route::put('/user/profile', [UtilisateursController::class, 'updateProfile']);
    Route::put('/user/password', [UtilisateursController::class, 'updatePassword']);
    Route::put('/user/email', [UtilisateursController::class, 'updateEmail']);
    Route::post('/user/email/verify', [UtilisateursController::class, 'verifyNewEmail']);
    Route::post('/user/profile-picture', [UtilisateursController::class, 'updateProfilePicture']);

    // Routes restricted for 'USER' role and verified users
    Route::middleware(['check.role', 'verified'])->group(function () {
        // Parametres
        Route::get('/parametres', [ParametreController::class, 'index']);
        Route::get('/parametres/regions/{regionId}/cities', [ParametreController::class, 'getCitiesByRegion']);
        Route::post('/parametres', [ParametreController::class, 'store']);
        Route::put('/parametres/{parametre}', [ParametreController::class, 'update']);
        Route::delete('/parametres/{parametre}', [ParametreController::class, 'destroy']);

        // Etablissements
        Route::get('/etablissements', [EtablissementController::class, 'index']);
        Route::get('/etablissements/cities/{cityId}', [EtablissementController::class, 'getByCity']);
        Route::put('/etablissements/{etablissement}', [EtablissementController::class, 'update']);

        // Employe
        Route::get('/employe/me', [EmployeController::class, 'me']);

        // Demandes
        Route::get('/demandes', [DemandePermutationController::class, 'index']);
        Route::post('/demandes', [DemandePermutationController::class, 'store']);
        Route::put('/demandes/{demande}', [DemandePermutationController::class, 'update']);

        // Roles
        Route::get('/roles', [RoleController::class, 'index']);

        // Users
        Route::get('/users', [UtilisateursController::class, 'index']);
        Route::post('/users', [UtilisateursController::class, 'store']);
        Route::get('/users/{id}', [UtilisateursController::class, 'show']);
        Route::put('/users/{user}', [UtilisateursController::class, 'update']);
        Route::delete('/users/{user}', [UtilisateursController::class, 'destroy']);

        Route::get('/user/documents', [UtilisateursController::class, 'listDocuments']);
        Route::post('/user/documents', [UtilisateursController::class, 'uploadDocument']);
        Route::delete('/user/documents/{document}', [UtilisateursController::class, 'deleteDocument']);

        // Logs
        Route::get('/logs', [LogsController::class, 'index']);
        Route::get('/logs/{log}', [LogsController::class, 'show']);
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
