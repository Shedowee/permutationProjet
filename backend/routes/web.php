<?php

use App\Events\UserActionOccurred;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/email/verify', function () {
    return redirect()->away(rtrim(config('app.frontend_url'), '/') . '/verify-email');
})->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', function (Request $request, string $id, string $hash) {
    $user = User::findOrFail($id);

    if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
        abort(403);
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new UserActionOccurred(
            $user->id,
            'email_verified',
            "Email vérifié: {$user->email}",
            ['table_name' => 'users', 'record_id' => $user->id]
        ));
    }

    $redirectUrl = rtrim(config('app.frontend_url'), '/') . '/verify-email?verified=1&email=' . urlencode($user->email);

    return redirect()->away($redirectUrl);
})->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
