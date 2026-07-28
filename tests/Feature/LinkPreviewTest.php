<?php

/**
 * The card WhatsApp draws when someone shares a Sanad link.
 *
 * It is the first thing most clients ever see of the app — the link gets
 * forwarded long before anyone opens it — and it fails silently: a missing or
 * http-only og:image just renders as a bare blue link with no explanation.
 * These cover the three things that actually break it.
 */
test('the page carries the tags a link preview is built from', function () {
    $response = $this->get(route('home'))->assertOk();

    foreach ([
        '<meta property="og:title"',
        '<meta property="og:description"',
        '<meta property="og:image"',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
    ] as $tag) {
        $response->assertSee($tag, escape: false);
    }
});

test('the preview image is the real file, at the size the tags promise', function () {
    $path = public_path('og-image.jpg');

    expect($path)->toBeReadableFile();

    [$width, $height] = getimagesize($path);

    expect($width)->toBe(1200)
        ->and($height)->toBe(630);

    // WhatsApp drops the preview entirely above ~600KB rather than resizing.
    expect(filesize($path))->toBeLessThan(600 * 1024);
});

test('the preview image is served over https once the app is not local', function () {
    app()->detectEnvironment(fn () => 'production');

    $this->get(route('home'))
        ->assertOk()
        ->assertSee('<meta property="og:image" content="https://', escape: false);
});
