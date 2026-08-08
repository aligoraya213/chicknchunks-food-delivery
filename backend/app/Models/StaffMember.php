<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffMember extends Model
{
    protected $fillable = [
        'name',
        'email',
        'role',
        'phone',
        'status',
        'assigned_section',
        'department',
        'address',
        'cnic',
        'notes',
        'hired_at',
    ];

    protected $casts = [
        'hired_at' => 'datetime',
    ];
}
