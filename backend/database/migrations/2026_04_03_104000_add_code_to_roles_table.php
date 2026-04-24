<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->after('name');
        });
        
        // Update existing roles with codes
        DB::table('roles')->where('name', 'ADMIN')->update(['code' => 'admin']);
        DB::table('roles')->where('name', 'COMMISSION')->update(['code' => 'commission']);
        DB::table('roles')->where('name', 'FORMATEUR')->update(['code' => 'formateur']);
        DB::table('roles')->where('name', 'USER')->update(['code' => 'user']);
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};
