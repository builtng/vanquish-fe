<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            $user = $request->user();
            if ($user->role === 'counsellor' && $user->training_counsellor_id) {
                \App\Models\TrainingCounsellor::where('id', $user->training_counsellor_id)
                    ->update(['last_activity' => now()]);
            }
        }

        return $next($request);
    }
}
