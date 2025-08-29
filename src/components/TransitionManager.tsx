import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Users, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Joven, Profile } from '../types';

interface TransitionCandidate extends Joven {
  currentAge: number;
  suggestedProfile: string;
  suggestedProfileName: string;
}

interface TransitionManagerProps {
  currentProfile: Profile;
  allProfiles: Profile[];
}

export default function TransitionManager({ currentProfile, allProfiles }: TransitionManagerProps) {
  const [candidates, setCandidates] = useState<TransitionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<TransitionCandidate | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadTransitionCandidates();
  }, [currentProfile]);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const findSuggestedProfile = (age: number): { id: string; name: string } => {
    const profile = allProfiles.find(p => 
      p.id !== 'admin' && age >= p.ageRange.min && age <= p.ageRange.max
    );
    return profile ? { id: profile.id, name: profile.name } : { id: '', name: '' };
  };

  const loadTransitionCandidates = async () => {
    try {
      setLoading(true);
      
      // Solo cargar jóvenes del perfil actual
      const { data: jovenes, error } = await supabase
        .from('jovenes')
        .select('*')
        .gte('fecha_nacimiento', new Date(new Date().getFullYear() - currentProfile.ageRange.max, 0, 1).toISOString().split('T')[0])
        .lte('fecha_nacimiento', new Date(new Date().getFullYear() - currentProfile.ageRange.min, 11, 31).toISOString().split('T')[0])
        .order('nombre');

      if (error) throw error;

      const transitionCandidates: TransitionCandidate[] = [];

      jovenes?.forEach(joven => {
        const age = calculateAge(joven.fecha_nacimiento);
        const isOutOfRange = age < currentProfile.ageRange.min || age > currentProfile.ageRange.max;
        
        if (isOutOfRange) {
          const suggested = findSuggestedProfile(age);
          if (suggested.id && suggested.id !== currentProfile.id) {
            transitionCandidates.push({
              ...joven,
              currentAge: age,
              suggestedProfile: suggested.id,
              suggestedProfileName: suggested.name
            });
          }
        }
      });

      setCandidates(transitionCandidates);
    } catch (error) {
      console.error('Error loading transition candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTransition = async (candidate: TransitionCandidate) => {
    setSelectedCandidate(candidate);
    setShowPasswordModal(true);
    setPassword('');
    setPasswordError('');
  };

  const confirmTransition = async () => {
    if (!selectedCandidate) return;

    // Verificar contraseña
    if (password !== currentProfile.password) {
      setPasswordError('Contraseña incorrecta');
      return;
    }
    setProcessing(selectedCandidate.id);
    setShowPasswordModal(false);

    try {
      // Aquí podrías implementar la lógica de transferencia
      // Por ahora, solo simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remover de la lista de candidatos
      setCandidates(prev => prev.filter(c => c.id !== selectedCandidate.id));
      
      alert(`${selectedCandidate.nombre} ha sido transferido exitosamente a ${selectedCandidate.suggestedProfileName}`);
    } catch (error) {
      console.error('Error processing transition:', error);
      alert('Error al procesar la transición');
    } finally {
      setProcessing('');
      setSelectedCandidate(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔄 Transiciones Generacionales</h2>
            <p className="text-gray-600">Gestiona el cambio de ruta por edad de los {currentProfile.memberLabel}s</p>
          </div>
        </div>

        {/* Información de rangos de edad */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            📊 Rangos de Edad por Perfil
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allProfiles.filter(p => p.id !== 'admin').map(profile => (
              <div key={profile.id} className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{profile.logo}</div>
                <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                <p className="text-sm text-gray-600">{profile.ageRange.min} - {profile.ageRange.max} años</p>
              </div>
            ))}
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">✅ No hay transiciones pendientes</h3>
            <p className="text-gray-500">Todos los {currentProfile.memberLabel}s están en el rango de edad correcto para {currentProfile.name}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">
                  ⚠️ {candidates.length} {currentProfile.memberLabel}{candidates.length > 1 ? 's' : ''} necesita{candidates.length > 1 ? 'n' : ''} transición
                </h3>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Los siguientes {currentProfile.memberLabel}s han superado el rango de edad de {currentProfile.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates.map(candidate => (
                <div key={candidate.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-lg">
                      {candidate.foto_url ? (
                        <img
                          src={candidate.foto_url}
                          alt={candidate.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {candidate.nombre_favorito || candidate.nombre}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {candidate.currentAge} años • Nacido: {new Date(candidate.fecha_nacimiento).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Perfil Actual</p>
                        <p className="font-semibold text-gray-900">{currentProfile.name}</p>
                        <p className="text-xs text-gray-500">{currentProfile.ageRange.min}-{currentProfile.ageRange.max} años</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-blue-500" />
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Perfil Sugerido</p>
                        <p className="font-semibold text-blue-600">{candidate.suggestedProfileName}</p>
                        <p className="text-xs text-gray-500">Edad apropiada</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => processTransition(candidate)}
                    disabled={processing === candidate.id}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {processing === candidate.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <ArrowRight className="w-4 h-4" />
                        <span>Procesar Transición</span>
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Modal de confirmación con contraseña */}
      {showPasswordModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Transición</h3>
              <p className="text-gray-600">
                ¿Transferir a <strong>{selectedCandidate.nombre}</strong> a <strong>{selectedCandidate.suggestedProfileName}</strong>?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña de {currentProfile.name}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ingresa la contraseña"
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedCandidate(null);
                    setPassword('');
                    setPasswordError('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmTransition}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}