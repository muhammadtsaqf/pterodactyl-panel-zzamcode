<?php

namespace Pterodactyl\Services\WhatsApp;

use Illuminate\Support\Facades\Http;
use Pterodactyl\Models\User;

class WhatsAppNotifierService
{
    private string $botUrl = 'http://127.0.0.1:3001';

    /**
     * Send a WhatsApp message to a given user.
     * 
     * @param User $user The recipient user (must have phone number).
     * @param string $message The text message to send.
     * @return bool True if successfully sent, false otherwise.
     */
    public function send(User $user, string $message): bool
    {
        if (empty($user->phone)) {
            return false;
        }

        $phone = $this->formatPhoneNumber($user->phone);

        try {
            $response = Http::timeout(5)->post("{$this->botUrl}/api/send-message", [
                'number' => $phone,
                'message' => $message,
            ]);

            $json = $response->json();
            return isset($json['success']) && $json['success'] === true;
        } catch (\Exception $e) {
            \Log::error('WhatsApp Notifier Failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Normalize the phone number format to standard WhatsApp format (e.g. 628...).
     */
    private function formatPhoneNumber(string $phone): string
    {
        // Remove all non-numeric characters
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

        // If starts with 0 (assuming Indonesia), replace with 62
        if (str_starts_with($cleanPhone, '0')) {
            $cleanPhone = '62' . substr($cleanPhone, 1);
        }

        // If it starts with + (which is removed above), make sure it just has the country code
        // The regex above already removes '+', so +62 becomes 62.

        return $cleanPhone;
    }
}
