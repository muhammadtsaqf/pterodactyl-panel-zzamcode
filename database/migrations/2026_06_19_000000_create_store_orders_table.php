<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStoreOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('store_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id');
            $table->string('type'); // 'purchase' or 'renew'
            $table->unsignedInteger('server_id')->nullable(); // For renew
            $table->json('data')->nullable(); // Store specifications for purchase
            $table->unsignedInteger('amount'); // Transaction amount
            $table->string('reference_id')->unique(); // Order ID sent to gateway
            $table->string('payment_id')->nullable(); // Gateway payment ID
            $table->string('status')->default('pending'); // pending, paid, failed, expired
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('store_orders');
    }
}
