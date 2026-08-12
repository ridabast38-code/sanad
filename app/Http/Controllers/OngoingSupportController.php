<?php

namespace App\Http\Controllers;

use App\Support\StabilizationFlows;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OngoingSupportController extends Controller
{
    /**
     * The ongoing-support entry: pick the situation you've been through, which
     * opens the matching full guided flow. Unlike the emergency button (one
     * immediate flow), this offers the four fuller journeys and ends by inviting
     * the person into real sessions.
     */
    public function index(): Response
    {
        return Inertia::render('ongoing/index', [
            'flows' => StabilizationFlows::menu(),
            'safety' => $this->safety(),
        ]);
    }

    /**
     * A single full guided flow for one situation, ending with the gentle
     * conversion into ongoing sessions or a message on WhatsApp.
     */
    public function show(string $type): Response|RedirectResponse
    {
        $flow = StabilizationFlows::find($type);

        if ($flow === null || $type === 'emergency') {
            return to_route('ongoing.index');
        }

        return Inertia::render('ongoing/flow', [
            'flow' => $flow,
            'safety' => $this->safety(),
        ]);
    }

    /**
     * The crisis-safety payload shared by every guided screen: the WhatsApp fast
     * lane and the life-safety hotlines.
     *
     * @return array{whatsapp_url: string, hotlines: list<array{label: string, number: string, note: string}>}
     */
    private function safety(): array
    {
        $message = rawurlencode('Hi OurSanad, I would like ongoing support.');

        return [
            'whatsapp_url' => 'https://wa.me/'.config('sanad.whatsapp').'?text='.$message,
            'hotlines' => config('sanad.hotlines'),
        ];
    }
}
