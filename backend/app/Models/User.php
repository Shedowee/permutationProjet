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
    ];

    protected $casts = [
        'date_derniere_connexion' => 'datetime',
        'actif' => 'boolean',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    // Tell Laravel which column is the password
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function employe()
    {
        return $this->hasOne(Employe::class);
    }

    public function logs()
    {
        return $this->hasMany(LogAction::class);
    }
}