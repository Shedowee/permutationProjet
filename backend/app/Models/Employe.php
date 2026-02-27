<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employe extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'matricule',
        'cin',
        'date_recrutement',
        'grade_id',
        'region_id',
        'etablissement_id'
    ];

    protected $casts = [
        'date_recrutement' => 'date',
    ];

    /**
     * Get the user account for this employee.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the grade (from parametres table).
     */
    public function grade()
    {
        return $this->belongsTo(Parametre::class, 'grade_id')->where('type', 'GRADE');
    }

    /**
     * Get the current region (from parametres table).
     */
    public function region()
    {
        return $this->belongsTo(Parametre::class, 'region_id')->where('type', 'REGION');
    }

    /**
     * Get the current establishment.
     */
    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }

    /**
     * Get all permutation requests made by this employee.
     */
    public function demandes()
    {
        return $this->hasMany(DemandePermutation::class, 'employe_id');
    }

    /**
     * Check if the employee has a pending request.
     */
    public function hasPendingRequest(): bool
    {
        return $this->demandes()->whereHas('etat', function($query) {
            $query->where('code', 'EN_ATTENTE');
        })->exists();
    }
}
