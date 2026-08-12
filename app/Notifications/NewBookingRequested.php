<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewBookingRequested extends Notification implements ShouldQueue
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
            ->subject('New booking request — '.$booking->clientName())
            ->greeting('A new session was booked')
            ->line($booking->clientName().' booked a session with '.$booking->practitioner->name.'.')
            ->line('Service: '.$booking->service->name)
            ->line('When: '.$booking->scheduled_at->format('l, M j, Y · g:i A'))
            ->line('Price: $'.number_format((float) $booking->price, 2))
            ->line('It is awaiting payment — review it to accept once the money arrives.')
            ->action('Review booking', route('admin.bookings'))
            ->line('OurSanad');
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
