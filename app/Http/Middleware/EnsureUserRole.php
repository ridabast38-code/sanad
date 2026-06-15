<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Allow only users whose role matches one of the given roles; everyone
     * else is bounced to their own home route.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, array_map(fn (string $role) => UserRole::from($role), $roles), true)) {
            return $user
                ? to_route($user->homeRoute())
                : to_route('login');
        }

        return $next($request);
    }
}
