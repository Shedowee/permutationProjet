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

// Protected endpoints - require authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Parametres
    Route::get('/parametres', [ParametreController::class, 'index']);

    // Etablissements
    Route::get('/etablissements', [EtablissementController::class, 'index']);
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
    Route::put('/users/{user}', [UtilisateursController::class, 'update']);
    Route::delete('/users/{user}', [UtilisateursController::class, 'destroy']);

    // Logs
    Route::get('/logs', [LogsController::class, 'index']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
