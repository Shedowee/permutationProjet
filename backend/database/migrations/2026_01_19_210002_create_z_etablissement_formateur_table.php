<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etablissement_formateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->foreignId('formateur_id')->constrained('formateurs')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['etablissement_id', 'formateur_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etablissement_formateur');
    }
};
