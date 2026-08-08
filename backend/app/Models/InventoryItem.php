<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = [
        'name',
        'category',
        'stock_count',
        'restock_threshold',
        'unit',
        'is_active',
        'cost',
    ];

    protected $casts = [
        'stock_count' => 'integer',
        'restock_threshold' => 'integer',
        'is_active' => 'boolean',
        'cost' => 'float',
    ];
}
