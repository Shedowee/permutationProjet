<?php

namespace App\Services;

use App\Models\LogAction;
use Illuminate\Support\Facades\Request;

class ActivityLogService
{
    /**
     * Log a user action.
     *
     * @param int|null $userId
     * @param string $actionType
     * @param string $description
     * @return void
     */
    public function log(?int $userId, string $actionType, string $description): void
    {
        LogAction::create([
            'user_id' => $userId,
            'action_type' => $actionType,
            'description' => $description,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'action' => $actionType, // compatible with old system
            'date_action' => now(),
            'adresse_ip' => Request::ip(), // compatible with old system
        ]);
    }
}
