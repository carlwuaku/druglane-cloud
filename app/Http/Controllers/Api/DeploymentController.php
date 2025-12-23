<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class DeploymentController extends Controller
{
    /**
     * Run database migrations
     *
     * This endpoint allows running migrations without SSH access.
     * It's protected by a deployment token for security.
     *
     * Usage: POST /api/deploy/migrate
     * Headers: X-Deploy-Token: your-secret-token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function migrate(Request $request)
    {
        // Verify deployment token
        $deployToken = config('app.deploy_token');
        $providedToken = $request->header('X-Deploy-Token');

        if (empty($deployToken)) {
            return response()->json([
                'success' => false,
                'message' => 'Deployment token not configured. Set DEPLOY_TOKEN in .env'
            ], 500);
        }

        if ($providedToken !== $deployToken) {
            Log::warning('Unauthorized migration attempt', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Invalid deployment token.'
            ], 403);
        }

        // Only allow in production or when explicitly enabled
        if (!app()->environment('production') && !config('app.allow_deploy_endpoint', false)) {
            return response()->json([
                'success' => false,
                'message' => 'Deployment endpoint is disabled in this environment.'
            ], 403);
        }

        try {
            Log::info('Migration started via deployment endpoint', [
                'ip' => $request->ip(),
            ]);

            // Run migrations
            Artisan::call('migrate', [
                '--force' => true, // Required for production
            ]);

            $migrationOutput = Artisan::output();

            Log::info('Migration completed successfully', [
                'output' => $migrationOutput,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Migrations completed successfully',
                'output' => $migrationOutput,
                'timestamp' => now()->toDateTimeString(),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Migration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Migration failed: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear application cache
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCache(Request $request)
    {
        // Verify deployment token
        $deployToken = config('app.deploy_token');
        $providedToken = $request->header('X-Deploy-Token');

        if ($providedToken !== $deployToken) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $results = [];

            // Clear various caches
            Artisan::call('cache:clear');
            $results['cache'] = Artisan::output();

            Artisan::call('config:clear');
            $results['config'] = Artisan::output();

            Artisan::call('route:clear');
            $results['route'] = Artisan::output();

            Artisan::call('view:clear');
            $results['view'] = Artisan::output();

            Log::info('Cache cleared via deployment endpoint', [
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'All caches cleared successfully',
                'results' => $results,
                'timestamp' => now()->toDateTimeString(),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Cache clear failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Cache clear failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Optimize application for production
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function optimize(Request $request)
    {
        // Verify deployment token
        $deployToken = config('app.deploy_token');
        $providedToken = $request->header('X-Deploy-Token');

        if ($providedToken !== $deployToken) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $results = [];

            // Cache configuration
            Artisan::call('config:cache');
            $results['config_cache'] = Artisan::output();

            // Cache routes
            Artisan::call('route:cache');
            $results['route_cache'] = Artisan::output();

            // Cache views
            Artisan::call('view:cache');
            $results['view_cache'] = Artisan::output();

            Log::info('Application optimized via deployment endpoint', [
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application optimized successfully',
                'results' => $results,
                'timestamp' => now()->toDateTimeString(),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Optimization failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Optimization failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get deployment status/info
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function status(Request $request)
    {
        // Verify deployment token
        $deployToken = config('app.deploy_token');
        $providedToken = $request->header('X-Deploy-Token');

        if ($providedToken !== $deployToken) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'environment' => app()->environment(),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'database' => config('database.default'),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
            'timestamp' => now()->toDateTimeString(),
        ], 200);
    }
}
