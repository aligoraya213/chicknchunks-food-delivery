<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'vehicle_info',
        'vehicle_type',
        'vehicle_number',
        'license_number',
        'assigned_area',
        'availability_status',
        'hired_at',
        'notes',
        'profile_photo_url',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function isRider(): bool
    {
        return $this->role === 'rider';
    }

    public function addresses()
    {
        return $this->hasMany(\App\Models\Address::class);
    }

    public function customerOrders() { return $this->hasMany(Order::class, 'customer_id'); }
    public function riderOrders() { return $this->hasMany(Order::class, 'rider_id'); }
}
