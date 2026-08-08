<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    private function normalizePayload(array $payload): array
    {
        return [
            'code' => $payload['code'] ?? null,
            'discount_percent' => $payload['discount_percent'] ?? $payload['discountPercent'] ?? 0,
            'discount_flat' => $payload['discount_flat'] ?? $payload['discountFlat'] ?? 0,
            'free_delivery' => $payload['free_delivery'] ?? $payload['freeDelivery'] ?? false,
            'description' => $payload['description'] ?? null,
            'is_active' => $payload['is_active'] ?? $payload['isActive'] ?? true,
        ];
    }

    private function toApiResource(Promo $promo): array
    {
        return [
            'code' => $promo->code,
            'discountPercent' => (float) $promo->discount_percent,
            'discount_percent' => $promo->discount_percent,
            'discountFlat' => (float) $promo->discount_flat,
            'discount_flat' => $promo->discount_flat,
            'freeDelivery' => (bool) $promo->free_delivery,
            'free_delivery' => $promo->free_delivery,
            'description' => $promo->description,
            'isActive' => (bool) $promo->is_active,
            'is_active' => $promo->is_active,
        ];
    }

    public function index()
    {
        return Promo::all()->mapWithKeys(fn ($promo) => [$promo->code => $this->toApiResource($promo)])->all();
    }

    public function store(Request $request)
    {
        $promo = Promo::updateOrCreate(
            ['code' => $request->input('code')],
            $this->normalizePayload($request->all())
        );

        return response()->json($this->toApiResource($promo), 201);
    }

    public function show($promo)
    {
        $promo = Promo::where('code', $promo)->firstOrFail();
        return $this->toApiResource($promo);
    }

    public function update(Request $request, $promo)
    {
        $promo = Promo::where('code', $promo)->firstOrFail();
        $payload = $this->normalizePayload($request->all());
        $payload['code'] = $promo->code;
        $promo->update($payload);
        return $this->toApiResource($promo);
    }

    public function destroy($promo)
    {
        $promo = Promo::where('code', $promo)->firstOrFail();
        $promo->delete();
        return response()->json(null, 204);
    }
}
