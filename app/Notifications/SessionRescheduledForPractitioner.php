<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SessionRescheduledForPractitioner extends Notification implements ShouldQueue
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
            ->subject('A session was rescheduled — '.$booking->clientName())
            ->greeting('Hello '.$booking->practitioner->name)
            ->line('A session on your schedule has been moved to a new time.')
            ->line('Client: '.$booking->clientName())
            ->line('Service: '.$booking->service->name)
            ->line('New time: '.$booking->scheduled_at->format('l, M j, Y · g:i A'))
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
