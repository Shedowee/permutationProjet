<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('log_actions', function (Blueprint $table) {
            if (!Schema::hasColumn('log_actions', 'ip_address')) {
                $table->string('ip_address', 45)->nullable()->after('record_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('log_actions', function (Blueprint $table) {
            if (Schema::hasColumn('log_actions', 'ip_address')) {
                $table->dropColumn('ip_address');
            }
        });
    }
};
