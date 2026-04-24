<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'payload',
        'read_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'read_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (Notification $notification) {
            $recipient = $notification->relationLoaded('user') ? $notification->user : null;

            if (!$recipient && $notification->user_id) {
                $recipient = User::with('role')->find($notification->user_id);
            }

            $notification->payload = self::normalizePayloadForRecipient($notification->payload ?? [], $recipient);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getTargetRoleAttribute(): ?string
    {
        return $this->payload['target_role'] ?? null;
    }

    public static function normalizePayloadForRecipient(array $payload, ?User $user = null): array
    {
        $user ??= null;
        $roleCode = $user?->role?->code ? strtolower((string) $user->role->code) : null;

        if (!array_key_exists('route', $payload)) {
            return $payload;
        }

        $route = is_string($payload['route']) ? trim($payload['route']) : '';
        if ($route === '') {
            unset($payload['route']);
            return $payload;
        }

        $path = parse_url($route, PHP_URL_PATH) ?: $route;
        $restrictedPaths = [
            'admin' => '/admin',
            'commission' => '/commission',
            'formateur' => '/formateur',
        ];

        foreach ($restrictedPaths as $requiredRole => $prefix) {
            if (str_starts_with($path, $prefix)) {
                if (!$user || !$user->isActiveAccount() || $roleCode !== $requiredRole) {
                    $payload['route'] = '/profile';
                }

                return $payload;
            }
        }

        return $payload;
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        $roleCode = $user->role?->code ?? null;

        return $query->where('user_id', $user->id)
            ->where(function (Builder $nested) use ($roleCode) {
                $nested->whereNull('payload->target_role');

                if ($roleCode) {
                    $nested->orWhere('payload->target_role', $roleCode);
                }
            });
    }
}
