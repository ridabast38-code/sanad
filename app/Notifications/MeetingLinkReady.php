<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MeetingLinkReady extends Notification
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
            ->subject('Your session link is ready 🌿')
            ->greeting('Everything\'s ready, '.$booking->client->name)
            ->line('The link to join your session is now waiting for you.')
            ->line('With: '.$booking->practitioner->name)
            ->line('When: '.$booking->scheduled_at->format('l, M j, Y · g:i A'))
            ->action('Join your session', $booking->meeting_link)
            ->line('The button opens your video room — it becomes active 15 minutes before you begin. — Sanad');
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
