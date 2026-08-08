<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    private function normalizePayload(array $payload): array
    {
        return [
            'name' => $payload['name'] ?? null,
            'category' => $payload['category'] ?? 'ingredients',
            'stock_count' => $payload['stock_count'] ?? $payload['stockCount'] ?? 0,
            'restock_threshold' => $payload['restock_threshold'] ?? $payload['restockThreshold'] ?? 10,
            'unit' => $payload['unit'] ?? 'pcs',
            'is_active' => $payload['is_active'] ?? $payload['isActive'] ?? true,
            'cost' => $payload['cost'] ?? 0,
        ];
    }

    private function toApiResource(InventoryItem $item): array
    {
        return [
            'id' => $item->id,
            'name' => $item->name,
            'category' => $item->category,
            'stockCount' => (int) $item->stock_count,
            'stock_count' => $item->stock_count,
            'restockThreshold' => (int) $item->restock_threshold,
            'restock_threshold' => $item->restock_threshold,
            'unit' => $item->unit,
            'isActive' => (bool) $item->is_active,
            'is_active' => $item->is_active,
            'cost' => (float) $item->cost,
        ];
    }

    public function index()
    {
        return InventoryItem::orderBy('name')->get()->map(fn ($item) => $this->toApiResource($item));
    }

    public function store(Request $request)
    {
        $item = InventoryItem::create($this->normalizePayload($request->all()));
        return response()->json($this->toApiResource($item), 201);
    }

    public function show($item)
    {
        $inventoryItem = InventoryItem::findOrFail($item);
        return $this->toApiResource($inventoryItem);
    }

    public function update(Request $request, $item)
    {
        $inventoryItem = InventoryItem::findOrFail($item);
        $inventoryItem->update($this->normalizePayload($request->all()));
        return $this->toApiResource($inventoryItem);
    }

    public function destroy($item)
    {
        $inventoryItem = InventoryItem::findOrFail($item);
        $inventoryItem->delete();
        return response()->json(null, 204);
    }
}
