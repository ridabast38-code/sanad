<?php

use App\Enums\UserRole;
use App\Models\Availability;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

function makeBookablePractitioner(): User
{
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'headline' => 'Anxiety & stress support',
        'bio' => 'Here to listen.',
        'approval_status' => 'approved',
        'approaches' => ['cbt'],
        'languages' => ['english'],
    ]);

    $service = Service::factory()->create();
    $practitioner->services()->attach($service, ['price' => 40]);

    Availability::factory()->for($practitioner, 'practitioner')->create([
        'day_of_week' => 1,
        'start_time' => '17:00',
        'end_time' => '20:00',
    ]);

    return $practitioner;
}

test('the specialist profile page shows services and bookable slots', function () {
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('specialists.show', $practitioner))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('client/specialist-profile')
            ->where('specialist.name', $practitioner->name)
            ->has('services', 1)
            ->where('services.0.price', 40)
            ->has('slots')
        );
});

test('unapproved practitioners have no public profile', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'headline' => 'Pending review',
        'approval_status' => 'pending',
    ]);

    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('specialists.show', $practitioner))
        ->assertNotFound();
});

test('a client can book an offered slot and it becomes their upcoming session', function () {
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();

    $page = $this->actingAs($client)
        ->get(route('specialists.show', $practitioner))
        ->viewData('page');

    $slotIso = $page['props']['slots'][0]['iso'];
    $serviceId = $page['props']['services'][0]['id'];

    $this->actingAs($client)
        ->post(route('bookings.store'), [
            'practitioner_id' => $practitioner->id,
            'service_id' => $serviceId,
            'scheduled_at' => $slotIso,
            'client_note' => 'A bit nervous, first time.',
        ])
        ->assertRedirect(route('dashboard'));

    $booking = Booking::sole();
    expect($booking->client_id)->toBe($client->id)
        ->and($booking->practitioner_id)->toBe($practitioner->id)
        ->and($booking->status)->toBe('pending')
        ->and((float) $booking->price)->toBe(40.0)
        ->and((float) $booking->platform_amount)->toBe(8.0)
        ->and((float) $booking->practitioner_amount)->toBe(32.0);

    // it now appears as the upcoming session on the dashboard
    $this->actingAs($client)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('upcomingSession.practitioner_name', $practitioner->name)
            ->where('stats.upcoming', 1)
        );
});

test('a slot the practitioner does not offer is rejected', function () {
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $service = $practitioner->services->first();

    $this->actingAs($client)
        ->post(route('bookings.store'), [
            'practitioner_id' => $practitioner->id,
            'service_id' => $service->id,
            'scheduled_at' => now()->addDay()->setTime(9, 0)->toIso8601String(),
        ])
        ->assertSessionHasErrors('scheduled_at');

    expect(Booking::count())->toBe(0);
});

test('privacy and terms pages are public', function () {
    $this->get(route('privacy'))->assertOk();
    $this->get(route('terms'))->assertOk();
});
