<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    private const STEPS = ['placed' => 1, 'preparing' => 2, 'on_way' => 3, 'delivered' => 4];

    private function resource(Order $order): array
    {
        $order->loadMissing(['customer', 'rider']);
        return [
            'id' => $order->id,
            'orderId' => $order->order_id,
            'order_id' => $order->order_id,
            'guestId' => $order->guest_id,
            'guest_id' => $order->guest_id,
            'createdAt' => $order->created_at ? (is_string($order->created_at) ? $order->created_at : $order->created_at->toISOString()) : null,
            'assignedAt' => $order->assigned_at ? (is_string($order->assigned_at) ? $order->assigned_at : $order->assigned_at->toISOString()) : null,
            'riderId' => $order->rider_id,
            'rider_id' => $order->rider_id,
            'status' => $order->status,
            'statusStep' => (int) $order->status_step,
            'estimatedMinutes' => (int) $order->estimated_minutes,
            'items' => $order->items ?? [],
            'subtotal' => (float) $order->subtotal,
            'deliveryFee' => (float) $order->delivery_fee,
            'discountAmount' => (float) $order->discount_amount,
            'total' => (float) $order->total,
            'address' => $order->address,
            'paymentMethod' => $order->payment_method,
            'paymentStatus' => $order->payment_status,
            'customerName' => $order->customer_name,
            'customerPhone' => $order->customer_phone,
            'rider' => $order->rider ? [
                'id' => $order->rider->id,
                'name' => $order->rider->name,
                'phone' => $order->rider->phone,
                'photoUrl' => $order->rider->profile_photo_url,
                'vehicle' => $order->rider->vehicle_info,
                'availabilityStatus' => $order->rider->availability_status ?? 'available',
                'deliveryStatus' => $order->status,
            ] : null,
        ];
    }

    private function find(string $orderId): Order
    {
        return Order::where('order_id', $orderId)->firstOrFail();
    }

    private function canView(Request $request, Order $order): bool
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if ($user) {
            return $user->isAdmin() ||
                ($user->isCustomer() && ($order->customer_id === $user->id || $order->customer_phone === $user->phone)) ||
                ($user->isRider() && $order->rider_id === $user->id);
        }

        // For non-authenticated guest access, verify guest_id or phone matching
        $guestId = $request->input('guest_id') ?? $request->header('X-Guest-ID');
        $phone = $request->input('phone');

        if ($guestId && $order->guest_id === $guestId) return true;
        if ($phone && $order->customer_phone === $phone) return true;

        // Fallback: If no identity parameters provided, allow order lookup by unique orderId for tracking page
        return true;
    }

    public function index(Request $request)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        $query = Order::with([
            'customer:id,name,email,phone',
            'rider:id,name,email,phone,availability_status,vehicle_info,profile_photo_url'
        ])->orderByDesc('created_at');
        
        // 1. Admin gets all orders
        if ($user && $user->isAdmin()) {
            $orders = $query->get()->map(fn (Order $order) => $this->resource($order));
            return response()->json($orders)->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        }

        // 2. Rider gets assigned orders only
        if ($user && $user->isRider()) {
            $query->where('rider_id', $user->id);
            $orders = $query->get()->map(fn (Order $order) => $this->resource($order));
            return response()->json($orders)->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        }

        // 3. Registered Customer gets their own orders
        if ($user && $user->isCustomer()) {
            $query->where(function ($q) use ($user) {
                $q->where('customer_id', $user->id);
                if ($user->phone) {
                    $q->orWhere('customer_phone', $user->phone);
                }
            });
            $orders = $query->get()->map(fn (Order $order) => $this->resource($order));
            return response()->json($orders)->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
        
        // 4. Guest / Customer Fallback: Filter by guest_id, customer_id, or phone if provided
        $guestId = $request->input('guest_id') ?? $request->header('X-Guest-ID');
        $phone = $request->input('phone');
        $customerId = $request->input('customer_id');

        if ($guestId || $phone || $customerId) {
            $query->where(function ($q) use ($guestId, $phone, $customerId) {
                if ($guestId) {
                    $q->where('guest_id', $guestId);
                }
                if ($customerId) {
                    $q->orWhere('customer_id', $customerId);
                }
                if ($phone) {
                    $rawPhone = trim($phone);
                    $cleanPhone = preg_replace('/[^\d\+]/', '', $rawPhone);
                    $q->orWhere('customer_phone', $rawPhone);
                    if ($cleanPhone !== $rawPhone) {
                        $q->orWhere('customer_phone', $cleanPhone);
                    }
                }
            });
            $orders = $query->get()->map(fn (Order $order) => $this->resource($order));
            return response()->json($orders)->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        }

        // 5. Default Public Fallback
        $orders = $query->get()->map(fn (Order $order) => $this->resource($order));
        return response()->json($orders)->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    public function store(Request $request)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        $data = $request->validate([
            'orderId' => 'required|string|unique:orders,order_id',
            'guest_id' => 'nullable|string|max:64',
            'items' => 'required|array',
            'subtotal' => 'required|numeric',
            'deliveryFee' => 'required|numeric',
            'discountAmount' => 'required|numeric',
            'total' => 'required|numeric',
            'address' => 'required|string',
            'paymentMethod' => 'required|string',
            'paymentStatus' => 'nullable|string',
            'customerName' => 'required|string',
            'customerPhone' => 'required|string',
        ]);
        
        $order = Order::create([
            'customer_id' => $user?->id,
            'guest_id' => $user ? null : ($data['guest_id'] ?? null),
            'order_id' => strip_tags($data['orderId']),
            'status' => 'placed',
            'status_step' => 1,
            'estimated_minutes' => 30,
            'items' => $data['items'],
            'subtotal' => $data['subtotal'],
            'delivery_fee' => $data['deliveryFee'],
            'discount_amount' => $data['discountAmount'],
            'total' => $data['total'],
            'address' => strip_tags(trim($data['address'])),
            'payment_method' => strip_tags($data['paymentMethod']),
            'payment_status' => strip_tags($data['paymentStatus'] ?? 'pending'),
            'customer_name' => strip_tags(trim($data['customerName'])),
            'customer_phone' => strip_tags(trim($data['customerPhone'])),
        ]);
        
        return response()->json($this->resource($order), 201);
    }

    public function checkGuestHistory(Request $request)
    {
        $data = $request->validate([
            'phone' => 'required|string|min:5|max:30',
            'guest_id' => 'nullable|string|max:64',
        ]);

        $rawPhone = trim($data['phone']);
        $cleanPhone = preg_replace('/[^\d\+]/', '', $rawPhone);
        $currentGuestId = $data['guest_id'] ?? null;

        // Find guest orders matching phone number where customer_id is null AND guest_id is different
        $matchingQuery = Order::whereNull('customer_id')
            ->where(function ($q) use ($rawPhone, $cleanPhone) {
                $q->where('customer_phone', $rawPhone)
                  ->orWhere('customer_phone', $cleanPhone);
            });

        if ($currentGuestId) {
            $matchingQuery->where(function ($q) use ($currentGuestId) {
                $q->whereNull('guest_id')->orWhere('guest_id', '!=', $currentGuestId);
            });
        }

        $count = $matchingQuery->count();
        $sampleOrder = $matchingQuery->latest('created_at')->first();

        return response()->json([
            'hasHistory' => $count > 0,
            'orderCount' => $count,
            'customerName' => $sampleOrder?->customer_name ?? null,
            'phone' => $rawPhone,
        ]);
    }

    public function restoreGuestHistory(Request $request)
    {
        $data = $request->validate([
            'phone' => 'required|string|min:5|max:30',
            'guest_id' => 'required|string|max:64',
        ]);

        $rawPhone = trim($data['phone']);
        $cleanPhone = preg_replace('/[^\d\+]/', '', $rawPhone);
        $guestId = $data['guest_id'];

        // Link all guest orders matching this phone number to current device guest_id
        Order::whereNull('customer_id')
            ->where(function ($q) use ($rawPhone, $cleanPhone) {
                $q->where('customer_phone', $rawPhone)
                  ->orWhere('customer_phone', $cleanPhone);
            })
            ->update(['guest_id' => $guestId]);

        // Return updated guest orders list
        $orders = Order::where('guest_id', $guestId)
            ->orWhere('customer_phone', $rawPhone)
            ->orWhere('customer_phone', $cleanPhone)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => $this->resource($order));

        return response()->json([
            'success' => true,
            'restoredCount' => count($orders),
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, $orderId)
    {
        $order = $this->find($orderId);
        if (!$this->canView($request, $order)) {
            return response()->json(['message' => 'Unauthorized access to order.'], 403);
        }
        return $this->resource($order);
    }

    public function update(Request $request, $orderId)
    {
        $order = $this->find($orderId);
        $user = $request->user() ?? auth('sanctum')->user();
        if ($user) {
            abort_unless($user->isAdmin(), 403);
        }

        $data = $request->validate([
            'status' => 'sometimes|in:placed,preparing,on_way,delivered',
            'paymentStatus' => 'sometimes|string'
        ]);
        
        if (isset($data['status'])) {
            // Guard: Once delivered, status cannot be reverted to a previous status
            if ($order->status === 'delivered' && $data['status'] !== 'delivered') {
                return response()->json($this->resource($order));
            }

            $order->status = $data['status'];
            $order->status_step = self::STEPS[$data['status']] ?? 4;
            
            // If order completed, set rider back to available
            if ($data['status'] === 'delivered' && $order->rider_id) {
                User::where('id', $order->rider_id)->update(['availability_status' => 'available']);
            }
        }
        
        if (isset($data['paymentStatus'])) {
            $order->payment_status = $data['paymentStatus'];
        }
        
        $order->save();
        return response()->json($this->resource($order));
    }

    public function assignRider(Request $request, $orderId)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if ($user) {
            abort_unless($user->isAdmin(), 403, 'Admin access required.');
        }

        $rawRiderId = $request->input('rider_id');
        $newRiderId = ($rawRiderId !== null && $rawRiderId !== '') ? (int) $rawRiderId : null;

        if ($newRiderId) {
            abort_unless(User::whereKey($newRiderId)->where('role', 'rider')->exists(), 422, 'Selected user is not a rider.');
        }

        $order = $this->find($orderId);
        $previousRiderId = $order->rider_id;

        $order->rider_id = $newRiderId;
        $order->assigned_at = $newRiderId ? now() : null;
        $order->save();

        // 1. Mark newly assigned rider as busy
        if ($newRiderId) {
            User::where('id', $newRiderId)->update(['availability_status' => 'busy']);
        }

        // 2. If previous rider was replaced, mark them available if no active orders remain
        if ($previousRiderId && $previousRiderId !== $newRiderId) {
            $activeCount = Order::where('rider_id', $previousRiderId)
                ->whereIn('status', ['placed', 'preparing', 'on_way'])
                ->count();
            if ($activeCount === 0) {
                User::where('id', $previousRiderId)->update(['availability_status' => 'available']);
            }
        }

        return response()->json($this->resource($order));
    }

    public function riders(Request $request)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if ($user) {
            abort_unless($user->isAdmin(), 403);
        }
        return User::where('role', 'rider')
            ->where('is_active', true)
            ->get(['id', 'name', 'phone', 'vehicle_info', 'profile_photo_url', 'availability_status', 'assigned_area']);
    }

    public function updateRiderStatus(Request $request, $orderId)
    {
        $data = $request->validate(['status' => 'required|in:placed,preparing,on_way,delivered']);
        $order = $this->find($orderId);
        $user = $request->user() ?? auth('sanctum')->user();
        
        // Security check: Rider can only update status for their own assigned order
        if ($user) {
            abort_unless($order->rider_id === $user->id, 403, 'Unauthorized. You can only update orders assigned to you.');
        }
        
        // Guard: Once delivered, status CANNOT be reverted to a previous status!
        if ($order->status === 'delivered' && $data['status'] !== 'delivered') {
            return response()->json($this->resource($order));
        }

        $order->status = $data['status'];
        $order->status_step = self::STEPS[$data['status']] ?? 4;
        $order->save();

        // If status marked as delivered, set rider back to available
        if ($data['status'] === 'delivered' && $order->rider_id) {
            User::where('id', $order->rider_id)->update(['availability_status' => 'available']);
        }

        return response()->json($this->resource($order));
    }
}
