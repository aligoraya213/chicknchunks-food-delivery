<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Order;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    private function orderForParticipant(Request $request, string $orderId): Order
    {
        $order = Order::where('order_id', $orderId)->firstOrFail();
        $user = $request->user() ?? auth('sanctum')->user();

        if ($user) {
            if ($user->isAdmin()) return $order;
            if ($user->isCustomer() && ($order->customer_id === $user->id || $order->customer_phone === $user->phone)) return $order;
            if ($user->isRider() && $order->rider_id === $user->id) return $order;
            abort(403, 'Unauthorized chat access for this user.');
        }

        // Non-authenticated guest: Check guest_id or phone parameter matching
        $guestId = $request->input('guest_id') ?? $request->header('X-Guest-ID');
        $phone = $request->input('phone');

        if ($guestId && $order->guest_id === $guestId) return $order;
        if ($phone && $order->customer_phone === $phone) return $order;

        // Allow public tracking chat lookup if accessing valid orderId
        return $order;
    }

    private function resource(Message $message): array
    {
        return [
            'id' => $message->id,
            'orderId' => $message->order_id,
            'channel' => $message->channel ?? 'customer_rider',
            'sender' => $message->sender,
            'senderName' => $message->sender_name,
            'receiver' => $message->receiver,
            'text' => $message->text,
            'status' => $message->status ?? 'read', // sent, delivered, read
            'timestamp' => $message->created_at->toISOString(),
            'deliveredAt' => $message->delivered_at?->toISOString(),
            'readAt' => $message->read_at?->toISOString(),
        ];
    }

    public function index(Request $request, $orderId)
    {
        $this->orderForParticipant($request, $orderId);
        $channel = $request->query('channel');
        if ($channel && str_contains($channel, '?')) {
            $channel = explode('?', $channel)[0];
        }

        $user = $request->user() ?? auth('sanctum')->user();
        $myRole = $user?->role ?? $request->query('role', 'customer');

        // Automatically mark incoming unread messages as read when recipient opens/polls chat
        $queryUnread = Message::where('order_id', $orderId)
            ->where('sender', '!=', $myRole)
            ->where('status', '!=', 'read');

        if ($channel) {
            $queryUnread->where('channel', $channel);
        }

        $queryUnread->update([
            'status' => 'read',
            'read_at' => now(),
            'delivered_at' => DB_raw_delivered_at(),
        ]);

        $query = Message::where('order_id', $orderId);
        if ($channel) {
            $query->where(function ($q) use ($channel) {
                $q->where('channel', $channel);
                if ($channel === 'customer_rider') {
                    $q->orWhereNull('channel');
                }
            });
        }

        return $query->orderBy('created_at')->orderBy('id')
            ->get()->map(fn (Message $message) => $this->resource($message));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'order_id' => 'required|string|exists:orders,order_id',
            'channel' => 'nullable|string|in:customer_rider,customer_admin,admin_rider',
            'text' => 'required|string|max:5000',
            'sender' => 'nullable|string|in:customer,admin,rider',
            'sender_name' => 'nullable|string|max:255',
            'receiver' => 'nullable|string|in:customer,admin,rider',
        ]);
        
        $this->orderForParticipant($request, $data['order_id']);
        $user = $request->user() ?? auth('sanctum')->user();
        $channel = $data['channel'] ?? 'customer_rider';
        $senderRole = $user?->role ?? $data['sender'] ?? 'customer';

        // Infer receiver based on channel and sender
        $receiverRole = $data['receiver'] ?? match ($channel) {
            'customer_rider' => ($senderRole === 'rider' ? 'customer' : 'rider'),
            'customer_admin' => ($senderRole === 'admin' ? 'customer' : 'admin'),
            'admin_rider' => ($senderRole === 'rider' ? 'admin' : 'rider'),
            default => 'customer',
        };

        $message = Message::create([
            'order_id' => $data['order_id'],
            'channel' => $channel,
            'sender_user_id' => $user?->id,
            'sender' => $senderRole,
            'sender_name' => strip_tags($user?->name ?? $data['sender_name'] ?? ucfirst($senderRole)),
            'receiver' => $receiverRole,
            'text' => strip_tags(trim($data['text'])),
            'status' => 'delivered', // Delivered to channel upon creation
            'delivered_at' => now(),
        ]);

        return response()->json($this->resource($message), 201);
    }

    public function markAsRead(Request $request, $orderId)
    {
        $this->orderForParticipant($request, $orderId);
        $user = $request->user() ?? auth('sanctum')->user();
        $channel = $request->input('channel', 'customer_rider');
        $myRole = $user?->role ?? $request->input('role', 'customer');

        Message::where('order_id', $orderId)
            ->where('channel', $channel)
            ->where('sender', '!=', $myRole)
            ->where('status', '!=', 'read')
            ->update([
                'status' => 'read',
                'read_at' => now(),
            ]);

        return response()->json(['success' => true]);
    }
}

function DB_raw_delivered_at() {
    return \Illuminate\Support\Facades\DB::raw('COALESCE(delivered_at, CURRENT_TIMESTAMP)');
}
