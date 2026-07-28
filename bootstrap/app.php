<?php

use App\Http\Middleware\EnsureClientOnboarded;
use App\Http\Middleware\EnsureUserRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        /**
         * TLS terminates at nginx (and at Cloudflare in front of it), so PHP sees
         * a plain http request and url() builds http:// links. That silently
         * broke link previews: WhatsApp and iMessage refuse an http og:image and
         * fall back to a bare link with no card.
         */
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'onboarded' => EnsureClientOnboarded::class,
            'role' => EnsureUserRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
