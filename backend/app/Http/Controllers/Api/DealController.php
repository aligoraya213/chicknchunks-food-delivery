<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\DealItem;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DealController extends Controller
{
    public function index()
    {
        return Deal::with('items.menuItem')->orderBy('created_at', 'desc')->get()->map(fn ($deal) => $this->toApiResource($deal));
    }

    public function show(Deal $deal)
    {
        $deal->load('items.menuItem');
        return $this->toApiResource($deal);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_active' => 'boolean',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('deals', 'public');
        }

        $deal = Deal::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? '',
            'price' => $validated['price'],
            'image' => $imagePath,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        foreach ($validated['items'] as $item) {
            DealItem::create([
                'deal_id' => $deal->id,
                'menu_item_id' => $item['menu_item_id'],
                'quantity' => $item['quantity'],
            ]);
        }

        $deal->load('items.menuItem');
        return response()->json($this->toApiResource($deal), 201);
    }

    public function update(Request $request, Deal $deal)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_active' => 'boolean',
            'items' => 'sometimes|required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($deal->image) {
                Storage::disk('public')->delete($deal->image);
            }
            $deal->image = $request->file('image')->store('deals', 'public');
        }

        $deal->fill($request->only(['name', 'description', 'price', 'is_active']));
        $deal->save();

        // Update items if provided
        if ($request->has('items')) {
            $deal->items()->delete();
            foreach ($validated['items'] as $item) {
                DealItem::create([
                    'deal_id' => $deal->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                ]);
            }
        }

        $deal->load('items.menuItem');
        return $this->toApiResource($deal);
    }

    public function destroy(Deal $deal)
    {
        if ($deal->image) {
            Storage::disk('public')->delete($deal->image);
        }
        $deal->items()->delete();
        $deal->delete();

        return response()->json(null, 204);
    }

    private function toApiResource(Deal $deal): array
    {
        return [
            'id' => $deal->id,
            'name' => $deal->name,
            'description' => $deal->description,
            'price' => (float) $deal->price,
            'image' => $deal->image ? (str_starts_with($deal->image, 'http://') || str_starts_with($deal->image, 'https://') || str_starts_with($deal->image, '/') ? $deal->image : '/storage/' . ltrim($deal->image, '/')) : null,
            'isActive' => (bool) $deal->is_active,
            'items' => $deal->items->map(fn ($di) => [
                'id' => $di->menuItem->id,
                'name' => $di->menuItem->name,
                'quantity' => (int) $di->quantity,
                'price' => (float) $di->menuItem->price,
                'image' => $di->menuItem->image,
            ]),
            'createdAt' => $deal->created_at,
        ];
    }
}
