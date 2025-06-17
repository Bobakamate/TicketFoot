import React from 'react';
import { User } from 'lucide-react';

interface ProfileButtonProps {
    onClick: () => void;
    userName?: string;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({
                                                         onClick,
                                                         userName = ""
                                                     }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-300 group"
        >
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
                <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block text-left">
                <p className="text-white font-medium text-sm">{userName}</p>
                <p className="text-gray-400 text-xs">Mon profil</p>
            </div>
        </button>
    );
};

export default ProfileButton;