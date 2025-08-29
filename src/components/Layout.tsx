import React from 'react';
import { Users, UserPlus, BarChart3, Calendar, Crown, TrendingUp, Upload, ArrowRight, LogOut } from 'lucide-react';
import { Profile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  currentProfile: Profile;
  onLogout: () => void;
}

export default function Layout({ children, currentPage, onPageChange, currentProfile, onLogout }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'register', label: `Registrar ${currentProfile.memberLabel}`, icon: UserPlus },
    { id: 'attendance', label: 'Asistencia', icon: Calendar },
    { id: 'members', label: 'Miembros', icon: Users },
    { id: 'leaders', label: currentProfile.leaderLabel + 's', icon: Crown },
    { id: 'reports', label: 'Reportes', icon: TrendingUp },
    ...(currentProfile.id !== 'admin' ? [{ id: 'transitions', label: 'Transiciones', icon: ArrowRight }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {currentProfile.logo.startsWith('data:') ? (
                  <img 
                    src={currentProfile.logo} 
                    alt={`${currentProfile.name} Logo`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{currentProfile.logo}</span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentProfile.displayName}
                </h1>
                <p className="text-sm text-slate-500">{currentProfile.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 md:space-x-2 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform -translate-y-1'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-screen">
        {children}
        </div>
      </main>
    </div>
  );
}