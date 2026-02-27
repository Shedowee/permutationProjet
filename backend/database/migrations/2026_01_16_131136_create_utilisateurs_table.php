<?php 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id();
            $table->string('username', 100)->unique();
            $table->string('nom', 100)->nullable(); // Keeping as name
            $table->string('email', 150)->unique();
            $table->string('mot_de_passe');
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->boolean('actif')->default(true);
            $table->string('profile_picture')->nullable();
            $table->integer('age')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->boolean('email_verified')->default(false);
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('date_derniere_connexion')->nullable();
            $table->timestamps();
            $table->rememberToken();
        });
    }

    public function down(): void {
        Schema::dropIfExists('utilisateurs');
    }
};