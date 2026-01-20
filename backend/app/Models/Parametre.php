<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parametre extends Model
{
    use HasFactory;

    protected $fillable = ['type', 'code', 'libelle', 'actif', 'ordre', 'parent_id'];

    public function parent()
    {
        return $this->belongsTo(Parametre::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Parametre::class, 'parent_id');
    }
}
