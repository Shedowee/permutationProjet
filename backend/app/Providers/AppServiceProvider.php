<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\DemandePermutation;
use App\Policies\DemandePermutationPolicy;
use App\Models\PermissionRequest;
use App\Policies\PermissionRequestPolicy;
use App\Observers\UserActionObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(DemandePermutation::class, DemandePermutationPolicy::class);
        Gate::policy(PermissionRequest::class, PermissionRequestPolicy::class);
        DemandePermutation::observe(UserActionObserver::class);
        PermissionRequest::observe(UserActionObserver::class);
        \App\Models\User::observe(UserActionObserver::class);

        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Vérification de votre adresse email')
                ->greeting('Bonjour ' . ($notifiable->name ?? ''))
                ->line('Cliquez sur le bouton ci-dessous pour vérifier votre adresse email.')
                ->action('Vérifier mon email', $url)
                ->line('Si vous n\'avez pas créé de compte, vous pouvez ignorer cet email.');
        });
    }
}
