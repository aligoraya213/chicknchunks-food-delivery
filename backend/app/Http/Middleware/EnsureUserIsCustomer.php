<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCustomer
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isCustomer()) {
            return response()->json(['message' => 'Forbidden: customer access required'], 403);
        }
        return $next($request);
    }
}
