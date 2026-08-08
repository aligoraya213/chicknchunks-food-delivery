<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DealItem extends Model
{
    protected $fillable = [
        'deal_id',
        'menu_item_id',
        'quantity',
    ];

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
