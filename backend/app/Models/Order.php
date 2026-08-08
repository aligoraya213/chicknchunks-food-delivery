<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'guest_id',
        'rider_id',
        'order_id',
        'created_at',
        'status',
        'status_step',
        'estimated_minutes',
        'items',
        'subtotal',
        'delivery_fee',
        'discount_amount',
        'total',
        'address',
        'payment_method',
        'payment_status',
        'customer_name',
        'customer_phone',
        'driver',
        'assigned_at',
    ];

    public function customer() { return $this->belongsTo(User::class, 'customer_id'); }
    public function rider() { return $this->belongsTo(User::class, 'rider_id'); }

    protected $casts = [
        'items' => 'array',
        'driver' => 'array',
        'subtotal' => 'float',
        'delivery_fee' => 'float',
        'discount_amount' => 'float',
        'total' => 'float',
        'status_step' => 'integer',
        'estimated_minutes' => 'integer',
        'assigned_at' => 'datetime',
    ];
}
