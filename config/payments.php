<?php

return [

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
