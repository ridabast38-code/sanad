<?php

namespace App\Services\Payments;

/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * The outcome of a gateway charge attempt.
 */
class PaymentResult
{
    public function __construct(
        public bool $success,
        public string $reference,
        public ?string $message = null,
    ) {}
}
