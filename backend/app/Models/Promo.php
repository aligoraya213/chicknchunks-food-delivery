<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    protected $fillable = [
        'code',
        'discount_percent',
        'discount_flat',
        'free_delivery',
        'description',
        'is_active',
    ];

    protected $casts = [
        'discount_percent' => 'float',
        'discount_flat' => 'float',
        'free_delivery' => 'boolean',
        'is_active' => 'boolean',
    ];
}
