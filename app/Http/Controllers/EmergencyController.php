<?php

namespace App\Http\Controllers;

use App\Support\StabilizationFlows;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmergencyController extends Controller
{
    /**
     * The emergency entry screen. Pressing the emergency button drops the
     * visitor straight into the single Emergency First Aid guided flow —
     * no "what happened?" menu in the way when someone needs help now.
     */
    public function index(): Response
    {
        return Inertia::render('emergency/flow', [
            'flow' => StabilizationFlows::emergency(),
            'safety' => $this->safety(),
        ]);
    }

    /**
     * A single guided stabilization flow for one trauma type.
     */
    public function show(string $type): Response|RedirectResponse
    {
        $flow = StabilizationFlows::find($type);

        if ($flow === null) {
            return to_route('emergency.index');
        }

        return Inertia::render('emergency/flow', [
            'flow' => $flow,
            'safety' => $this->safety(),
        ]);
    }

    /**
     * The crisis-safety payload shared by both screens: the WhatsApp fast lane
     * and the life-safety hotlines.
     *
     * @return array{whatsapp_url: string, hotlines: list<array{label: string, number: string, note: string}>}
     */
    private function safety(): array
    {
        $message = rawurlencode('Hi OurSanad, I need urgent help.');

        return [
            'whatsapp_url' => 'https://wa.me/'.config('sanad.whatsapp').'?text='.$message,
            'hotlines' => config('sanad.hotlines'),
        ];
    }
}
