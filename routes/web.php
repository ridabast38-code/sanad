<?php

use App\Http\Controllers\OnboardingController;
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

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->middleware('onboarded')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
