<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('messages', 'channel')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->string('channel')->default('customer_rider')->after('order_id');
                $table->index(['order_id', 'channel']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('messages', 'channel')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->dropIndex(['order_id', 'channel']);
                $table->dropColumn('channel');
            });
        }
    }
};
