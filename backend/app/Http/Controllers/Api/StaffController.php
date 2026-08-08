<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffMember;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    private function normalizePayload(array $payload): array
    {
        return [
            'name' => $payload['name'] ?? null,
            'role' => $payload['role'] ?? 'Kitchen Staff',
            'department' => $payload['department'] ?? $payload['assigned_section'] ?? $payload['assignedSection'] ?? 'Kitchen',
            'assigned_section' => $payload['department'] ?? $payload['assigned_section'] ?? $payload['assignedSection'] ?? 'Kitchen',
            'phone' => $payload['phone'] ?? null,
            'address' => $payload['address'] ?? null,
            'cnic' => $payload['cnic'] ?? null,
            'status' => $payload['status'] ?? 'active',
            'notes' => $payload['notes'] ?? null,
            'hired_at' => $payload['hired_at'] ?? $payload['hiredAt'] ?? now(),
        ];
    }

    private function toApiResource(StaffMember $staff): array
    {
        return [
            'id' => $staff->id,
            'name' => $staff->name,
            'role' => $staff->role,
            'department' => $staff->department ?? $staff->assigned_section ?? 'Kitchen',
            'assignedSection' => $staff->assigned_section ?? 'Kitchen',
            'phone' => $staff->phone ?? '',
            'address' => $staff->address ?? '',
            'cnic' => $staff->cnic ?? '',
            'status' => $staff->status ?? 'active',
            'notes' => $staff->notes ?? '',
            'hiredAt' => optional($staff->hired_at)->toDateString(),
        ];
    }

    public function index()
    {
        return StaffMember::where('role', '!=', 'rider')
            ->orderBy('role')
            ->get()
            ->map(fn ($member) => $this->toApiResource($member));
    }

    public function store(Request $request)
    {
        $payload = $request->all();
        $staff = StaffMember::create($this->normalizePayload($payload));
        return response()->json($this->toApiResource($staff), 201);
    }

    public function show($staff)
    {
        $staff = StaffMember::findOrFail($staff);
        return $this->toApiResource($staff);
    }

    public function update(Request $request, $staff)
    {
        $staffMember = StaffMember::findOrFail($staff);
        $payload = $request->all();
        $staffMember->update($this->normalizePayload($payload));
        return $this->toApiResource($staffMember);
    }

    public function destroy($staff)
    {
        $staffMember = StaffMember::findOrFail($staff);
        $staffMember->delete();
        return response()->json(null, 204);
    }
}
