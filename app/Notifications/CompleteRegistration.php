<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CompleteRegistration extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  string  $token  The unguessable token that confirms the signup.
     */
    public function __construct(public string $token) {}

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
            ->subject('Confirm your email to finish creating your Sanad account')
            ->greeting('One last step')
            ->line('Welcome to Sanad. Confirm your email address to create your account and continue.')
            ->action('Confirm my email', route('register.confirm', $this->token))
            ->line('This link expires in an hour. If you didn’t try to sign up, you can safely ignore this email — no account is created until you confirm.')
            ->salutation('With care, Sanad');
    }
}
