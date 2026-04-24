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
            'action' => $actionType,
            'table_name' => null, // Can be set if needed
            'record_id' => null, // Can be set if needed
            'ip_address' => Request::ip(),
            'before' => null,
            'after' => ['description' => $description],
        ]);
    }
}
