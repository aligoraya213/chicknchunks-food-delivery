<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'order_id',
        'channel',
        'sender_user_id',
        'receiver_user_id',
        'sender',
        'receiver',
        'sender_name',
        'text',
        'status',
        'delivered_at',
        'read_at',
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function senderUser()
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function receiverUser()
    {
        return $this->belongsTo(User::class, 'receiver_user_id');
    }
}
