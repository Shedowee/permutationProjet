<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['role_id', 'permission_id']);
            $table->index(['permission_id', 'role_id']);
        });

        Schema::create('permission_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type');
            $table->string('status')->default('pending')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['type', 'status']);
        });

        Schema::create('etablissement_formateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formateur_id')->constrained('formateurs')->cascadeOnDelete();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['formateur_id', 'etablissement_id']);
            $table->index(['etablissement_id', 'formateur_id']);
        });

        if (Schema::hasColumn('roles', 'code')) {
            foreach ([
                'admin' => 'Administration system-wide',
                'formateur' => 'Trainer account',
                'commission' => 'Commission reviewer account',
                'user' => 'Basic account',
            ] as $code => $description) {
                $payload = [
                    'name' => $code,
                    'code' => $code,
                    'description' => $description,
                    'updated_at' => now(),
                ];

                $existing = DB::table('roles')
                    ->where('code', $code)
                    ->orWhere('name', strtoupper($code))
                    ->orWhere('name', $code)
                    ->first();

                if ($existing) {
                    DB::table('roles')->where('id', $existing->id)->update($payload);
                } else {
                    DB::table('roles')->insert($payload + ['created_at' => now()]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('etablissement_formateur');
        Schema::dropIfExists('permission_requests');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
    }
};
