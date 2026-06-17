<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmedForClient extends Notification implements ShouldQueue
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

        $mail = (new MailMessage)
            ->subject('Your session is confirmed 🌿')
            ->greeting('You\'re all set, '.$booking->client->name)
            ->line('Your payment has been received and your session is confirmed.')
            ->line('With: '.$booking->practitioner->name)
            ->line('Service: '.$booking->service->name)
            ->line('When: '.$booking->scheduled_at->format('l, M j, Y · g:i A'));

        if ($booking->meeting_link) {
            $mail->action('Join your session', $booking->meeting_link)
                ->line('Use the button above to join when it\'s time.');
        } else {
            $mail->action('View your sessions', route('dashboard'))
                ->line('Your meeting link will appear on your dashboard before the session.');
        }

        return $mail->line('We\'re glad you\'re here. — Sanad');
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
