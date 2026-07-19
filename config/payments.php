<?php

use App\Services\Payments\DemoPaymentGateway;

return [

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway (DEMO / COMPETITION ONLY)
    |--------------------------------------------------------------------------
    |
    | The gateway used by the mobile app's in-app checkout. Ships as a demo
    | driver that approves instantly without moving real money and leaves the
    | booking pending for an admin to confirm. Point this at a real
    | App\Services\Payments\PaymentGateway implementation to go live. Safe to
    | delete this block (and app/Services/Payments) after the competition.
    |
    */

    'gateway' => DemoPaymentGateway::class,

    /*
    |--------------------------------------------------------------------------
    | Manual Payment Methods
    |--------------------------------------------------------------------------
    |
    | While payments are collected by hand, these are the methods shown to a
    | client on the "how to pay" page after they book. Fill the number and
    | account name for each one in your .env file (PAY_WHISH_NUMBER, etc.).
    | Methods without a number are hidden from clients automatically.
    |
    */

    'methods' => [
        [
            'key' => 'whish',
            'label' => 'Whish Money',
            'number' => env('PAY_WHISH_NUMBER'),
            'account_name' => env('PAY_WHISH_NAME'),
            'instructions' => 'Open the Whish app and send the exact amount to the number above.',
        ],
        [
            'key' => 'omt',
            'label' => 'OMT',
            'number' => env('PAY_OMT_NUMBER'),
            'account_name' => env('PAY_OMT_NAME'),
            'instructions' => 'Visit any OMT branch and send the exact amount to the name and number above.',
        ],
    ],

];
