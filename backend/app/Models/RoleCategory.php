<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoleCategory extends Model
{
    use HasFactory;

    protected $fillable = ['libelle', 'code', 'description'];

    public function roles() {
        return $this->hasMany(Role::class);
    }
}