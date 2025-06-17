// frontend/services/apiService.ts

export interface Match {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamLogo: string;
    awayTeamLogo: string;
    stadium: string;
    city: string;
    date: string;
    time: string;
    price: number;
    availableTickets: number;
    totalTickets: number;
    category: 'Botola Pro' | 'Coupe du Trône' | 'Champions League' | 'Amical';
    description?: string;
    weather?: string;
    temperature?: string;
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    memberSince: string;
    token?: string;
}

export interface Reservation {
    id: string;
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamLogo: string;
    awayTeamLogo: string;
    stadium: string;
    city: string;
    date: string;
    time: string;
    ticketQuantity: number;
    totalPrice: number;
    status: 'confirmé' | 'en attente' | 'annulé';
    category: string;
    selectedSeats: string;

}

export interface LoginRequest {
    email: string;
    password: string;
}export interface SessionRequest {
    token: string;
}

export interface LoginResponse {
    success: boolean;
    data?: UserProfile;
    error?: string;
}

export interface CreateReservationRequest {
    token: string;
    matchId: string;
    ticketQuantity: number;
    selectedSeats:string;
}

export interface CreateReservationResponse {
    success: boolean;
    message?: string;
    data?: {
        reservationId: string;
    };
    error?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost/ticket-system/api') {
        this.baseUrl = baseUrl;
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${this.baseUrl}/${endpoint}`;
            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    // Authentification
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        return this.makeRequest<UserProfile>('login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }
    async sessioUser(credentials: SessionRequest): Promise<LoginResponse> {
        return this.makeRequest<UserProfile>('session', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    // Récupérer tous les matchs disponibles
    async getAllMatches(): Promise<ApiResponse<Match[]>> {
        return this.makeRequest<Match[]>('matches');
    }

    // Récupérer le profil utilisateur
    async getUserProfile(token: string): Promise<ApiResponse<UserProfile>> {
        return this.makeRequest<UserProfile>(`user?token=${encodeURIComponent(token)}`);
    }

    // Récupérer les réservations d'un utilisateur
    async getUserReservations(token: string): Promise<ApiResponse<Reservation[]>> {
        return this.makeRequest<Reservation[]>(`reservations?token=${encodeURIComponent(token)}`);
    }

    // Créer une nouvelle réservation
    async createReservation(reservation: CreateReservationRequest): Promise<CreateReservationResponse> {
        return this.makeRequest<{ reservationId: string }>('reservation', {
            method: 'POST',
            body: JSON.stringify(reservation),
        });
    }

    // Mettre à jour une réservation
    async updateReservation(reservationId: string, status: string): Promise<ApiResponse<any>> {
        return this.makeRequest<any>('reservation', {
            method: 'PUT',
            body: JSON.stringify({
                reservationId,
                status
            }),
        });
    }

    // Lancer la migration des données
    async runMigration(): Promise<ApiResponse<any>> {
        return this.makeRequest<any>('migrate', {
            method: 'POST',
        });
    }

    // Récupérer un match spécifique par ID
    async getMatchById(matchId: string): Promise<Match | null> {
        const response = await this.getAllMatches();
        if (response.success && response.data) {
            return response.data.find(match => match.id === matchId) || null;
        }
        return null;
    }

    // Vérifier la disponibilité des billets
    async checkTicketAvailability(matchId: string, quantity: number): Promise<boolean> {
        const match = await this.getMatchById(matchId);
        return match ? match.availableTickets >= quantity : false;
    }

    // Calculer le prix total
    calculateTotalPrice(match: Match, quantity: number): number {
        return match.price * quantity;
    }

    // Formater la date pour l'affichage
    formatMatchDate(date: string): string {
        const matchDate = new Date(date);
        return matchDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Formater l'heure pour l'affichage
    formatMatchTime(time: string): string {
        return time.substring(0, 5); // Retourne HH:MM
    }

    // Obtenir le statut de disponibilité des billets
    getTicketAvailabilityStatus(match: Match): 'disponible' | 'limite' | 'epuise' {
        const availabilityRatio = match.availableTickets / match.totalTickets;

        if (match.availableTickets === 0) {
            return 'epuise';
        } else if (availabilityRatio < 0.1) {
            return 'limite';
        } else {
            return 'disponible';
        }
    }

    // Filtrer les matchs par catégorie
    filterMatchesByCategory(matches: Match[], category: string): Match[] {
        if (category === 'all') return matches;
        return matches.filter(match => match.category === category);
    }

    // Rechercher des matchs
    searchMatches(matches: Match[], searchTerm: string): Match[] {
        const term = searchTerm.toLowerCase();
        return matches.filter(match =>
            match.homeTeam.toLowerCase().includes(term) ||
            match.awayTeam.toLowerCase().includes(term) ||
            match.stadium.toLowerCase().includes(term) ||
            match.city.toLowerCase().includes(term)
        );
    }

    // Trier les matchs
    sortMatches(matches: Match[], sortBy: 'date' | 'price' | 'availability'): Match[] {
        return [...matches].sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime();
                case 'price':
                    return a.price - b.price;
                case 'availability':
                    return b.availableTickets - a.availableTickets;
                default:
                    return 0;
            }
        });
    }
}

// Instance singleton du service API
export const apiService = new ApiService();

// Export par défaut
export default apiService;