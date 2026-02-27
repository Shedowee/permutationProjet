<?php

namespace App\Services;

use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EmailVerificationService
{
    /**
     * Generate and send OTP to user.
     *
     * @param string $email
     * @param string $type
     * @return string
     */
    public function sendOtp(string $email, string $type = 'email_verification'): string
    {
        // Generate 6 digit OTP
        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Save to DB (Hashed for security)
        Otp::create([
            'email' => $email,
            'otp' => Hash::make($otpCode),
            'type' => $type,
            'expires_at' => now()->addMinutes(15),
        ]);

        return $otpCode;
    }

    /**
     * Verify OTP.
     *
     * @param string $email
     * @param string $otpCode
     * @param string $type
     * @return bool
     */
    public function verifyOtp(string $email, string $otpCode, string $type = 'email_verification'): bool
    {
        $otps = Otp::where('email', $email)
            ->where('type', $type)
            ->where('expires_at', '>', now())
            ->get();

        foreach ($otps as $otp) {
            if (Hash::check($otpCode, $otp->otp)) {
                $otp->delete(); // Consume OTP
                return true;
            }
        }

        return false;
    }
}
