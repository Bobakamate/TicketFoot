<?php
require_once '../config/database.php';
require_once '../classes/EmailService.php';
$allowed_origins = ['http://localhost:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

 
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Récupérer le endpoint
$endpoint = $pathParts[count($pathParts) - 1] ?? '';

try {
    switch ($method) {
        case 'GET':
            handleGetRequest($db, $endpoint);
            break;
        case 'POST':
            handlePostRequest($db, $endpoint);
            break;
        case 'PUT':
            handlePutRequest($db, $endpoint);
            break;
        case 'DELETE':
            handleDeleteRequest($db, $endpoint);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleGetRequest($db, $endpoint) {
    switch ($endpoint) {
        case 'matches':
            getAllMatches($db);
            break;
        case 'reservations':
            getUserReservations($db);
            break;
        case 'user':
            getUserProfile($db);
            break;
        case 'migrate':
            // Rediriger vers le script de migration
            include '../migrations/migrate.php';
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint non trouvé']);
    }
}

function handlePostRequest($db, $endpoint) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($endpoint) {
        case 'login':
            loginUser($db, $input);
            break;
        case 'session':
            SessionUser($db, $input);
            break;
        case 'reservation':
            createReservation($db, $input);
            break;
        case 'migrate':
            // Rediriger vers le script de migration
            include '../migrations/migrate.php';
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint non trouvé']);
    }
}

function handlePutRequest($db, $endpoint) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($endpoint) {
        case 'reservation':
            updateReservation($db, $input);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint non trouvé']);
    }
}

function handleDeleteRequest($db, $endpoint) {
    // Implémenter si nécessaire
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint non trouvé']);
}

// Fonction pour récupérer tous les matchs (uniquement les matchs futurs du mois en cours)
function getAllMatches($db) {
    $currentDate = date('Y-m-d');
    $currentMonth = date('Y-m');
    
    $stmt = $db->prepare("
        SELECT 
            id,
            home_team as homeTeam,
            away_team as awayTeam,
            home_team_logo as homeTeamLogo,
            away_team_logo as awayTeamLogo,
            stadium,
            city,
            match_date as date,
            match_time as time,
            price,
            available_tickets as availableTickets,
            total_tickets as totalTickets,
            category,
            description,
            weather,
            temperature
        FROM matches 
        WHERE match_date >= ? 
        AND DATE_FORMAT(match_date, '%Y-%m') = ?
        ORDER BY match_date ASC, match_time ASC
    ");
    
    $stmt->execute([$currentDate, $currentMonth]);
    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convertir les prix en nombre
    foreach ($matches as &$match) {
        $match['price'] = (float)$match['price'];
        $match['availableTickets'] = (int)$match['availableTickets'];
        $match['totalTickets'] = (int)$match['totalTickets'];
    }
    
    echo json_encode(['success' => true, 'data' => $matches]);
}

// Fonction pour récupérer les réservations d'un utilisateur
function getUserReservations($db) {
    $token = $_GET['token'] ?? '';
    
    if (empty($token)) {
        http_response_code(400);
        echo json_encode(['error' => 'Token utilisateur requis']);
        return;
    }
    
    $stmt = $db->prepare("
        SELECT 
            r.id,
            r.match_id as matchId,
            m.home_team as homeTeam,
            m.away_team as awayTeam,
            m.home_team_logo as homeTeamLogo,
            m.away_team_logo as awayTeamLogo,
            m.stadium,
            m.city,
            m.match_date as date,
            m.match_time as time,
            r.ticket_quantity as ticketQuantity,
            r.total_price as totalPrice,
            r.status,
            m.category,
            r.reservation_date,
            r.selectedSeats
        FROM reservations r
        JOIN matches m ON r.match_id = m.id
        WHERE r.user_token = ?
        ORDER BY r.reservation_date DESC
    ");
    
    $stmt->execute([$token]);
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convertir les prix en nombre
    foreach ($reservations as &$reservation) {
        $reservation['totalPrice'] = (float)$reservation['totalPrice'];
        $reservation['ticketQuantity'] = (int)$reservation['ticketQuantity'];
    }
    
    echo json_encode(['success' => true, 'data' => $reservations]);
}

// Fonction pour récupérer le profil utilisateur
function getUserProfile($db) {
    $token = $_GET['token'] ?? '';
    
    if (empty($token)) {
        http_response_code(400);
        echo json_encode(['error' => 'Token utilisateur requis']);
        return;
    }
    
    $stmt = $db->prepare("
        SELECT name, email, phone, avatar, member_since as memberSince
        FROM users 
        WHERE token = ?
    ");
    
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'Utilisateur non trouvé']);
        return;
    }
    
    echo json_encode(['success' => true, 'data' => $user]);
}

// Fonction pour la connexion utilisateur
function loginUser($db, $input) {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email et mot de passe requis']);
        return;
    }
    
    $stmt = $db->prepare("
        SELECT token, name, email, phone, avatar, member_since as memberSince
        FROM users 
        WHERE email = ? AND password = ?
    ");
    
    $stmt->execute([$email, $password]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Email ou mot de passe incorrect']);
        return;
    }
    
    echo json_encode(['success' => true, 'data' => $user]);
}
function SessionUser($db, $input) {
    $email = $input['token'] ?? '';
    
    if (empty($email) ) {
        http_response_code(400);
        echo json_encode(['error' => 'Email et mot de passe requis']);
        return;
    }
    
    $stmt = $db->prepare("
        SELECT token, name, email, phone, avatar, member_since as memberSince
        FROM users 
        WHERE token = ? 
    ");
    
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Email ou mot de passe incorrect']);
        return;
    }
    
    echo json_encode(['success' => true, 'data' => $user]);
}

// Fonction pour créer une réservation
function createReservation($db, $input) {
    $token = $input['token'] ?? '';
    $matchId = $input['matchId'] ?? '';
    $ticketQuantity = $input['ticketQuantity'] ?? 0;
    
    if (empty($token) || empty($matchId) || $ticketQuantity <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Données de réservation invalides']);
        return;
    }
    
    // Vérifier la disponibilité des billets
    $stmt = $db->prepare("SELECT price, available_tickets FROM matches WHERE id = ?");
    $stmt->execute([$matchId]);
    $match = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$match) {
        http_response_code(404);
        echo json_encode(['error' => 'Match non trouvé']);
        return;
    }
    
    if ($match['available_tickets'] < $ticketQuantity) {
        http_response_code(400);
        echo json_encode(['error' => 'Billets insuffisants disponibles']);
        return;
    }
    
    $totalPrice = $match['price'] * $ticketQuantity;
    $reservationId = generateUUID();
    
    // Démarrer une transaction
    $db->beginTransaction();
    
    try {
        // Créer la réservation
        $stmt = $db->prepare("
            INSERT INTO reservations (id, user_token, match_id, ticket_quantity, total_price, status) 
            VALUES (?, ?, ?, ?, ?, 'confirmé')
        ");
        $stmt->execute([$reservationId, $token, $matchId, $ticketQuantity, $totalPrice]);
        
        // Mettre à jour les billets disponibles
        $stmt = $db->prepare("
            UPDATE matches 
            SET available_tickets = available_tickets - ? 
            WHERE id = ?
        ");
        $stmt->execute([$ticketQuantity, $matchId]);
        
        $db->commit();
        
        // Récupérer les détails pour l'email
        $stmt = $db->prepare("
            SELECT 
                u.name, u.email,
                m.home_team, m.away_team, m.stadium, m.city, 
                m.match_date, m.match_time, m.category,
                r.ticket_quantity, r.total_price, r.status
            FROM reservations r
            JOIN users u ON r.user_token = u.token
            JOIN matches m ON r.match_id = m.id
            WHERE r.id = ?
        ");
        $stmt->execute([$reservationId]);
        $reservationDetails = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Préparer les données de l'email
        $emailData = [
            'reservation_id' => $reservationId,
            'home_team' => $reservationDetails['home_team'],
            'away_team' => $reservationDetails['away_team'],
            'stadium' => $reservationDetails['stadium'],
            'city' => $reservationDetails['city'],
            'match_date' => $reservationDetails['match_date'],
            'match_time' => $reservationDetails['match_time'],
            'ticket_quantity' => $reservationDetails['ticket_quantity'],
            'total_price' => $reservationDetails['total_price'],
            'category' => $reservationDetails['category'],
            'status' => $reservationDetails['status']
        ];
        
        // Envoi de l'email
        $emailService = new EmailService();
        $emailSent = $emailService->sendReservationConfirmation(
            $reservationDetails['email'],
            $reservationDetails['name'],
            $emailData
        );
        
        if ($emailSent) {
            echo json_encode([
                'success' => true, 
                'message' => 'Réservation créée avec succès, email envoyé.',
                'data' => ['reservationId' => $reservationId]
            ]);
        } else {
            echo json_encode([
                'success' => true, 
                'message' => 'Réservation créée, mais échec de l’envoi de l’email.',
                'data' => ['reservationId' => $reservationId]
            ]);
        }
        
    } catch (Exception $e) {
        $db->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
    }
}


// Fonction pour mettre à jour une réservation
function updateReservation($db, $input) {
    $reservationId = $input['reservationId'] ?? '';
    $status = $input['status'] ?? '';
    
    if (empty($reservationId) || empty($status)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de réservation et statut requis']);
        return;
    }
    
    $allowedStatuses = ['confirmé', 'en attente', 'annulé'];
    if (!in_array($status, $allowedStatuses)) {
        http_response_code(400);
        echo json_encode(['error' => 'Statut invalide']);
        return;
    }
    
    $stmt = $db->prepare("UPDATE reservations SET status = ? WHERE id = ?");
    $result = $stmt->execute([$status, $reservationId]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Réservation mise à jour']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la mise à jour']);
    }
}
?>