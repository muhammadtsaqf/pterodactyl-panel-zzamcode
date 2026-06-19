<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStoreBillingColumnsToServersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->unsignedInteger('store_renewal_cost')->nullable()->after('status');
            $table->unsignedInteger('store_renewal_duration')->nullable()->after('store_renewal_cost');
            $table->timestamp('store_expires_at')->nullable()->after('store_renewal_duration');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn(['store_renewal_cost', 'store_renewal_duration', 'store_expires_at']);
        });
    }
}
