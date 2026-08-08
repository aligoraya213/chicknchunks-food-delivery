<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    private function extractPayload(Request $request): array
    {
        // Handle both JSON and FormData/multipart requests
        if ($request->isJson() || $request->expectsJson()) {
            return $request->all();
        }
        return $request->all();
    }

    private function normalizePayload(array $payload, ?MenuItem $existing = null): array
    {
        $data = [
            'name' => $payload['name'] ?? null,
            'category' => $payload['category'] ?? null,
            'price' => $payload['price'] ?? null,
            'original_price' => $payload['original_price'] ?? $payload['originalPrice'] ?? null,
            'description' => $payload['description'] ?? null,
            'image' => $payload['image'] ?? ($existing ? $existing->image : null),
            'badge' => $payload['badge'] ?? null,
            'spice_level' => $payload['spice_level'] ?? $payload['spiceLevel'] ?? 1,
            'popular' => $payload['popular'] ?? false,
            'is_available' => $payload['is_available'] ?? $payload['isAvailable'] ?? true,
            'options' => $payload['options'] ?? ($existing ? $existing->options : null),
            'rating' => $payload['rating'] ?? 4.8,
            'reviews' => $payload['reviews'] ?? 0,
            'prep_time' => $payload['prep_time'] ?? $payload['prepTime'] ?? '10 min',
            'calories' => $payload['calories'] ?? '540 kcal',
        ];

        // If options is a JSON string (from FormData), decode it
        if (is_string($data['options'])) {
            $decoded = json_decode($data['options'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $data['options'] = $decoded;
            }
        }

        return $data;
    }

    private function toApiResource(MenuItem $item): array
    {
        return [
            'id' => $item->id,
            'name' => $item->name,
            'category' => $item->category,
            'price' => (float) $item->price,
            'originalPrice' => $item->original_price ? (float) $item->original_price : null,
            'description' => $item->description,
            'image' => $this->imageUrl($item->image),
            'badge' => $item->badge,
            'spiceLevel' => (int) ($item->spice_level ?? 1),
            'popular' => (bool) $item->popular,
            'isAvailable' => (bool) $item->is_available,
            'options' => $item->options ?? ['spiceLevels' => ['Mild', 'Spicy'], 'additions' => []],
            'rating' => (float) ($item->rating ?? 4.8),
            'reviews' => (int) ($item->reviews ?? 0),
            'prepTime' => $item->prep_time ?? '10 min',
            'calories' => $item->calories ?? '540 kcal',
        ];
    }

    private function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/')) {
            return $path;
        }
        return '/storage/' . ltrim($path, '/');
    }

    public function index()
    {
        return MenuItem::all()->map(fn ($item) => $this->toApiResource($item));
    }

    public function store(Request $request)
    {
        $payload = $this->extractPayload($request);

        // Handle image upload
        if ($request->hasFile('image')) {
            $request->validate(['image' => 'image|mimes:jpeg,png,jpg,webp|max:2048']);
            $payload['image'] = $request->file('image')->store('menu-items', 'public');
        }

        $item = MenuItem::create($this->normalizePayload($payload));
        return response()->json($this->toApiResource($item), 201);
    }

    public function show(MenuItem $menuItem)
    {
        return $this->toApiResource($menuItem);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $payload = $this->extractPayload($request);

        // Handle image upload
        if ($request->hasFile('image')) {
            $request->validate(['image' => 'image|mimes:jpeg,png,jpg,webp|max:2048']);
            // Delete old image if it was a stored file
            if ($menuItem->image && !str_starts_with($menuItem->image, 'http') && !str_starts_with($menuItem->image, '/')) {
                Storage::disk('public')->delete($menuItem->image);
            }
            $payload['image'] = $request->file('image')->store('menu-items', 'public');
        }

        $menuItem->update($this->normalizePayload($payload, $menuItem));
        return $this->toApiResource($menuItem);
    }

    public function destroy(MenuItem $menuItem)
    {
        // Delete image if it was a stored file
        if ($menuItem->image && !str_starts_with($menuItem->image, 'http') && !str_starts_with($menuItem->image, '/')) {
            Storage::disk('public')->delete($menuItem->image);
        }
        $menuItem->delete();
        return response()->json(null, 204);
    }
}
