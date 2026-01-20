<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employe extends Model
{
    use HasFactory;

    protected $fillable = ['cin', 'matricule', 'nom', 'prenom', 'date_recrutement', 'user_id', 'grade_id', 'region_id', 'etablissement_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function grade()
    {
        return $this->belongsTo(Parametre::class, 'grade_id');
    }

    public function region()
    {
        return $this->belongsTo(Parametre::class, 'region_id');
    }

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }
}
