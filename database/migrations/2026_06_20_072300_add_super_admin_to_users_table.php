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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'super_admin')) {
                $table->boolean('super_admin')->default(false)->after('root_admin');
            }
        });

        // Set existing root_admins as super_admin to prevent lockout
        \Illuminate\Support\Facades\DB::table('users')->where('root_admin', true)->update(['super_admin' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'super_admin')) {
                $table->dropColumn('super_admin');
            }
        });
    }
};
