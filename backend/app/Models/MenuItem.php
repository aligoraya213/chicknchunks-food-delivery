<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = [
        'name',
        'category',
        'price',
        'original_price',
        'description',
        'image',
        'badge',
        'spice_level',
        'popular',
        'is_available',
        'options',
        'rating',
        'reviews',
        'prep_time',
        'calories',
    ];

    protected $casts = [
        'price' => 'float',
        'original_price' => 'float',
        'popular' => 'boolean',
        'is_available' => 'boolean',
        'options' => 'array',
        'rating' => 'float',
        'reviews' => 'integer',
    ];
}
