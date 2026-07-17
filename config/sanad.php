<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Emergency WhatsApp Line
    |--------------------------------------------------------------------------
    |
    | The fast human lane for people in crisis. Unregistered visitors and the
    | "I still feel overwhelmed" escape hatch both open a WhatsApp chat to this
    | number, where the team handles them as a walk-in / manual booking. Stored
    | in full international form (no "+", no spaces) so it drops straight into a
    | wa.me link, e.g. 96181397380 → https://wa.me/96181397380.
    |
    */

    'whatsapp' => env('SANAD_WHATSAPP', '96181397380'),

    /*
    |--------------------------------------------------------------------------
    | Bootstrap Admin Password
    |--------------------------------------------------------------------------
    |
    | The one-time password for the admin the GoLiveSeeder creates on a fresh
    | database. Read through config (not env() directly) so it still resolves
    | when production config is cached. Leave it unset to have the seeder
    | generate a strong random password and print it once during seeding.
    |
    */

    'bootstrap_password' => env('SANAD_BOOTSTRAP_PASSWORD'),

    /*
    |--------------------------------------------------------------------------
    | Crisis Hotlines
    |--------------------------------------------------------------------------
    |
    | Shown on the crisis-safety screen. These are life-safety numbers for a
    | true emergency — kept here (not hard-coded in the UI) so they can be set
    | correctly before launch. PLACEHOLDERS for now; confirm the real Lebanese
    | numbers before going live.
    |
    */

    'hotlines' => [
        [
            'label' => 'Emergency services',
            'number' => env('SANAD_HOTLINE_EMERGENCY', '112'),
            'note' => 'Immediate, life-threatening danger',
        ],
        [
            'label' => 'Embrace Lifeline (suicide & crisis)',
            'number' => env('SANAD_HOTLINE_CRISIS', '1564'),
            'note' => 'Free, confidential emotional support',
        ],
    ],

];
