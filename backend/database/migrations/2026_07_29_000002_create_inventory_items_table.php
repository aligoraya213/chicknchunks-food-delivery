<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('ingredients');
            $table->integer('stock_count')->default(0);
            $table->integer('restock_threshold')->default(10);
            $table->string('unit')->default('pcs');
            $table->boolean('is_active')->default(true);
            $table->decimal('cost', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
