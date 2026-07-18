<?php

use App\Enums\UserRole;
use App\Http\Controllers\Admin\BookingActionController;
use App\Http\Controllers\Admin\BookingRescheduleController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ManualBookingController;
use App\Http\Controllers\Admin\PayoutController;
use App\Http\Controllers\Admin\PractitionerApprovalController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ClientHomeController;
use App\Http\Controllers\EmergencyController;
use App\Http\Controllers\MeetingLinkController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\OngoingSupportController;
use App\Http\Controllers\Practitioner\DashboardController as PractitionerDashboardController;
use App\Http\Controllers\Practitioner\PractitionerProfileController;
use App\Http\Controllers\Practitioner\ScheduleController;
use App\Http\Controllers\PublicBookingController;
use App\Http\Controllers\SpecialistController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Approved psychologists, so the landing team cards can deep-link straight
    // into each one's public (no-login) booking page.
    $specialists = User::query()
        ->where('role', UserRole::Practitioner)
        ->whereHas('practitionerProfile', fn ($query) => $query->where('approval_status', 'approved'))
        ->with('practitionerProfile')
        // Reshuffled on every request. Any fixed order is a ranking: whoever was
        // approved first would own the top of the page permanently, and whoever
        // joined last would be permanently last. Nobody owns a rank.
        ->inRandomOrder()
        ->get()
        ->map(fn ($practitioner) => [
            'name' => $practitioner->name,
            'slug' => $practitioner->slug,
            'photo_path' => $practitioner->practitionerProfile->photo_path,
            'headline' => $practitioner->practitionerProfile->headline,
            'bio' => $practitioner->practitionerProfile->bio,
            'approaches' => $practitioner->practitionerProfile->approaches ?? [],
            'languages' => $practitioner->practitionerProfile->languages ?? [],
        ])
        ->values();

    return Inertia::render('home', [
        // The emergency WhatsApp fast lane — for visitors in crisis who aren't
        // registered, the quickest way to reach a real person.
        'whatsappUrl' => 'https://wa.me/'.config('sanad.whatsapp').'?text='.rawurlencode('Hi Sanad, I need urgent help.'),
        'specialists' => $specialists,
    ]);
})->name('home');

Route::get('/playground', function () {
    return Inertia::render('playground');
});

Route::middleware(['auth', 'verified'])->group(function () {
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
        Route::get('practitioners/{practitioner}/edit', [StaffController::class, 'edit'])->name('practitioners.edit');
        Route::post('practitioners/{practitioner}/update', [StaffController::class, 'update'])->name('practitioners.update');
        Route::post('staff', [StaffController::class, 'store'])->name('staff.store');
        Route::get('clients', [AdminDashboardController::class, 'clients'])->name('clients');
        Route::get('bookings', [AdminDashboardController::class, 'bookings'])->name('bookings');
        Route::get('bookings/create', [ManualBookingController::class, 'create'])->name('bookings.create');
        Route::post('bookings', [ManualBookingController::class, 'store'])->name('bookings.store');
        Route::get('bookings/{booking}/reschedule', [BookingRescheduleController::class, 'edit'])->name('bookings.reschedule.edit');
        Route::patch('bookings/{booking}/reschedule', [BookingRescheduleController::class, 'update'])->name('bookings.reschedule');
        Route::patch('bookings/{booking}', [BookingActionController::class, 'update'])->name('bookings.action');
        Route::get('transactions', [AdminDashboardController::class, 'transactions'])->name('transactions');
        Route::patch('transactions/{transaction}/payout', [PayoutController::class, 'update'])->name('payouts.update');
        Route::post('practitioners/{practitioner}/payout-all', [PayoutController::class, 'settleAll'])->name('payouts.settle-all');
    });
});

// Emergency guided stabilization — public on purpose. Someone in crisis (whether
// a registered client or an unregistered visitor from the landing page) gets the
// same free flow immediately, with the option to log in, register, or reach us on
// WhatsApp. No auth, so a form never blocks help.
Route::get('emergency', [EmergencyController::class, 'index'])->name('emergency.index');
Route::get('emergency/{type}', [EmergencyController::class, 'show'])->name('emergency.show');

// Ongoing support — the "Ongoing Support" door from the landing page. The visitor
// picks the situation they've been through, walks the full guided flow, and is
// gently invited into real sessions (or a WhatsApp message) at the end. Public,
// like the emergency flow, so no form blocks the way in.
Route::get('ongoing', [OngoingSupportController::class, 'index'])->name('ongoing.index');
Route::get('ongoing/{type}', [OngoingSupportController::class, 'show'])->name('ongoing.show');

// The public directory — the landing's "View all" for visitors who aren't signed
// in. Deliberately a separate path from the client-only `specialists.index`: that
// one sits behind role:client, so a guest sent there would just bounce to login.
Route::get('psychologists', [PublicBookingController::class, 'directory'])->name('psychologists');

// Public, no-login booking — the "book without an account" path offered from
// the landing page. A visitor can complete a real booking as a guest, or be
// nudged to register; either way it lands in the same admin "accept once paid"
// pipeline. Signed-in clients are bounced to the richer in-app flow instead.
Route::get('book/{practitioner:slug}', [PublicBookingController::class, 'show'])->name('book.show');
Route::post('book/{practitioner:slug}', [PublicBookingController::class, 'store'])->name('book.store');
Route::get('book/confirmed/{token}', [PublicBookingController::class, 'confirmed'])->name('book.confirmed');

Route::get('privacy', fn () => Inertia::render('legal/privacy'))->name('privacy');
Route::get('terms', fn () => Inertia::render('legal/terms'))->name('terms');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
