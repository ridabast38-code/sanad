<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\ClientHomeController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\SpecialistController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::get('/playground', function () {
    return Inertia::render('playground');
});

Route::middleware(['auth'])->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'show'])->name('onboarding.show');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    Route::get('dashboard', [ClientHomeController::class, 'index'])
        ->middleware('onboarded')
        ->name('dashboard');

    Route::get('specialists', [SpecialistController::class, 'index'])
        ->middleware('onboarded')
        ->name('specialists.index');

    Route::get('therapists/{practitioner}', [SpecialistController::class, 'show'])
        ->middleware('onboarded')
        ->name('specialists.show');

    Route::post('bookings', [BookingController::class, 'store'])
        ->middleware('onboarded')
        ->name('bookings.store');
});

Route::get('privacy', fn () => Inertia::render('legal/privacy'))->name('privacy');
Route::get('terms', fn () => Inertia::render('legal/terms'))->name('terms');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
