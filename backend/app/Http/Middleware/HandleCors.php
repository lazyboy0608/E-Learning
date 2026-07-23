<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    /**
     * Danh sách các origin được phép.
     */
    protected array $allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin');

        // Xử lý preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            $response = response('', 204);
            return $this->addCorsHeaders($response, $origin);
        }

        $response = $next($request);

        return $this->addCorsHeaders($response, $origin);
    }

    protected function addCorsHeaders(Response $response, ?string $origin): Response
    {
        if ($origin && in_array($origin, $this->allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } else {
            // Fallback cho development
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
        }

        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-Socket-ID');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        return $response;
    }
}
