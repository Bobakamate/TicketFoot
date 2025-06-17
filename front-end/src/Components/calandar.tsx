import type { Match } from "../services/apiService.ts";
import { useState } from "react";

export const CalendarComponent: React.FC<{ matches: Match[]; onDateSelect: (date: string) => void }> = ({ matches, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>('');

    const matchDates = matches.map(match => match.date);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        for (let i = startingDayOfWeek; i > 0; i--) {
            const prevDate = new Date(year, month, 1 - i);
            days.push({ date: prevDate, isCurrentMonth: false });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            days.push({ date, isCurrentMonth: true });
        }

        return days;
    };

    const handleDateClick = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        setSelectedDate(dateString);
        onDateSelect(dateString);
    };

    const hasMatch = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        return matchDates.includes(dateString);
    };

    const days = getDaysInMonth(currentDate);
    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    return (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-4">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="text-emerald-400 hover:text-emerald-300 p-2 text-2xl font-bold"
                >
                    ←
                </button>
                <span className="text-white font-semibold text-2xl">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="text-emerald-400 hover:text-emerald-300 p-2 text-2xl font-bold"
                >
                    →
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                    <div key={day} className="text-center text-gray-400 font-semibold text-sm">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                    const dayString = day.date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dayString;
                    const isMatch = hasMatch(day.date);
                    const baseClasses = "aspect-square min-w-[24px] max-w-[36px] sm:min-w-[28px] sm:max-w-[40px] md:min-w-[32px] md:max-w-[44px] lg:min-w-[36px] lg:max-w-[48px] text-sm rounded-md flex items-center justify-center transition-all duration-200 relative";

                    return (
                        <button
                            key={index}
                            onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
                            className={`
                                ${baseClasses}
                                ${day.isCurrentMonth ? 'text-white hover:bg-gray-700' : 'text-gray-600 cursor-default'}
                                ${isMatch && day.isCurrentMonth ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : ''}
                                ${isSelected ? 'bg-emerald-600 text-white' : ''}
                            `}
                            disabled={!day.isCurrentMonth}
                        >
                            {day.date.getDate()}
                            {isMatch && day.isCurrentMonth && (
                                <div className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 bg-emerald-500/20 border border-emerald-500/50 rounded"></span>
                    Jours avec des matchs
                </p>
            </div>
        </div>
    );
};
