<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\App\Http\Middleware\AddSecurityHeaders::class);
        $middleware->alias([
            'role.admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'role.customer' => \App\Http\Middleware\EnsureUserIsCustomer::class,
            'role.rider' => \App\Http\Middleware\EnsureUserIsRider::class,
        ]);
        // This is an API-only app using Sanctum; never redirect to a named 'login' route.
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON 401 for unauthenticated API requests instead of redirecting
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => $e->getMessage()], 401);
            }
        });
    })->create();
