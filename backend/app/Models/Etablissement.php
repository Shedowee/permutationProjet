<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'nom', 'adresse', 'ville_id', 'region_id', 'actif'];

    /**
     * Get the region of the establishment.
     */
    public function region()
    {
        return $this->belongsTo(Parametre::class, 'region_id')->where('type', 'REGION');
    }

    /**
     * Get the city of the establishment.
     */
    public function ville()
    {
        return $this->belongsTo(Parametre::class, 'ville_id')->where('type', 'VILLE');
    }

    /**
     * Get all employees currently assigned to this establishment.
     */
    public function employes()
    {
        return $this->hasMany(Employe::class);
    }

    /**
     * Get all permutation requests targeting this establishment.
     */
    public function demandesSouhaitees()
    {
        return $this->hasMany(DemandePermutation::class, 'etablissement_souhaite_id');
    }
}

