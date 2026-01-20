<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'nom', 'adresse', 'actif'];

    public function employes()
    {
        return $this->hasMany(Employe::class);
    }

    public function demandesSouhaitees()
    {
        return $this->hasMany(DemandePermutation::class, 'etablissement_souhaite_id');
    }
}

