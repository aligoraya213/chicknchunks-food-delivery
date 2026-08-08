<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->decimal('price', 10, 2);
            $table->text('description');
            $table->string('image')->nullable();
            $table->string('badge')->nullable();
            $table->integer('spice_level')->default(1);
            $table->boolean('popular')->default(false);
            $table->boolean('is_available')->default(true);
            $table->json('options')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
