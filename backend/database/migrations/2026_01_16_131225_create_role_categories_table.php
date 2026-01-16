<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('role_categories', function (Blueprint $table) {
            $table->id();
            $table->string('libelle', 100)->unique();
            $table->string('code', 20)->unique()->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('role_categories');
    }
};