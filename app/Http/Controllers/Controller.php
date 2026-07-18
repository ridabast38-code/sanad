<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * A pre-filled WhatsApp link to the team's payment line, carrying the booking
     * reference so a client asking for help (or arranging an OMT transfer) lands in
     * a chat that already knows which session they mean.
     */
    protected function paymentSupportWhatsappUrl(string $reference): string
    {
        $message = "Hi Sanad, I'd like help with the payment for my session ({$reference}).";

        return 'https://wa.me/'.config('sanad.whatsapp').'?text='.rawurlencode($message);
    }
}
