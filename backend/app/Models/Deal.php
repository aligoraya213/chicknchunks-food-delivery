<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deal extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'is_active',
    ];

    protected $casts = [
        'price' => 'float',
        'is_active' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(DealItem::class);
    }

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'deal_items')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
