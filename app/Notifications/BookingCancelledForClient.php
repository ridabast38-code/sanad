<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingCancelledForClient extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Booking $booking, public float $refundedAmount = 0) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->booking;

        $mail = (new MailMessage)
            ->subject('Your session has been cancelled')
            ->greeting('Hello '.$booking->clientName())
            ->line('Your session with '.$booking->practitioner->name.' has been cancelled.')
            ->line('Service: '.$booking->service->name)
            ->line('When: '.$booking->scheduled_at->format('l, M j, Y · g:i A'));

        if ($this->refundedAmount > 0) {
            $mail->line('We\'re refunding $'.number_format($this->refundedAmount, 2).' to you — please allow a little time for it to reach you.');
        }

        return $mail
            ->action('Book another session', route('dashboard'))
            ->line('We\'re here whenever you\'re ready. — Sanad');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
        ];
    }
}
