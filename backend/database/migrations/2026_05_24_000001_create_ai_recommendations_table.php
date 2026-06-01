<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_permutation_id')->constrained('demande_permutations')->cascadeOnDelete();
            $table->string('type', 40);
            $table->decimal('score', 5, 2)->default(0);
            $table->string('confidence', 20)->default('medium');
            $table->string('signature', 64);
            $table->string('title');
            $table->text('summary')->nullable();
            $table->json('candidate_demande_ids')->nullable();
            $table->json('chain')->nullable();
            $table->json('metadata')->nullable();
            $table->string('status', 30)->default('proposed');
            $table->foreignId('acted_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('acted_at')->nullable();
            $table->timestamps();

            $table->index(['demande_permutation_id', 'type', 'status']);
            $table->unique(['demande_permutation_id', 'signature']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_recommendations');
    }
};
