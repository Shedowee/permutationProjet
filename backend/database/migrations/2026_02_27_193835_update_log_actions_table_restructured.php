<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('log_actions', function (Blueprint $table) {
            // Rename columns or add new ones to match requirements
            // id, user_id, action_type, description, ip_address, user_agent, created_at
            $table->string('action_type')->after('user_id')->nullable();
            $table->text('description')->after('action_type')->nullable();
            $table->string('ip_address')->after('description')->nullable();
            $table->string('user_agent')->after('ip_address')->nullable();
            
            // We can keep 'action', 'entite', 'entite_id', 'date_action', 'adresse_ip' for now or drop them later
            // But requirement is specific. Let's just add the missing ones.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('log_actions', function (Blueprint $table) {
            $table->dropColumn(['action_type', 'description', 'ip_address', 'user_agent']);
        });
    }
};
