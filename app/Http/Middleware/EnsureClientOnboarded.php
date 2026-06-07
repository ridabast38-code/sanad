<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureClientOnboarded
{
    /**
     * Redirect clients who have not yet completed the onboarding questionnaire.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isClient() && ! $user->hasCompletedOnboarding()) {
            return to_route('onboarding.show');
        }

        return $next($request);
    }
}
