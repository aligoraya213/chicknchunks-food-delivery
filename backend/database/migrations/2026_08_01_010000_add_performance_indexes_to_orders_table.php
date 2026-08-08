<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index('created_at');
            $table->index('status');
            $table->index(['rider_id', 'status']);
            $table->index(['customer_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['status']);
            $table->dropIndex(['rider_id', 'status']);
            $table->dropIndex(['customer_id', 'created_at']);
        });
    }
};
