<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formateur extends Model
{
    use HasFactory;

    protected $table = 'formateurs';

    protected $fillable = [
        'employee_number',
        'position',
        'specialite',
        'hire_date',
        'salary',
        'user_id',
        'establishment_id',
        'metadata',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'salary' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class, 'establishment_id');
    }

    public function etablissements()
    {
        return $this->belongsToMany(Etablissement::class, 'etablissement_formateur')->withTimestamps();
    }

    public function demandes(): HasMany
    {
        return $this->hasMany(DemandePermutation::class, 'formateur_id');
    }
}
