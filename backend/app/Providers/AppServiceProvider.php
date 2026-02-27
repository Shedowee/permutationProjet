<?php

namespace App\Providers;

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
        DemandePermutation::observe(UserActionObserver::class);
        \App\Models\User::observe(UserActionObserver::class);
    }
}
