<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parametre extends Model
{
    use HasFactory;

    protected $fillable = ['type', 'code', 'libelle', 'actif', 'ordre', 'parent_id'];

    protected $casts = [
        'actif' => 'boolean',
    ];

    /**
     * Relationship to parent parameter (e.g., Region for a City).
     */
    public function parent()
    {
        return $this->belongsTo(Parametre::class, 'parent_id');
    }

    /**
     * Relationship to child parameters (e.g., Cities for a Region).
     */
    public function children()
    {
        return $this->hasMany(Parametre::class, 'parent_id');
    }

    /**
     * Relationship to establishments (if this is a City).
     */
    public function etablissements()
    {
        return $this->hasMany(Etablissement::class, 'ville_id');
    }

    /**
     * Scopes for specific types.
     */
    public function scopeGrade($query)
    {
        return $query->where('type', 'GRADE');
    }

    public function scopeRegion($query)
    {
        return $query->where('type', 'REGION');
    }

    public function scopeVille($query)
    {
        return $query->where('type', 'VILLE');
    }

    public function scopeEtat($query)
    {
        return $query->where('type', 'ETAT');
    }

    /**
     * Static helper to get a parameter ID by code and type.
     */
    public static function getIdByCode(string $type, string $code): ?int
    {
        return static::where('type', $type)->where('code', $code)->value('id');
    }
}
