<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemandePermutation extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_soumission',
        'motif',
        'date_traitement',
        'commentaire_commission',
        'etat_id',
        'formateur_id',
        'traite_par_utilisateur_id',
        'region_souhaitee_id',
        'ville_souhaitee_id',
        'etablissement_souhaite_id',
        'document_joint',
    ];

    protected $casts = [
        'date_soumission' => 'datetime',
        'date_traitement' => 'datetime',
    ];

    /**
     * Get the trainer who made the request.
     */
    public function formateur(): BelongsTo
    {
        return $this->belongsTo(Formateur::class, 'formateur_id');
    }

    /**
     * Get the current status of the request.
     */
    public function etat()
    {
        return $this->belongsTo(Parametre::class, 'etat_id')->where('type', 'ETAT');
    }

    /**
     * Get the target region.
     */
    public function regionSouhaitee()
    {
        return $this->belongsTo(Parametre::class, 'region_souhaitee_id')->where('type', 'REGION');
    }

    /**
     * Get the target city.
     */
    public function villeSouhaitee()
    {
        return $this->belongsTo(Parametre::class, 'ville_souhaitee_id')->where('type', 'VILLE');
    }

    /**
     * Get the target establishment.
     */
    public function etablissementSouhaite()
    {
        return $this->belongsTo(Etablissement::class, 'etablissement_souhaite_id');
    }

    /**
     * Get the commission member who processed the request.
     */
    public function traitePar()
    {
        return $this->belongsTo(User::class, 'traite_par_utilisateur_id');
    }

    /**
     * Scopes for filtering by status
     */
    public function scopePending($query)
    {
        return $query->whereHas('etat', fn($q) => $q->where('key', 'EN_ATTENTE'));
    }

    public function scopeValidated($query)
    {
        return $query->whereHas('etat', fn($q) => $q->where('key', 'VALIDE'));
    }

    public function scopeRejected($query)
    {
        return $query->whereHas('etat', fn($q) => $q->where('key', 'REFUSE'));
    }
}
