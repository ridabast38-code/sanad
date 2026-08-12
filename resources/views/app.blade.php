<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'OurSanad') }}</title>

        {{-- The SVG is listed FIRST and is the one modern browsers use, including
             for history and search suggestions. A ?v= does not reliably evict a
             favicon — Chrome keeps its own icon database keyed by URL and is slow
             to re-ask — so the new mark ships under a filename that has never
             existed before, which nothing can have cached. It also carries a
             prefers-color-scheme rule, so it turns pale on a dark tab strip
             instead of disappearing into it. The PNGs and the .ico stay for
             Safari and anything older. --}}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=12">
        <link rel="icon" href="/favicon.ico?v=12" sizes="any">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=12">
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png?v=12">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png?v=12">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=12">

        {{-- Social share / link preview (Open Graph + Twitter).

             WhatsApp, iMessage and Facebook all cache a preview against the URL
             and never re-fetch it on their own, so the ?v= is not for browsers —
             bump it whenever og-image.jpg is redrawn or the old card keeps
             showing for everyone who has ever received the link.

             The URLs are forced to https outside of local. WhatsApp silently
             drops the whole preview on a plain-http image, and url() emits http
             whenever the TLS terminates at a proxy in front of PHP. --}}
        @php($ogTitle = 'OurSanad — A safe space for your mind')
        @php($ogDescription = 'Real, confidential sessions with licensed clinical doctors — online, on your schedule, guided with care.')
        @php($ogImage = app()->isLocal() ? url('/og-image.jpg?v=3') : secure_url('/og-image.jpg?v=3'))
        @php($ogUrl = app()->isLocal() ? url()->current() : secure_url(request()->path()))
        <meta name="description" content="{{ $ogDescription }}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="OurSanad">
        <meta property="og:locale" content="en_US">
        <meta property="og:title" content="{{ $ogTitle }}">
        <meta property="og:description" content="{{ $ogDescription }}">
        <meta property="og:url" content="{{ $ogUrl }}">
        <meta property="og:image" content="{{ $ogImage }}">
        <meta property="og:image:secure_url" content="{{ $ogImage }}">
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="OurSanad — a safe space for your mind">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $ogTitle }}">
        <meta name="twitter:description" content="{{ $ogDescription }}">
        <meta name="twitter:image" content="{{ $ogImage }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|fraunces:400,500,600,600i" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
