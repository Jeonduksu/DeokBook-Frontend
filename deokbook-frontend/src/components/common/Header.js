// src/components/common/Header.js
import React from 'react';
import { Book, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ title = "DeokBook", showLogout = true }) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Book className="h-8 w-8 text-blue-600" />
                        <h1 className="ml-2 text-xl font-semibold text-gray-900">{title}</h1>
                    </div>
                    {showLogout && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                        >
                            <LogOut size={16} />
                            로그아웃
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;