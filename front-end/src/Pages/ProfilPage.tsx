import React, {useEffect, useState} from 'react';
import { User, Mail, Calendar, MapPin, Clock, Ticket, Phone, LogOut } from 'lucide-react';
import {apiService, type Reservation, type UserProfile} from '../services/apiService';


const ProfilePage: React.FC = () => {
    const [user,setUser] = useState<UserProfile | null>(null);
    const [reservations,setReservations] = useState<Reservation[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'reservations'>('info');

    useEffect(() => {

        const fetchUser = async () => {


            const storedToken = localStorage.getItem("authToken");
            if(storedToken){
                const user = await  apiService.sessioUser(
                    {token :storedToken}
                )
                if(user.data){
                    setUser(user.data)
                    const r = await  apiService.getUserReservations(
                        storedToken
                    );
                    if (r.data){
                        setReservations(r.data)
                    }

                }
            }


        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        // Supprimer le token d'authentification
        localStorage.removeItem("authToken");

        // Réinitialiser l'état du composant
        setUser(null);
        setReservations([]);

        // Rediriger vers la page de connexion ou d'accueil
        // Vous pouvez utiliser react-router ou votre système de navigation
        window.location.href = '/'; // ou utilisez navigate() si vous utilisez react-router
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatShortDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmé':
                return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
            case 'en attente':
                return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
            case 'annulé':
                return 'text-red-400 bg-red-500/20 border-red-500/30';
            default:
                return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmé':
                return 'Confirmé';
            case 'en attente':
                return 'En attente';
            case 'annulé':
                return 'Annulé';
            default:
                return status;
        }
    };

    const confirmedReservations = reservations.filter(r => r.status === 'confirmé');
    const totalSpent = reservations.filter(r => r.status === 'confirmé').reduce((sum, r) => sum + r.totalPrice, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">


            <div className="px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-8 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-white mb-2">{user ?user.name : ""}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-5 h-5 text-emerald-400" />
                                            <span>{user ? user.email : ""}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-5 h-5 text-emerald-400" />
                                            <span>{user ? user.phone : ""}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-5 h-5 text-emerald-400" />
                                            <span>Membre depuis {formatShortDate(user ? user!.memberSince :"")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bouton de déconnexion */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 group"
                                title="Se déconnecter"
                            >
                                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                                <span className="font-medium">Déconnexion</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <Ticket className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{confirmedReservations.length}</p>
                                    <p className="text-gray-400">Matchs réservés</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{reservations.filter(r => r.status === 'en attente').length}</p>
                                    <p className="text-gray-400">En attente</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <span className="text-emerald-400 font-bold text-lg">DH</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{totalSpent.toLocaleString()}</p>
                                    <p className="text-gray-400">Total dépensé</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50">
                        <div className="border-b border-gray-700/50">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`px-6 py-4 font-medium transition-colors duration-200 ${
                                        activeTab === 'info'
                                            ? 'text-emerald-400 border-b-2 border-emerald-500'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Informations personnelles
                                </button>
                                <button
                                    onClick={() => setActiveTab('reservations')}
                                    className={`px-6 py-4 font-medium transition-colors duration-200 ${
                                        activeTab === 'reservations'
                                            ? 'text-emerald-400 border-b-2 border-emerald-500'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Mes réservations ({reservations.length})
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-400 text-sm font-medium mb-2">Nom complet</label>
                                            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white">
                                                {user ? user.name : ""}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
                                            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white">
                                                {user ? user.email:""}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm font-medium mb-2">Téléphone</label>
                                            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white">
                                                {user ? user.phone :""}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm font-medium mb-2">Membre depuis</label>
                                            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white">
                                                {formatDate(user ? user.memberSince :"")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reservations' && (
                                <div className="space-y-6">
                                    {reservations.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">🎫</div>
                                            <h3 className="text-xl font-semibold text-gray-200 mb-2">Aucune réservation</h3>
                                            <p className="text-gray-400">Vous n'avez pas encore réservé de match</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {reservations.map((reservation) => (
                                                <div key={reservation.id} className="bg-gray-700/30 rounded-lg p-6 hover:bg-gray-700/50 transition-colors duration-200 border border-gray-600/30">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reservation.status)}`}>
                                                            {getStatusText(reservation.status)}
                                                        </span>
                                                        <span className="text-emerald-400 font-bold text-lg">
                                                            {reservation.totalPrice} DH
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-white font-semibold">{reservation.homeTeam}</span>
                                                        </div>
                                                        <span className="text-gray-400 font-bold">VS</span>
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-white font-semibold">{reservation.awayTeam}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 text-sm text-gray-300">
                                                        <div className="flex items-center space-x-3">
                                                            <Calendar className="w-4 h-4 text-emerald-400" />
                                                            <span>{formatShortDate(reservation.date)}</span>
                                                            <Clock className="w-4 h-4 text-emerald-400 ml-4" />
                                                            <span>{reservation.time}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <MapPin className="w-4 h-4 text-emerald-400" />
                                                            <span>{reservation.stadium}, {reservation.city}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between pt-2 border-t border-gray-600/30">
                                                            <span className="text-gray-400">
                                                                {reservation.ticketQuantity} {reservation.ticketQuantity > 1 ? 'billets' : 'billet'}
                                                            </span>
                                                            <div className="mt-2 text-sm text-gray-300">
                                                                <span className="font-medium text-gray-400">Places sélectionnées :</span>{' '}
                                                                <span className="text-white">{reservation.selectedSeats}</span>
                                                            </div>
                                                            <span className="text-emerald-400 font-medium">
                                                                {reservation.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;