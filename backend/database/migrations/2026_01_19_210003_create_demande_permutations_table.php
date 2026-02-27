<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demande_permutations', function (Blueprint $table) {
            $table->id();
            $table->dateTime('date_soumission')->useCurrent();
            $table->text('motif')->nullable();
            $table->dateTime('date_traitement')->nullable();
            $table->text('commentaire_commission')->nullable();
            $table->foreignId('etat_id')->constrained('parametres'); // Status
            $table->foreignId('employe_id')->constrained('employes')->cascadeOnDelete();
            $table->foreignId('traite_par_utilisateur_id')->nullable()->constrained('utilisateurs')->nullOnDelete();
            $table->foreignId('region_souhaitee_id')->nullable()->constrained('parametres')->nullOnDelete();
            $table->foreignId('ville_souhaitee_id')->nullable()->constrained('parametres')->nullOnDelete();
            $table->foreignId('etablissement_souhaite_id')->nullable()->constrained('etablissements')->nullOnDelete();
            $table->string('document_joint')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_permutations');
    }
};
