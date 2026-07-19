<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Sanad') }}</title>

        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=7">
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png?v=7">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png?v=7">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=7">

        {{-- Social share / link preview (Open Graph + Twitter) --}}
        @php($ogTitle = 'Sanad — A safe space for your mind')
        @php($ogDescription = 'Real, confidential sessions with licensed clinical psychologists — online, on your schedule, guided with care.')
        <meta name="description" content="{{ $ogDescription }}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Sanad">
        <meta property="og:title" content="{{ $ogTitle }}">
        <meta property="og:description" content="{{ $ogDescription }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:image" content="{{ url('/og-image.jpg') }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $ogTitle }}">
        <meta name="twitter:description" content="{{ $ogDescription }}">
        <meta name="twitter:image" content="{{ url('/og-image.jpg') }}">

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
