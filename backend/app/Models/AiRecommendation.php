<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_permutation_id',
        'type',
        'score',
        'confidence',
        'signature',
        'title',
        'summary',
        'candidate_demande_ids',
        'chain',
        'metadata',
        'status',
        'acted_by_user_id',
        'acted_at',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'candidate_demande_ids' => 'array',
        'chain' => 'array',
        'metadata' => 'array',
        'acted_at' => 'datetime',
    ];

    public function demande(): BelongsTo
    {
        return $this->belongsTo(DemandePermutation::class, 'demande_permutation_id');
    }

    public function actedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acted_by_user_id');
    }
}
