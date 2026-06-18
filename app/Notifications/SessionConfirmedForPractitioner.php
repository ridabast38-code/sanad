<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SessionConfirmedForPractitioner extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Booking $booking) {}

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

        return (new MailMessage)
            ->subject('New confirmed session — '.$booking->clientName())
            ->greeting('You have a confirmed session, '.$booking->practitioner->name)
            ->line('A client\'s payment has been confirmed, so this session is now on your schedule.')
            ->line('Client: '.$booking->clientName())
            ->line('Service: '.$booking->service->name)
            ->line('When: '.$booking->scheduled_at->format('l, M j, Y · g:i A'))
            ->line('Your share: $'.number_format((float) $booking->practitioner_amount, 2))
            ->action('View your schedule', route('practitioner.dashboard'))
            ->line('— Sanad');
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
