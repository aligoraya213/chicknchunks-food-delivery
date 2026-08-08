<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff_members', function (Blueprint $table) {
            if (!Schema::hasColumn('staff_members', 'address')) {
                $table->string('address')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('staff_members', 'cnic')) {
                $table->string('cnic')->nullable()->after('address');
            }
            if (!Schema::hasColumn('staff_members', 'notes')) {
                $table->text('notes')->nullable()->after('hired_at');
            }
            if (!Schema::hasColumn('staff_members', 'department')) {
                $table->string('department')->nullable()->after('assigned_section');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'address')) {
                $table->string('address')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('users', 'vehicle_type')) {
                $table->string('vehicle_type')->nullable()->after('role');
            }
            if (!Schema::hasColumn('users', 'vehicle_number')) {
                $table->string('vehicle_number')->nullable()->after('vehicle_type');
            }
            if (!Schema::hasColumn('users', 'license_number')) {
                $table->string('license_number')->nullable()->after('vehicle_number');
            }
            if (!Schema::hasColumn('users', 'assigned_area')) {
                $table->string('assigned_area')->nullable()->after('license_number');
            }
            if (!Schema::hasColumn('users', 'availability_status')) {
                $table->string('availability_status')->default('on_duty')->after('assigned_area');
            }
            if (!Schema::hasColumn('users', 'hired_at')) {
                $table->timestamp('hired_at')->nullable()->after('availability_status');
            }
            if (!Schema::hasColumn('users', 'notes')) {
                $table->text('notes')->nullable()->after('hired_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('staff_members', function (Blueprint $table) {
            $table->dropColumn(['address', 'cnic', 'notes', 'department']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'vehicle_type', 'vehicle_number', 'license_number',
                'assigned_area', 'availability_status', 'hired_at', 'notes'
            ]);
        });
    }
};
