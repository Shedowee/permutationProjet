<?php

use Illuminate\Foundation\Application;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function ($middleware): void {

        // ✅ API middleware for session + Sanctum + CSRF
        $middleware->api([
            EnsureFrontendRequestsAreStateful::class,
            StartSession::class,
            VerifyCsrfToken::class,
        ]);

    })
    ->withExceptions(function ($exceptions): void {
        //
    })
    ->create();

 