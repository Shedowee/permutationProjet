<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'utilisateurs'; // IMPORTANT

    protected $fillable = [
        'nom',
        'email',
        'mot_de_passe',
        'role_id',
        'actif',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    // Tell Laravel which column is the password
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }
}