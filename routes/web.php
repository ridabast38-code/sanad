<?php

use App\Http\Controllers\Admin\BookingActionController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\PayoutController;
use App\Http\Controllers\Admin\PractitionerApprovalController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ClientHomeController;
use App\Http\Controllers\MeetingLinkController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\Practitioner\DashboardController as PractitionerDashboardController;
use App\Http\Controllers\Practitioner\PractitionerProfileController;
use App\Http\Controllers\Practitioner\ScheduleController;
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

    // A session's video link — set by an admin or the session's own practitioner.
    Route::patch('bookings/{booking}/meeting-link', [MeetingLinkController::class, 'update'])->name('bookings.meeting-link');

    // ===== Client area =====
    Route::middleware(['role:client', 'onboarded'])->group(function () {
        Route::get('dashboard', [ClientHomeController::class, 'index'])->name('dashboard');
        Route::get('specialists', [SpecialistController::class, 'index'])->name('specialists.index');
        Route::get('therapists/{practitioner}', [SpecialistController::class, 'show'])->name('specialists.show');
        Route::get('how-it-works', fn () => Inertia::render('client/how-it-works'))->name('how-it-works');
        Route::post('bookings', [BookingController::class, 'store'])->name('bookings.store');
        Route::get('bookings/{booking}/pay', [BookingController::class, 'pay'])->name('bookings.pay');
    });

    // ===== Practitioner area =====
    Route::middleware('role:practitioner')->prefix('practitioner')->name('practitioner.')->group(function () {
        Route::get('/', [PractitionerDashboardController::class, 'index'])->name('dashboard');
        Route::get('clients', [PractitionerDashboardController::class, 'clients'])->name('clients');
        Route::get('earnings', [PractitionerDashboardController::class, 'earnings'])->name('earnings');
        Route::get('schedule', [ScheduleController::class, 'edit'])->name('schedule.edit');
        Route::put('schedule', [ScheduleController::class, 'update'])->name('schedule.update');
        Route::get('profile', [PractitionerProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [PractitionerProfileController::class, 'update'])->name('profile.update');
        Route::put('services', [PractitionerProfileController::class, 'updateServices'])->name('services.update');
    });

    // ===== Admin area =====
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('practitioners', [AdminDashboardController::class, 'practitioners'])->name('practitioners');
        Route::patch('practitioners/{practitioner}', [PractitionerApprovalController::class, 'update'])->name('practitioners.approval');
        Route::post('staff', [StaffController::class, 'store'])->name('staff.store');
        Route::get('clients', [AdminDashboardController::class, 'clients'])->name('clients');
        Route::get('bookings', [AdminDashboardController::class, 'bookings'])->name('bookings');
        Route::patch('bookings/{booking}', [BookingActionController::class, 'update'])->name('bookings.action');
        Route::get('transactions', [AdminDashboardController::class, 'transactions'])->name('transactions');
        Route::patch('transactions/{transaction}/payout', [PayoutController::class, 'update'])->name('payouts.update');
        Route::post('practitioners/{practitioner}/payout-all', [PayoutController::class, 'settleAll'])->name('payouts.settle-all');
    });
});

Route::get('privacy', fn () => Inertia::render('legal/privacy'))->name('privacy');
Route::get('terms', fn () => Inertia::render('legal/terms'))->name('terms');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
