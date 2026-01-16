<?php
// app/Models/Role.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = ['libelle', 'code', 'role_category_id', 'description'];

    public function category() {
        return $this->belongsTo(RoleCategory::class, 'role_category_id');
    }

    public function users() {
        return $this->hasMany(User::class, 'role_id');
    }
}