
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import {apiService, type Match, type UserProfile} from "../services/apiService.ts";
import {CalendarComponent} from "../Components/calandar.tsx";
import {useNavigate} from "react-router-dom";
import ProfileButton from "../Components/profil.tsx";
const HomePage: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const navigate = useNavigate();
    const [cities, setCities] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);


    useEffect(() => {


        const fetchUser = async () => {


        const storedToken = localStorage.getItem("authToken");
        if(storedToken){
            const user = await  apiService.sessioUser(
                {token :storedToken}
            )
            if(user.data){
                setUser(user.data)

            }
        }
        
        setToken(storedToken);

        };
        fetchUser();
    }, []);
    const goToLogin = () => {
        navigate("login")
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await apiService.getAllMatches();

                if(data.data){
                    setMatches(data.data); // data.data est le tableau de Match

                    // Initialiser les variables après récupération
                    const uniqueCities = [...new Set(data.data.map(m => m.city))];
                    const uniqueCategories = [...new Set(data.data.map(m => m.category))];

                    setCities(uniqueCities);
                    setCategories(uniqueCategories);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des matchs :", error);
            }
        };


        fetchData();
        setLoading(false);
    }, []);


    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

    const filteredMatches = matches.filter(match => {
        const matchesSearch =
            match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.stadium.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCity = !selectedCity || match.city === selectedCity;
        const matchesCategory = !selectedCategory || match.category === selectedCategory;
        const matchesDate = !selectedDate || match.date === selectedDate;

        return matchesSearch && matchesCity && matchesCategory && matchesDate;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-gray-300 text-lg">Chargement des matchs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black">
            {/* Header */}
            <header className="bg-gray-800/80 backdrop-blur-sm shadow-2xl border-b border-emerald-500/30">
                <div className="px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-3xl">⚽</div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">TicketFoot</h1>
                                <p className="text-emerald-400 font-medium">Réservez vos places pour les matchs</p>
                            </div>
                        </div>

                        {token == null ?( <div className="flex items-center space-x-4">
                            <button onClick={goToLogin} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25">
                                Se connecter
                            </button>
                            <button onClick={goToLogin} className="border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25">
                                S'inscrire
                            </button>
                        </div>) :(<ProfileButton userName ={user ? user.name :""} onClick={() => navigate('/profil')} />)}


                    </div>
                </div>
            </header>

            <div className="px-2 py-4">
                {/* Layout avec calendrier et contenu principal */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Calendrier - colonne de gauche */}
                    <div >
                        <CalendarComponent matches={matches} onDateSelect={handleDateSelect} />

                        {selectedDate && (
                            <div className="mt-4 bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-4">
                                <h4 className="text-white font-medium mb-2">Date sélectionnée:</h4>
                                <p className="text-emerald-400">{formatDate(selectedDate)}</p>
                                <button
                                    onClick={() => setSelectedDate('')}
                                    className="mt-2 text-sm text-gray-400 hover:text-white"
                                >
                                    Effacer la sélection
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Contenu principal - colonnes de droite */}
                    <div className="xl:col-span-3">
                        {/* Filtres et recherche */}
                        <div className="bg-gray-800/60 z-[40] backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6 mb-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Trouvez votre match</h2>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Barre de recherche */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher équipes, stade..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 transition-all duration-300"
                                    />
                                </div>

                                {/* Filtre par ville */}
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white appearance-none transition-all duration-300"
                                    >
                                        <option value="">Toutes les villes</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtre par catégorie */}
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white appearance-none transition-all duration-300"
                                    >
                                        <option value="">Toutes les compétitions</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bouton de recherche */}
                                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-emerald-500/25">
                                    <Search className="w-5 h-5" />
                                    <span>Rechercher</span>
                                </button>
                            </div>
                        </div>

                        {/* Liste des matchs */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">
                                    Matchs à venir ({filteredMatches.length})
                                </h2>
                            </div>

                            {filteredMatches.length === 0 ? (
                                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-12 text-center">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-xl font-semibold text-gray-200 mb-2">Aucun match trouvé</h3>
                                    <p className="text-gray-400">Essayez de modifier vos critères de recherche</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {filteredMatches.map((match) => (
                                        <div key={match.id} className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden border border-gray-700/50 hover:border-emerald-500/30 group">
                                            <div className="p-6">
                                                {/* En-tête avec catégorie */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30">
                                                        {match.category}
                                                    </span>
                                                    <div className={`text-sm font-medium ${getAvailabilityColor(match.availableTickets, match.totalTickets)}`}>
                                                        {getAvailabilityText(match.availableTickets, match.totalTickets)}
                                                    </div>
                                                </div>

                                                {/* Équipes */}
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="text-center flex-1">
                                                        <h3 className="font-bold text-gray-100 text-lg group-hover:text-emerald-400 transition-colors duration-300">{match.homeTeam}</h3>
                                                    </div>

                                                    <div className="mx-6 text-center">
                                                        <div className="text-2xl font-bold text-gray-500 mb-1">VS</div>
                                                        <div className="text-sm text-emerald-400 font-medium">{match.time}</div>
                                                    </div>

                                                    <div className="text-center flex-1">
                                                        <h3 className="font-bold text-gray-100 text-lg group-hover:text-emerald-400 transition-colors duration-300">{match.awayTeam}</h3>
                                                    </div>
                                                </div>

                                                {/* Informations du match */}
                                                <div className="border-t border-gray-700/50 pt-4 space-y-3">
                                                    <div className="flex items-center space-x-3 text-gray-300">
                                                        <Calendar className="w-5 h-5 text-emerald-400" />
                                                        <span>{formatDate(match.date)}</span>
                                                    </div>

                                                    <div className="flex items-center space-x-3 text-gray-300">
                                                        <MapPin className="w-5 h-5 text-emerald-400" />
                                                        <span>{match.stadium}, {match.city}</span>
                                                    </div>

                                                    <div className="flex items-center space-x-3 text-gray-300">
                                                        <Users className="w-5 h-5 text-emerald-400" />
                                                        <span>{match.availableTickets.toLocaleString()} places disponibles</span>
                                                    </div>
                                                </div>

                                                {/* Prix et bouton */}
                                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/50">
                                                    <div>
                                                        <span className="text-2xl font-bold text-emerald-400">{match.price} DH</span>
                                                        <span className="text-gray-400 text-sm ml-2">par billet</span>
                                                    </div>

                                                    <button  onClick={ () => {
                                                        if(!token){
                                                            navigate(`/login`)}else{navigate(`/ticket/${match.id}`)}
                                                    }}
                                                     className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105">
                                                        Réserver
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;