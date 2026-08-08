<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->foreignId('rider_id')->nullable()->after('customer_id')->constrained('users')->nullOnDelete();
            $table->index(['customer_id', 'rider_id']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('sender_user_id')->nullable()->after('order_id')->constrained('users')->nullOnDelete();
            $table->index(['order_id', 'created_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('vehicle_info')->nullable()->after('phone');
            $table->string('profile_photo_url')->nullable()->after('vehicle_info');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['sender_user_id']);
            $table->dropIndex(['order_id', 'created_at']);
            $table->dropColumn('sender_user_id');
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropForeign(['rider_id']);
            $table->dropIndex(['customer_id', 'rider_id']);
            $table->dropColumn(['customer_id', 'rider_id']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['vehicle_info', 'profile_photo_url']);
        });
    }
};
