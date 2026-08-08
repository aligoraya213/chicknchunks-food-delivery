<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function login(Request $request)
    {
        $username = $request->input('username');
        $password = $request->input('password');

        if ($username === 'admin' && $password === 'chickn123') {
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 401);
    }

    public function logout()
    {
        return response()->json(['success' => true]);
    }
}
