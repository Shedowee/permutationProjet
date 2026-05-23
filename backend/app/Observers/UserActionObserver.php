<?php

namespace App\Observers;

use App\Events\UserActionOccurred;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class UserActionObserver
{
    public function created(Model $model): void
    {
        $this->logAction($model, 'create');
    }

    public function updated(Model $model): void
    {
        $this->logAction($model, 'update');
    }

    public function deleted(Model $model): void
    {
        $this->logAction($model, 'delete');
    }

    protected function logAction(Model $model, string $action): void
    {
        $userId = Auth::id();
        $modelName = class_basename($model);
        $tableName = $model->getTable();
        $description = "{$action} effectuée sur {$modelName} (ID: {$model->id})";

        event(new UserActionOccurred($userId, "crud_{$action}", $description, [
            'table_name' => $tableName,
            'record_id' => $model->id,
            'before' => $action === 'update' ? $model->getOriginal() : null,
            'after' => $action !== 'delete' ? $model->toArray() : null,
        ]));
    }
}
