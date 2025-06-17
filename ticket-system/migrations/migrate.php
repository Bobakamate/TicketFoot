<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

 

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Vider les tables existantes
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");
    $db->exec("TRUNCATE TABLE payments");
    $db->exec("TRUNCATE TABLE reservations");
    $db->exec("TRUNCATE TABLE matches");
    $db->exec("TRUNCATE TABLE users");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    // Insérer l'utilisateur d'exemple
    $userToken = generateUUID();
    $userId = generateUUID();
    
    $stmt = $db->prepare("
        INSERT INTO users (id, token, name, email, phone, password, member_since) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $userId,
        $userToken,
        'Boba Kamate',
        'bobakamate09@gmail.com',
        '+212 6 12 34 56 78',
        'azerty',
        '2023-01-15 00:00:00'
    ]);
    
    // Insérer les matchs d'exemple
    $matches = [
        [
            'id' => generateUUID(),
            'home_team' => 'Raja Casablanca',
            'away_team' => 'Wydad Casablanca',

            'stadium' => 'Stade Mohammed V',
            'city' => 'Casablanca',
            'match_date' => '2025-06-15',
            'match_time' => '20:00:00',
            'price' => 150.00,
            'available_tickets' => 2500,
            'total_tickets' => 45000,
            'category' => 'Botola Pro',
            'description' => 'Le derby de Casablanca, un match légendaire entre les deux plus grands clubs du Maroc.',
            'weather' => 'Ensoleillé',
            'temperature' => '24°C'
        ],
        [
            'id' => generateUUID(),
            'home_team' => 'FAR Rabat',
            'away_team' => 'Hassania Agadir',
 
            'stadium' => 'Stade Moulay Abdellah',
            'city' => 'Rabat',
            'match_date' => '2025-06-20',
            'match_time' => '18:00:00',
            'price' => 80.00,
            'available_tickets' => 5000,
            'total_tickets' => 52000,
            'category' => 'Botola Pro',
            'description' => 'Un match important pour le championnat national.',
            'weather' => 'Nuageux',
            'temperature' => '22°C'
        ],
        [
            'id' => generateUUID(),
            'home_team' => 'Renaissance Zemamra',
            'away_team' => 'Moghreb Tétouan',

            'stadium' => 'Stade Boubker Ammar',
            'city' => 'El Jadida',
            'match_date' => '2025-06-25',
            'match_time' => '19:30:00',
            'price' => 60.00,
            'available_tickets' => 8000,
            'total_tickets' => 15000,
            'category' => 'Botola Pro',
            'description' => 'Une rencontre prometteuse entre deux équipes ambitieuses.',
            'weather' => 'Ensoleillé',
            'temperature' => '26°C'
        ],
        [
            'id' => generateUUID(),
            'home_team' => 'Ittihad Tanger',
            'away_team' => 'Olympic Safi',

            'stadium' => 'Stade Ibn Batouta',
            'city' => 'Tanger',
            'match_date' => '2025-07-02',
            'match_time' => '21:00:00',
            'price' => 100.00,
            'available_tickets' => 3000,
            'total_tickets' => 45000,
            'category' => 'Coupe du Trône',
            'description' => 'Match de coupe avec des enjeux importants.',
            'weather' => 'Pluvieux',
            'temperature' => '20°C'
        ]
    ];
    
    $stmt = $db->prepare("
        INSERT INTO matches (id, home_team, away_team, home_team_logo, away_team_logo, 
                           stadium, city, match_date, match_time, price, available_tickets, 
                           total_tickets, category, description, weather, temperature) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($matches as $match) {
        $stmt->execute(array_values($match));
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Migration réussie',
        'data' => [
            'user_token' => $userToken,
            'matches_count' => count($matches)
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur lors de la migration: ' . $e->getMessage()
    ]);
}
?>