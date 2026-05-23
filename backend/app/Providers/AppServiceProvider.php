<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\DemandePermutation;
use App\Policies\DemandePermutationPolicy;
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
        
        // Register Observers for Activity Logging
        DemandePermutation::observe(UserActionObserver::class);
        \App\Models\User::observe(UserActionObserver::class);
        \App\Models\Etablissement::observe(UserActionObserver::class);
        \App\Models\Parametre::observe(UserActionObserver::class);
        \App\Models\Role::observe(UserActionObserver::class);
        \App\Models\UserDocument::observe(UserActionObserver::class);

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
