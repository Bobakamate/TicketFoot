<?php

  class EmailService {

    private $smtpServer = 'smtp.gmail.com';
    private $smtpPort = 587;
    private $username = 'email.services@gmail.com'; 
    private $password = 'app password'; 
    private $fromName = 'TicketFoot';

    public function sendReservationConfirmation($toEmail, $toName, $reservationData) {
        $subject = "Confirmation de votre réservation - Billet de match";

        $message = "
        <html>
        <head><title>Confirmation de réservation</title></head>
        <body>
            <h2>Bonjour {$toName},</h2>
            <p>Votre réservation a été confirmée avec succès !</p>
            <ul>
                <li><strong>Match :</strong> {$reservationData['home_team']} vs {$reservationData['away_team']}</li>
                <li><strong>Stade :</strong> {$reservationData['stadium']} - {$reservationData['city']}</li>
                <li><strong>Date :</strong> {$reservationData['match_date']}</li>
                <li><strong>Heure :</strong> {$reservationData['match_time']}</li>
                <li><strong>Nombre de billets :</strong> {$reservationData['ticket_quantity']}</li>
                <li><strong>Prix :</strong> {$reservationData['total_price']} MAD</li>
                <li><strong>Catégorie :</strong> {$reservationData['category']}</li>
                <li><strong>Statut :</strong> {$reservationData['status']}</li>
            </ul>
            <p>Merci pour votre confiance !</p>
        </body>
        </html>";

        return $this->smtpSend($toEmail, $subject, $message);
    }

    private function smtpSend($to, $subject, $body) {
        $socket = fsockopen($this->smtpServer, $this->smtpPort, $errno, $errstr, 30);
        if (!$socket) {
            echo "Erreur de connexion SMTP : $errstr ($errno)\n";
            return false;
        }

        $this->smtpRead($socket);
        $this->smtpWrite($socket, "EHLO localhost");
        $this->smtpRead($socket);

        $this->smtpWrite($socket, "STARTTLS");
        $this->smtpRead($socket);
        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

        $this->smtpWrite($socket, "EHLO localhost");
        $this->smtpRead($socket);

        $this->smtpWrite($socket, "AUTH LOGIN");
        $this->smtpRead($socket);
        $this->smtpWrite($socket, base64_encode($this->username));
        $this->smtpRead($socket);
        $this->smtpWrite($socket, base64_encode($this->password));
        $this->smtpRead($socket);

        $this->smtpWrite($socket, "MAIL FROM: <{$this->username}>");
        $this->smtpRead($socket);
        $this->smtpWrite($socket, "RCPT TO: <{$to}>");
        $this->smtpRead($socket);
        $this->smtpWrite($socket, "DATA");
        $this->smtpRead($socket);

        $headers = "From: {$this->fromName} <{$this->username}>\r\n";
        $headers .= "To: <{$to}>\r\n";
        $headers .= "Subject: {$subject}\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "\r\n";

        $this->smtpWrite($socket, $headers . $body . "\r\n.");
        $this->smtpRead($socket);

        $this->smtpWrite($socket, "QUIT");
        fclose($socket);

        return true;
    }

    private function smtpWrite($socket, $cmd) {
        fwrite($socket, $cmd . "\r\n");
    }

    private function smtpRead($socket) {
        $response = '';
        while ($str = fgets($socket, 515)) {
            $response .= $str;
            if (substr($str, 3, 1) == ' ') break;
        }
        return $response;
    }
}
