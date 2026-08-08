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
        Schema::table('menu_items', function (Blueprint $table) {
            $table->decimal('original_price', 10, 2)->nullable()->after('price');
            $table->decimal('rating', 3, 1)->default(4.8)->after('is_available');
            $table->integer('reviews')->default(0)->after('rating');
            $table->string('prep_time', 50)->default('10 min')->after('reviews');
            $table->string('calories', 50)->default('540 kcal')->after('prep_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn(['original_price', 'rating', 'reviews', 'prep_time', 'calories']);
        });
    }
};
