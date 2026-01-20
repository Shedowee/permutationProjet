<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parametres', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50)->index(); // GRADE, REGION, ETAT
            $table->string('code', 20)->nullable();
            $table->string('libelle', 100);
            $table->boolean('actif')->default(true);
            $table->integer('ordre')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('parametres')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parametres');
    }
};
