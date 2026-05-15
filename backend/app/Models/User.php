<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    private const ACTIVE_STATUSES = ['active', 'actif'];
    private const BLOCKED_STATUSES = ['blocked', 'bloqué', 'inactive', 'inactif', 'suspended', 'suspendu'];

    protected $table = 'users';

    protected $fillable = [
        'uuid',
        'email',
        'password_hash',
        'name',
        'phone',
        'age',
        'address',
        'role_id',
        'status',
        'email_verified_at',
        'photo_url',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected $appends = [
        'permissions',
    ];

    // Tell Laravel which column is the password
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function normalizedStatus(): string
    {
        return strtolower(trim((string) $this->status));
    }

    public function isActiveAccount(): bool
    {
        return in_array($this->normalizedStatus(), self::ACTIVE_STATUSES, true);
    }

    public function isBlockedAccount(): bool
    {
        return in_array($this->normalizedStatus(), self::BLOCKED_STATUSES, true);
    }

    public function hasLimitedAccess(): bool
    {
        return ! $this->isActiveAccount() && ! $this->isBlockedAccount();
    }

    public function hasVerifiedEmail(): bool
    {
        return ! is_null($this->email_verified_at);
    }

    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    public function markEmailAsUnverified(): bool
    {
        return $this->forceFill([
            'email_verified_at' => null,
        ])->save();
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmail);
    }

    public function getEmailForVerification(): string
    {
        return $this->email;
    }

    /**
     * Get the formateur profile associated with the user.
     */
    public function formateur(): HasOne
    {
        return $this->hasOne(Formateur::class, 'user_id');
    }

    /**
     * Get the admin profile associated with the user.
     */
    public function admin(): HasOne
    {
        return $this->hasOne(Admin::class, 'user_id');
    }

    /**
     * Get the commission profile associated with the user.
     */
    public function commission(): HasOne
    {
        return $this->hasOne(Commission::class, 'user_id');
    }

    /**
     * Get the role associated with the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function getPermissionsAttribute(): array
    {
        $role = $this->relationLoaded('role') ? $this->role : $this->role()->with('permissions')->first();
        return $role?->permissions?->pluck('name')->values()->all() ?? [];
    }

    public function hasPermission(string $permission): bool
    {
        $role = $this->relationLoaded('role') ? $this->role : $this->role()->with('permissions')->first();
        if (!$role) {
            return false;
        }

        return $role->permissions->contains(fn ($item) => $item->name === $permission);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function logs()
    {
        return $this->hasMany(LogAction::class);
    }

    public function documents()
    {
        return $this->hasMany(UserDocument::class);
    }
}
