<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demande_permutations', function (Blueprint $table) {
            $table->foreignId('ville_souhaitee_id')->nullable()->after('region_souhaitee_id')->constrained('parametres')->nullOnDelete();
            $table->string('document_joint')->nullable()->after('etablissement_souhaite_id');
        });
    }

    public function down(): void
    {
        Schema::table('demande_permutations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('ville_souhaitee_id');
            $table->dropColumn('document_joint');
        });
    }
};
