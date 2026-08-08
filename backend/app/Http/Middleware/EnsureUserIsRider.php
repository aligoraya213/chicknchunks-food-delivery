<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsRider
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isRider()) {
            return response()->json(['message' => 'Forbidden: rider access required'], 403);
        }
        return $next($request);
    }
}
