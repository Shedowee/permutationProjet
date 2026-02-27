<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'utilisateurs'; // IMPORTANT

    protected $fillable = [
        'username',
        'nom',
        'email',
        'mot_de_passe',
        'role_id',
        'actif',
        'date_derniere_connexion',
        'profile_picture',
        'age',
        'phone',
        'address',
        'email_verified_at',
        'email_verified',
    ];

    protected $casts = [
        'date_derniere_connexion' => 'datetime',
        'actif' => 'boolean',
        'email_verified' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    protected $hidden = [
        'mot_de_passe',
        'remember_token',
    ];

    protected static function booted()
    {
        static::creating(function ($user) {
            if (empty($user->username)) {
                $user->username = explode('@', $user->email)[0] . '_' . rand(100, 999);
            }
        });
    }

    // Tell Laravel which column is the password
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    /**
     * Get the employee profile associated with the user.
     */
    public function employe()
    {
        return $this->hasOne(Employe::class, 'user_id');
    }

    /**
     * Get the role associated with the user.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(string $roleCode): bool
    {
        return $this->role && strtoupper($this->role->code) === strtoupper($roleCode);
    }

    /**
     * Check if user is an administrator.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('ADMIN');
    }

    /**
     * Check if user is a commission member.
     */
    public function isCommission(): bool
    {
        return $this->hasRole('COMMISSION');
    }

    /**
     * Check if user is an employee.
     */
    public function isEmployee(): bool
    {
        return $this->hasRole('EMPLOYE') || $this->hasRole('FORMATEUR');
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
