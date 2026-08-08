<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'receiver_user_id')) {
                $table->foreignId('receiver_user_id')->nullable()->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('messages', 'receiver')) {
                $table->string('receiver')->nullable();
            }
            if (!Schema::hasColumn('messages', 'status')) {
                $table->string('status')->default('sent'); // sent, delivered, read
            }
            if (!Schema::hasColumn('messages', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable();
            }
            if (!Schema::hasColumn('messages', 'read_at')) {
                $table->timestamp('read_at')->nullable();
            }
        });

        // Update existing messages to status = 'read' so old messages don't show pending ticks
        DB::table('messages')->whereNull('read_at')->update([
            'status' => 'read',
            'delivered_at' => DB::raw('created_at'),
            'read_at' => DB::raw('created_at'),
        ]);
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['receiver_user_id', 'receiver', 'status', 'delivered_at', 'read_at']);
        });
    }
};
