<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class RiderController extends Controller
{
    private function toApiResource(User $rider): array
    {
        return [
            'id' => $rider->id,
            'name' => $rider->name,
            'email' => $rider->email,
            'phone' => $rider->phone ?? '',
            'role' => 'rider',
            'address' => $rider->address ?? '',
            'vehicleType' => $rider->vehicle_type ?? 'Motorcycle',
            'vehicleNumber' => $rider->vehicle_number ?? $rider->vehicle_info ?? '',
            'licenseNumber' => $rider->license_number ?? '',
            'assignedArea' => $rider->assigned_area ?? 'Main City',
            'availabilityStatus' => $rider->availability_status ?? 'on_duty',
            'isActive' => (bool) $rider->is_active,
            'hiredAt' => optional($rider->hired_at)->toDateString(),
            'notes' => $rider->notes ?? '',
            'activeDeliveriesCount' => $rider->riderOrders()->where('status', '!=', 'delivered')->count(),
            'completedDeliveriesCount' => $rider->riderOrders()->where('status', 'delivered')->count(),
        ];
    }

    public function index()
    {
        return User::where('role', 'rider')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($rider) => $this->toApiResource($rider));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'vehicleType' => 'nullable|string',
            'vehicleNumber' => 'nullable|string',
            'licenseNumber' => 'nullable|string',
            'assignedArea' => 'nullable|string',
            'availabilityStatus' => 'nullable|string',
            'isActive' => 'nullable|boolean',
            'hiredAt' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $rider = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'rider',
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'vehicle_type' => $validated['vehicleType'] ?? 'Motorcycle',
            'vehicle_number' => $validated['vehicleNumber'] ?? null,
            'vehicle_info' => $validated['vehicleNumber'] ?? null,
            'license_number' => $validated['licenseNumber'] ?? null,
            'assigned_area' => $validated['assignedArea'] ?? 'Main City',
            'availability_status' => $validated['availabilityStatus'] ?? 'on_duty',
            'is_active' => $validated['isActive'] ?? true,
            'hired_at' => $validated['hiredAt'] ?? now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($this->toApiResource($rider), 201);
    }

    public function show($id)
    {
        $rider = User::where('role', 'rider')->findOrFail($id);
        return $this->toApiResource($rider);
    }

    public function update(Request $request, $id)
    {
        $rider = User::where('role', 'rider')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($rider->id)],
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'vehicleType' => 'nullable|string',
            'vehicleNumber' => 'nullable|string',
            'licenseNumber' => 'nullable|string',
            'assignedArea' => 'nullable|string',
            'availabilityStatus' => 'nullable|string',
            'isActive' => 'nullable|boolean',
            'hiredAt' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? $rider->phone,
            'address' => $validated['address'] ?? $rider->address,
            'vehicle_type' => $validated['vehicleType'] ?? $rider->vehicle_type,
            'vehicle_number' => $validated['vehicleNumber'] ?? $rider->vehicle_number,
            'vehicle_info' => $validated['vehicleNumber'] ?? $rider->vehicle_info,
            'license_number' => $validated['licenseNumber'] ?? $rider->license_number,
            'assigned_area' => $validated['assignedArea'] ?? $rider->assigned_area,
            'availability_status' => $validated['availabilityStatus'] ?? $rider->availability_status,
            'is_active' => isset($validated['isActive']) ? $validated['isActive'] : $rider->is_active,
            'notes' => $validated['notes'] ?? $rider->notes,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $rider->update($updateData);
        return $this->toApiResource($rider);
    }

    public function destroy($id)
    {
        $rider = User::where('role', 'rider')->findOrFail($id);
        $rider->delete();
        return response()->json(null, 204);
    }

    public function toggleStatus($id)
    {
        $rider = User::where('role', 'rider')->findOrFail($id);
        $rider->update(['is_active' => !$rider->is_active]);
        return $this->toApiResource($rider);
    }

    public function resetPassword(Request $request, $id)
    {
        $validated = $request->validate([
            'newPassword' => 'required|string|min:8',
        ]);

        $rider = User::where('role', 'rider')->findOrFail($id);
        $rider->update([
            'password' => Hash::make($validated['newPassword'])
        ]);

        return response()->json(['message' => 'Rider password updated successfully']);
    }

    public function updateSelfProfile(Request $request)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if (!$user || !$user->isRider()) {
            return response()->json(['message' => 'Unauthorized rider access'], 403);
        }

        $validated = $request->validate([
            'phone' => 'nullable|string',
            'availabilityStatus' => 'nullable|string',
            'currentPassword' => 'nullable|string',
            'newPassword' => 'nullable|string|min:8',
        ]);

        if (!empty($validated['newPassword'])) {
            if (empty($validated['currentPassword']) || !Hash::check($validated['currentPassword'], $user->password)) {
                return response()->json(['message' => 'Current password does not match'], 422);
            }
            $user->password = Hash::make($validated['newPassword']);
        }

        if (isset($validated['phone'])) {
            $user->phone = $validated['phone'];
        }
        if (isset($validated['availabilityStatus'])) {
            $user->availability_status = $validated['availabilityStatus'];
        }

        $user->save();
        return response()->json($this->toApiResource($user));
    }
}
