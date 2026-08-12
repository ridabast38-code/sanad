<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent when someone tries to sign up with an email that already has an account.
 * Pairs with the identical "check your inbox" screen shown either way, so the
 * signup form never reveals whether an email is registered.
 */
class ExistingAccountNotice extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('You already have a OurSanad account')
            ->greeting('Welcome back')
            ->line('Someone (hopefully you) just tried to sign up with this email — but you already have a OurSanad account.')
            ->line('You can simply log in. If you’ve forgotten your password, you can reset it.')
            ->action('Log in', route('login'))
            ->line('If this wasn’t you, no need to worry — nothing has changed on your account.')
            ->salutation('With care, OurSanad');
    }
}
