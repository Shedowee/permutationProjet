<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDocument extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'file_path',
        'file_type',
        'file_size',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
