<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PromoController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DealController;
use App\Http\Controllers\Api\RiderController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:60,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/guest/history/check', [OrderController::class, 'checkGuestHistory']);
    Route::post('/guest/history/restore', [OrderController::class, 'restoreGuestHistory']);
});

Route::get('/chat/{orderId}', [ChatController::class, 'index']);
Route::post('/chat', [ChatController::class, 'store']);
Route::post('/chat/{orderId}/read', [ChatController::class, 'markAsRead']);
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{orderId}', [OrderController::class, 'show']);

Route::get('/menu-items', [MenuController::class, 'index']);
Route::get('/menu-items/{menuItem}', [MenuController::class, 'show']);
Route::get('/promos', [PromoController::class, 'index']);
Route::get('/promos/{promo}', [PromoController::class, 'show']);

// Public routes for categories and deals (customer-facing)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/deals', [DealController::class, 'index']);
Route::get('/deals/{deal}', [DealController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Addresses (customer)
    Route::middleware('role.customer')->group(function () {
        Route::apiResource('/addresses', AddressController::class);
    });

    // Admin only
    Route::middleware('role.admin')->group(function () {
        // Admin rider management
        Route::apiResource('/riders', RiderController::class);
        Route::post('/riders/{id}/toggle-status', [RiderController::class, 'toggleStatus']);
        Route::post('/riders/{id}/reset-password', [RiderController::class, 'resetPassword']);
        Route::post('/orders/{orderId}/assign-rider', [OrderController::class, 'assignRider']);
        Route::patch('/orders/{orderId}/assign-rider', [OrderController::class, 'assignRider']);
        Route::patch('/orders/{orderId}/rider', [OrderController::class, 'assignRider']);
        Route::put('/orders/{orderId}', [OrderController::class, 'update']);
        Route::get('/riders-list', [OrderController::class, 'riders']);
        Route::apiResource('/menu-items', MenuController::class)->except(['index', 'show']);
        Route::post('/promos', [PromoController::class, 'store']);
        Route::put('/promos/{promo}', [PromoController::class, 'update']);
        Route::delete('/promos/{promo}', [PromoController::class, 'destroy']);
        Route::apiResource('/staff-members', StaffController::class);
        Route::apiResource('/inventory-items', InventoryController::class);
        // Admin category & deal management
        Route::apiResource('/categories', CategoryController::class)->except(['index']);
        Route::post('/deals', [DealController::class, 'store']);
        Route::put('/deals/{deal}', [DealController::class, 'update']);
        Route::delete('/deals/{deal}', [DealController::class, 'destroy']);
    });

    // Rider only
    Route::middleware('role.rider')->group(function () {
        Route::get('/rider/orders', [OrderController::class, 'index']);
        Route::patch('/rider/orders/{orderId}/status', [OrderController::class, 'updateRiderStatus']);
        Route::get('/rider/profile', [RiderController::class, 'updateSelfProfile']);
        Route::put('/rider/profile', [RiderController::class, 'updateSelfProfile']);
    });
});
