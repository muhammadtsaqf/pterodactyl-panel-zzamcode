<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('store_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('price')->default(0);
            
            // Resource Limits
            $table->integer('cpu')->default(0);
            $table->integer('memory')->default(0);
            $table->integer('disk')->default(0);
            $table->integer('databases')->default(0);
            $table->integer('backups')->default(0);
            $table->integer('ports')->default(1);
            
            // Server configuration
            $table->unsignedInteger('egg_id')->nullable();
            $table->unsignedInteger('node_id')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Foreign keys if necessary
            // Note: Since egg_id and node_id might be deleted, we set null on delete.
            $table->foreign('egg_id')->references('id')->on('eggs')->onDelete('set null');
            $table->foreign('node_id')->references('id')->on('nodes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('store_packages');
    }
};
