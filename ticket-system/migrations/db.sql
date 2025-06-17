-- Structure de la base de données pour le système de réservation de billets

CREATE DATABASE IF NOT EXISTS ticket_system;
USE ticket_system;

-- Table des utilisateurs
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    token VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des matchs
CREATE TABLE matches (
    id VARCHAR(36) PRIMARY KEY,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    stadium VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available_tickets INT NOT NULL,
    total_tickets INT NOT NULL,
    category ENUM('Botola Pro', 'Coupe du Trône', 'Champions League', 'Amical') NOT NULL,
    description TEXT,
    weather VARCHAR(50),
    temperature VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des réservations
CREATE TABLE reservations (
    id VARCHAR(36) PRIMARY KEY,
    user_token VARCHAR(36) NOT NULL,
    match_id VARCHAR(36) NOT NULL,
    ticket_quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('confirmé', 'en attente', 'annulé') DEFAULT 'en attente',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_id VARCHAR(100),
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    selectedSeats VARCHAR(36) ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_token) REFERENCES users(token) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- Table des paiements PayPal
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    reservation_id VARCHAR(36) NOT NULL,
    paypal_payment_id VARCHAR(100) NOT NULL,
    paypal_payer_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MAD',
    status VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_reservations_user ON reservations(user_token);
CREATE INDEX idx_reservations_match ON reservations(match_id);
CREATE INDEX idx_payments_reservation ON payments(reservation_id);