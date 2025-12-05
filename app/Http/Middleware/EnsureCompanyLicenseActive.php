<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyLicenseActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Admins bypass license checks
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Company users must have a valid license
        if ($user->isCompanyUser() && $user->company) {
            if (!$user->company->isLicenseActive()) {
                return response()->json([
                    'message' => 'Your company license is inactive or expired. Please contact your administrator.'
                ], 403);
            }
        }

        return $next($request);
    }
}
