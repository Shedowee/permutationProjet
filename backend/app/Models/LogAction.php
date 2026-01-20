<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogAction extends Model
{
    use HasFactory;

    protected $fillable = ['action', 'entite', 'entite_id', 'date_action', 'adresse_ip', 'user_id'];
    
    protected $casts = [
        'date_action' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record(?int $userId, string $action, ?string $entite = null, ?int $entiteId = null, ?string $ip = null): void
    {
        static::create([
            'action' => $action,
            'entite' => $entite,
            'entite_id' => $entiteId,
            'date_action' => now(),
            'adresse_ip' => $ip,
            'user_id' => $userId,
        ]);
    }
}
