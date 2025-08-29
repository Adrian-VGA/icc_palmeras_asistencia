import React, { useState } from 'react';
import { Users, Lock, Eye, EyeOff, Settings } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  displayName: string;
  subtitle: string;
  logor: string;
  password: string;
  ageRange: {
    min: number;
    max: number;
  };
  memberLabel: string;
  leaderLabel: string;
  systemName: string;
  showPFI: boolean;
}

interface LoginProps {
  onLogin: (profile: Profile) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: 'r21-kids',
      name: 'R21 Kids',
      displayName: 'R21 KIDS PALMERAS',
      subtitle: 'Sistema de asistencia del Club Infantil',
      logo: '🏢',
      password: '2025',
      ageRange: { min: 1, max: 9 },
      memberLabel: 'niño',
      leaderLabel: 'Maestra Dominical',
      systemName: 'Club Infantil',
      showPFI: false
    },
    {
      id: 'estacion-r21',
      name: 'Estación R21',
      displayName: 'ESTACIÓN R21 PALMERAS',
      subtitle: 'Sistema de asistencia de los Preadolescentes',
      logo: '🚀',
      password: '2025',
      ageRange: { min: 10, max: 13 },
      memberLabel: 'preadolescente',
      leaderLabel: 'Líder Preadolescente',
      systemName: 'Preadolescentes',
      showPFI: false
    },
    {
      id: 'zona-r21',
      name: 'Zona R21',
      displayName: 'ZONA R21 PALMERAS',
      subtitle: 'Sistema de asistencia de los Adolescentes',
      logo: '🎯',
      password: '2025',
      ageRange: { min: 14, max: 17 },
      memberLabel: 'adolescente',
      leaderLabel: 'Líder Adolescente',
      systemName: 'Adolescentes',
      showPFI: false
    },
    {
      id: 'renovacion-21',
      name: 'Renovación 21',
      displayName: 'RENOVACIÓN 21 PALMERAS',
      subtitle: 'Sistema de asistencia Juvenil',
      logo: '🔥',
      password: '2025',
      ageRange: { min: 18, max: 99 },
      memberLabel: 'joven',
      leaderLabel: 'Líder Juvenil',
      systemName: 'Juvenil',
      showPFI: true
    },
    {
      id: 'admin',
      name: 'Administrador',
      displayName: 'PANEL DE ADMINISTRACIÓN',
      subtitle: 'Gestión completa del sistema',
      logo: '👑',
      password: '201931',
      ageRange: { min: 0, max: 99 },
      memberLabel: 'usuario',
      leaderLabel: 'Administrador',
      systemName: 'Administración',
      showPFI: true
    }
  ]);

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const handleLogin = () => {
    if (!selectedProfile) {
      setError('Por favor selecciona un perfil');
      return;
    }

    if (password !== selectedProfile.password) {
      setError('Contraseña incorrecta');
      return;
    }

    onLogin(selectedProfile);
  };

  const handleAdminSave = (updatedProfile: Profile) => {
    setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    setEditingProfile(null);
  };

  const handleLogoUpload = (profileId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfiles(prev => prev.map(p => 
        p.id === profileId ? { ...p, logo: reader.result as string } : p
      ));
    };
    reader.readAsDataURL(file);
  };

  if (selectedProfile?.id === 'admin' && password === selectedProfile.password) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-4xl border border-purple-200">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
              👑
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-gray-600">Gestiona perfiles, contraseñas y logos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {profiles.filter(p => p.id !== 'admin').map((profile) => (
              <div key={profile.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                    {profile.logo.startsWith('data:') ? (
                      <img src={profile.logo} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{profile.logo}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{profile.name}</h3>
                    <p className="text-sm text-gray-600">{profile.subtitle}</p>
                    <p className="text-xs text-gray-500">Edades: {profile.ageRange.min}-{profile.ageRange.max} años</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfiles(prev => prev.map(p => 
                        p.id === profile.id ? { ...p, name: e.target.value } : p
                      ))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="text"
                      value={profile.password}
                      onChange={(e) => setProfiles(prev => prev.map(p => 
                        p.id === profile.id ? { ...p, password: e.target.value } : p
                      ))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(profile.id, file);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setSelectedProfile(null);
                setPassword('');
                setError('');
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-purple-200">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Sistema R21
          </h1>
          <p className="text-gray-600">Selecciona tu perfil para continuar</p>
        </div>

        {!selectedProfile ? (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfile(profile)}
                className="w-full p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-xl overflow-hidden">
                    {profile.logo.startsWith('data:') ? (
                      <img src={profile.logo} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{profile.logo}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-gray-500">{profile.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 overflow-hidden">
                {selectedProfile.logo.startsWith('data:') ? (
                  <img src={selectedProfile.logo} alt={selectedProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{selectedProfile.logo}</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedProfile.name}</h2>
              <p className="text-sm text-gray-600">{selectedProfile.subtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-12"
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Iniciar Sesión
                </button>
                
                <button
                  onClick={() => {
                    setSelectedProfile(null);
                    setPassword('');
                    setError('');
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            @AVG TECH, ICC PALMERAS
          </p>
        </div>
      </div>
    </div>
  );
}