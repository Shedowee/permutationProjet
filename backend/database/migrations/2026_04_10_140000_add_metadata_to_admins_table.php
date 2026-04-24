<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('admins', 'metadata')) {
            Schema::table('admins', function (Blueprint $table) {
                $table->jsonb('metadata')->nullable()->after('notes');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('admins', 'metadata')) {
            Schema::table('admins', function (Blueprint $table) {
                $table->dropColumn('metadata');
            });
        }
    }
};

