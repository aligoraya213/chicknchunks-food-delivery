<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::orderBy('name')->get()->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')],
        ]);

        $category = Category::create($validated);

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
        ], 201);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
        ]);

        $category->update($validated);

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
        ]);
    }

    public function destroy(Category $category)
    {
        // Check if any menu items use this category
        $itemsUsing = \App\Models\MenuItem::where('category', $category->name)->count();
        if ($itemsUsing > 0) {
            return response()->json([
                'message' => "Cannot delete category '{$category->name}' because it is used by {$itemsUsing} menu item(s). Remove or reassign those items first.",
            ], 409);
        }

        $category->delete();

        return response()->json(null, 204);
    }
}
