<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'contact_phone',
        'contact_email',
        'city_id',
        'metadata',
        'actif',
    ];

    protected $casts = [
        'metadata' => 'array',
        'actif' => 'boolean',
    ];

    /**
     * Get the city where the establishment is located.
     */
    public function ville()
    {
        return $this->belongsTo(Parametre::class, 'city_id');
    }

    /**
     * Get all formateurs currently assigned to this establishment.
     */
    public function formateurs()
    {
        return $this->belongsToMany(Formateur::class, 'etablissement_formateur')->withTimestamps();
    }

    /**
     * Get all permutation requests targeting this establishment.
     */
    public function demandesSouhaitees()
    {
        return $this->hasMany(DemandePermutation::class, 'etablissement_souhaite_id');
    }
}
