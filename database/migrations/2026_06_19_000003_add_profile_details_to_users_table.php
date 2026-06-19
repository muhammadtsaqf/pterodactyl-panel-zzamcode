<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddProfileDetailsToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('company')->nullable()->after('phone');
            $table->string('address_1')->nullable()->after('company');
            $table->string('address_2')->nullable()->after('address_1');
            $table->string('city')->nullable()->after('address_2');
            $table->string('state')->nullable()->after('city');
            $table->string('zip')->nullable()->after('state');
            $table->string('country')->nullable()->after('zip');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'company',
                'address_1',
                'address_2',
                'city',
                'state',
                'zip',
                'country',
            ]);
        });
    }
}
