<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log_actions', function (Blueprint $table) {
            $table->id();
            $table->string('action');
            $table->string('entite')->nullable();
            $table->unsignedBigInteger('entite_id')->nullable();
            $table->dateTime('date_action')->useCurrent();
            $table->string('adresse_ip', 45)->nullable();
            $table->foreignId('user_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_actions');
    }
};
