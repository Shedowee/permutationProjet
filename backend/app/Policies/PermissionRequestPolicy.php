<?php

namespace App\Policies;

use App\Models\PermissionRequest;
use App\Models\User;

class PermissionRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('read_permission_requests') || $user->hasPermission('approve_permission_requests');
    }

    public function view(User $user, PermissionRequest $permissionRequest): bool
    {
        return $user->hasPermission('approve_permission_requests') || $permissionRequest->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('create_permission_requests');
    }

    public function approve(User $user, PermissionRequest $permissionRequest): bool
    {
        return $user->hasPermission('approve_permission_requests');
    }

    public function reject(User $user, PermissionRequest $permissionRequest): bool
    {
        return $user->hasPermission('reject_permission_requests');
    }
}
