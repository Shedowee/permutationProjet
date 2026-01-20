<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employes', function (Blueprint $table) {
            $table->id();
            $table->string('cin', 20)->unique()->nullable();
            $table->string('matricule', 20)->unique()->nullable();
            $table->string('nom', 50);
            $table->string('prenom', 50);
            $table->date('date_recrutement')->nullable();
            $table->foreignId('user_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->foreignId('grade_id')->nullable()->constrained('parametres')->nullOnDelete();
            $table->foreignId('region_id')->nullable()->constrained('parametres')->nullOnDelete();
            $table->foreignId('etablissement_id')->nullable()->constrained('etablissements')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employes');
    }
};
