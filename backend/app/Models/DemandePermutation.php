<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandePermutation extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_soumission', 'motif', 'date_traitement', 'commentaire_commission',
        'etat_id', 'employe_id', 'traite_par_utilisateur_id',
        'region_souhaitee_id', 'ville_souhaitee_id', 'etablissement_souhaite_id',
        'document_joint'
    ];

    protected $casts = [
        'date_soumission' => 'datetime',
        'date_traitement' => 'datetime',
    ];

    public function etat()
    {
        return $this->belongsTo(Parametre::class, 'etat_id');
    }

    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }

    public function traitePar()
    {
        return $this->belongsTo(User::class, 'traite_par_utilisateur_id');
    }

    public function regionSouhaitee()
    {
        return $this->belongsTo(Parametre::class, 'region_souhaitee_id');
    }

    public function villeSouhaitee()
    {
        return $this->belongsTo(Parametre::class, 'ville_souhaitee_id');
    }

    public function etablissementSouhaite()
    {
        return $this->belongsTo(Etablissement::class, 'etablissement_souhaite_id');
    }
}
