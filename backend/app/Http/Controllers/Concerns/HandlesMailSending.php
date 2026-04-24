<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Support\Facades\Log;

trait HandlesMailSending
{
    protected function sendMailSafely(callable $send, string $warningMessage, array $context = []): bool
    {
        try {
            $send();

            return true;
        } catch (\Throwable $e) {
            Log::warning($warningMessage, array_merge($context, [
                'error' => $e->getMessage(),
            ]));

            return false;
        }
    }
}
