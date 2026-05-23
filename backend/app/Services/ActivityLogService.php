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
     * @param string|null $tableName
     * @param int|null $recordId
     * @param array|null $before
     * @param array|null $after
     * @return void
     */
    public function log(
        ?int $userId, 
        string $actionType, 
        string $description, 
        ?string $tableName = null, 
        ?int $recordId = null,
        ?array $before = null,
        ?array $after = null
    ): void {
        LogAction::create([
            'user_id' => $userId,
            'action' => $actionType,
            'table_name' => $tableName,
            'record_id' => $recordId,
            'ip_address' => Request::ip(),
            'before' => $before,
            'after' => $after ?: ['description' => $description],
        ]);
    }
}
