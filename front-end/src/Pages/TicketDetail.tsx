import {useEffect, useState} from "react";
import {apiService, type Match} from "../services/apiService";
import { Calendar, Clock, MapPin, Star, Users, CreditCard, MapIcon, CheckCircle} from "lucide-react";
import { useParams } from "react-router-dom";
import PayPalButton from "../Components/payPalButton.tsx";

interface SeatSection {
    id: string;
    name: string;
    price: number;
    color: string;
    availableSeats: number;
    totalSeats: number;
}

interface SelectedSeat {
    sectionId: string;
    seatNumber: string;
    price: number;
}

// Page de détails du ticket
export const TicketDetailPage: React.FC= () => {
    const { id } = useParams<{ id: string }>();
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectionMode, setSelectionMode] = useState<'auto' | 'consecutive' | 'manual'>('auto');
    const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
    const [showPayment, setShowPayment] = useState(false);

    // Sections de places simulées (à remplacer par vos vraies données)
    const seatSections: SeatSection[] = [
        { id: 'tribune-nord', name: 'Tribune Nord', price: 150, color: 'bg-emerald-500', availableSeats: 45, totalSeats: 100 },
        { id: 'tribune-sud', name: 'Tribune Sud', price: 150, color: 'bg-emerald-500', availableSeats: 32, totalSeats: 100 },
        { id: 'tribune-est', name: 'Tribune Est', price: 200, color: 'bg-blue-500', availableSeats: 28, totalSeats: 80 },
        { id: 'tribune-ouest', name: 'Tribune Ouest', price: 200, color: 'bg-blue-500', availableSeats: 15, totalSeats: 80 },
        { id: 'vip-central', name: 'VIP Central', price: 500, color: 'bg-purple-500', availableSeats: 8, totalSeats: 20 },
        { id: 'loge-presidentielle', name: 'Loge Présidentielle', price: 1000, color: 'bg-yellow-500', availableSeats: 2, totalSeats: 10 }
    ];

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const allMatches = await apiService.getAllMatches();
                const found = allMatches.data!.find((m) => m.id === id);
                setMatch(found || null);
            } catch (error) {
                console.error("Erreur lors du chargement des matchs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatch();
    }, [id]);

    const handleSectionSelect = (sectionId: string) => {
        setSelectedSection(sectionId);
        setSelectedSeats([]);
    };

    const generateConsecutiveSeats = (section: SeatSection, quantity: number): SelectedSeat[] => {
        const seats: SelectedSeat[] = [];
        for (let i = 1; i <= quantity; i++) {
            seats.push({
                sectionId: section.id,
                seatNumber: `${section.name.charAt(0)}${Math.floor(Math.random() * 50) + 1}`,
                price: section.price
            });
        }
        return seats;
    };

    const handleSeatSelection = () => {
        const section = seatSections.find(s => s.id === selectedSection);
        if (!section) return;

        if (selectionMode === 'auto' || selectionMode === 'consecutive') {
            const seats = generateConsecutiveSeats(section, ticketQuantity);
            setSelectedSeats(seats);
        }
    };

    const getTotalPrice = () => {
        if (selectedSeats.length > 0) {
            return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
        }
        const section = seatSections.find(s => s.id === selectedSection);
        return section ? section.price * ticketQuantity : 0;
    };
    function compressSelectedSeats(seats: string[]): string {
        if (seats.length === 0) return "";
        if (seats.length === 1) return seats[0];
        if (seats.length === 2) return `[${seats[0]} - ${seats[seats.length - 1]}]`;


        return `[${seats[0]} ... ${seats[seats.length - 1]}]`;
    }



    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
            <div className="text-white text-xl">Chargement...</div>
        </div>
    );

    if (!match) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
            <div className="text-white text-xl">Match introuvable</div>
        </div>
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getAvailabilityColor = (available: number, total: number) => {
        const percentage = (available / total) * 100;
        if (percentage > 50) return 'text-emerald-400';
        if (percentage > 20) return 'text-amber-400';
        return 'text-red-400';
    };

    const getAvailabilityText = (available: number, total: number) => {
        const percentage = (available / total) * 100;
        if (percentage > 50) return 'Disponible';
        if (percentage > 20) return 'Places limitées';
        return 'Presque complet';
    };
    const handlePayPalSuccess = async (orderData:any) => {
        const token = localStorage.getItem("authToken");
        if (token && match) {
            const reservation = await apiService.createReservation({
                token,
                matchId: match.id,
                ticketQuantity,
                selectedSeats: compressSelectedSeats(selectedSeats.map(seat => seat.seatNumber))
            });

            if (reservation.success) {
                alert('Réservation confirmée !');
                // Redirection vers page de confirmation
            }
        }
    };

    const handlePayPalError = (error) => {
        console.error('Erreur PayPal:', error);
        alert('Erreur lors du paiement');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
                    {/* Header du match */}
                    <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium border border-emerald-500/30">
                                {match.category}
                            </span>
                            <div className={`text-sm font-medium ${getAvailabilityColor(match.availableTickets, match.totalTickets)}`}>
                                {getAvailabilityText(match.availableTickets, match.totalTickets)}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div className="text-center flex-1">
                                <h2 className="text-2xl font-bold text-white mb-2">{match.homeTeam}</h2>
                                <div className="text-emerald-400 font-medium">Domicile</div>
                            </div>

                            <div className="mx-8 text-center">
                                <div className="text-4xl font-bold text-gray-400 mb-2">VS</div>
                                <div className="text-emerald-400 font-bold text-xl">{match.time}</div>
                                <div className="text-gray-300 text-sm mt-1">{formatDate(match.date)}</div>
                            </div>

                            <div className="text-center flex-1">
                                <h2 className="text-2xl font-bold text-white mb-2">{match.awayTeam}</h2>
                                <div className="text-blue-400 font-medium">Extérieur</div>
                            </div>
                        </div>

                        {match.description && (
                            <div className="bg-gray-900/50 rounded-lg p-4">
                                <p className="text-gray-300 text-center italic">{match.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Contenu principal */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Informations du match */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4">Informations du match</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-gray-300">
                                        <Calendar className="w-5 h-5 text-emerald-400" />
                                        <span>{formatDate(match.date)} à {match.time}</span>
                                    </div>

                                    <div className="flex items-center space-x-3 text-gray-300">
                                        <MapPin className="w-5 h-5 text-emerald-400" />
                                        <span>{match.stadium}, {match.city}</span>
                                    </div>

                                    <div className="flex items-center space-x-3 text-gray-300">
                                        <Users className="w-5 h-5 text-emerald-400" />
                                        <span>{match.availableTickets.toLocaleString()} / {match.totalTickets.toLocaleString()} places</span>
                                    </div>

                                    {match.weather && (
                                        <div className="flex items-center space-x-3 text-gray-300">
                                            <Clock className="w-5 h-5 text-emerald-400" />
                                            <span>Météo: {match.weather}, {match.temperature}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Plan du stade */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <MapIcon className="w-5 h-5 mr-2 text-emerald-400" />
                                        Plan du stade
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {seatSections.map((section) => (
                                            <div
                                                key={section.id}
                                                onClick={() => handleSectionSelect(section.id)}
                                                className={`p-3 rounded cursor-pointer transition-all ${
                                                    selectedSection === section.id
                                                        ? 'ring-2 ring-emerald-500 bg-emerald-500/20'
                                                        : 'bg-gray-600/50 hover:bg-gray-600'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white font-medium">{section.name}</span>
                                                    <div className={`w-3 h-3 rounded-full ${section.color}`}></div>
                                                </div>
                                                <div className="text-emerald-400 font-bold">{section.price} DH</div>
                                                <div className={`text-xs ${getAvailabilityColor(section.availableSeats, section.totalSeats)}`}>
                                                    {section.availableSeats} places libres
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Réservation */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4">Réservation</h3>

                                {/* Nombre de billets */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Nombre de billets
                                    </label>
                                    <select
                                        value={ticketQuantity}
                                        onChange={(e) => setTicketQuantity(Number(e.target.value))}
                                        className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {[1,2,3,4,5,6,7,8].map(num => (
                                            <option key={num} value={num}>{num} billet{num > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mode de sélection */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        Mode de sélection des places
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="auto"
                                                checked={selectionMode === 'auto'}
                                                onChange={(e) => setSelectionMode(e.target.value as any)}
                                                className="text-emerald-500"
                                            />
                                            <span className="text-gray-300">Attribution automatique (meilleures places)</span>
                                        </label>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="consecutive"
                                                checked={selectionMode === 'consecutive'}
                                                onChange={(e) => setSelectionMode(e.target.value )}
                                                className="text-emerald-500"
                                            />
                                            <span className="text-gray-300">Places consécutives (côte à côte)</span>
                                        </label>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="manual"
                                                checked={selectionMode === 'manual'}
                                                onChange={(e) => setSelectionMode(e.target.value )}
                                                className="text-emerald-500"
                                            />
                                            <span className="text-gray-300">Sélection manuelle</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Sélection de section */}
                                {selectedSection && (
                                    <div className="bg-gray-700/50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-gray-300">Section sélectionnée:</span>
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div className="text-white font-medium">
                                            {seatSections.find(s => s.id === selectedSection)?.name}
                                        </div>
                                        <button
                                            onClick={handleSeatSelection}
                                            className="mt-3 w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 py-2 rounded border border-emerald-500/30"
                                        >
                                            {selectionMode === 'auto' ? 'Attribuer automatiquement' :
                                                selectionMode === 'consecutive' ? 'Sélectionner places consécutives' :
                                                    'Choisir manuellement'}
                                        </button>
                                    </div>
                                )}

                                {/* Places sélectionnées */}
                                {selectedSeats.length > 0 && (
                                    <div className="bg-gray-700/50 rounded-lg p-4">
                                        <h4 className="text-white font-medium mb-3">Places sélectionnées:</h4>
                                        <div className="space-y-2">
                                            {selectedSeats.map((seat, index) => (
                                                <div key={index} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-300">Place {seat.seatNumber}</span>
                                                    <span className="text-emerald-400 font-medium">{seat.price} DH</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Récapitulatif des prix */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Quantité:</span>
                                            <span className="text-white">{ticketQuantity}</span>
                                        </div>
                                        {selectedSection && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Prix unitaire:</span>
                                                <span className="text-white font-bold">
                                                    {seatSections.find(s => s.id === selectedSection)?.price} DH
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-gray-600 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium text-white">Total:</span>
                                            <span className="text-2xl font-bold text-emerald-400">
                                                {getTotalPrice().toLocaleString()} DH
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Boutons d'action */}
                                <div className="space-y-3">
                                    {!showPayment ? (
                                        <PayPalButton
                                            amount={getTotalPrice() / 10} // Conversion DH vers EUR
                                            currency="EUR"
                                            description={`Billets pour ${match?.homeTeam} vs ${match?.awayTeam}`}
                                            onSuccess={handlePayPalSuccess}
                                            onError={handlePayPalError}
                                            onCancel={() => setShowPayment(false)}
                                            disabled={!selectedSection}
                                        />
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <CreditCard className="w-5 h-5 text-blue-400" />
                                                    <span className="text-blue-400 font-medium">Paiement sécurisé PayPal</span>
                                                </div>
                                                <p className="text-gray-300 text-sm">
                                                    Montant: {getTotalPrice().toLocaleString()} DH (≈ {(getTotalPrice() / 10).toFixed(2)} EUR)
                                                </p>
                                            </div>

                                            <div id="paypal-button-container" className="w-full"></div>

                                            <button
                                                onClick={() => setShowPayment(false)}
                                                className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg"
                                            >
                                                Retour
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                                    <Star className="w-4 h-4" />
                                    <span>Paiement sécurisé</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};