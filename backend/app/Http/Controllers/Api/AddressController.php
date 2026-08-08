<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->addresses;
    }

    public function store(Request $request)
    {
        $request->validate([
            'label' => 'nullable|string|max:50',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_default' => 'boolean',
        ]);

        $data = $request->all();
        $data['user_id'] = $request->user()->id;

        if (!empty($data['is_default'])) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = $request->user()->addresses()->create($data);
        return response()->json($address, 201);
    }

    public function show(Request $request, $id)
    {
        return $request->user()->addresses()->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->update($request->all());
        return $address;
    }

    public function destroy(Request $request, $id)
    {
        $request->user()->addresses()->findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
