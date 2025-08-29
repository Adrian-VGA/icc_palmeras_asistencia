import React, { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, Gift, BarChart3, UserCheck, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface DashboardProps {
  currentProfile: Profile;
}

interface Member {
  id: string;
  nombre: string;
  nombre_favorito?: string;
  fecha_nacimiento: string;
  foto_url?: string;
  perfil: string;
  nivel_ruta_pfi?: string;
}

interface AttendanceRecord {
  id: string;
  fecha: string;
  presente: boolean;
  miembro_id: string;
}

const Dashboard: React.FC<DashboardProps> = ({ currentProfile }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const getProfileTerminology = (profile: Profile) => {
    switch (profile.id) {
      case 'r21_kids':
        return { member: 'niños', leader: 'maestras' };
      case 'estacion_r21':
        return { member: 'preadolescentes', leader: 'líderes' };
      case 'zona_r21':
        return { member: 'adolescentes', leader: 'líderes' };
      default:
        return { member: 'jóvenes', leader: 'líderes' };
    }
  };

  const getAgeRange = (profileId: string) => {
    switch (profileId) {
      case 'r21_kids': return { min: 1, max: 9 };
      case 'estacion_r21': return { min: 10, max: 13 };
      case 'zona_r21': return { min: 14, max: 17 };
      default: return { min: 18, max: 100 };
    }
  };

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

  const filterMembersByAge = (members: Member[]) => {
    const ageRange = getAgeRange(currentProfile.id);
    return members.filter(member => {
      const age = calculateAge(member.fecha_nacimiento);
      return age >= ageRange.min && age <= ageRange.max;
    });
  };

  useEffect(() => {
    fetchData();
  }, [currentProfile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('jovenes')
        .select('*');

      if (membersError) throw membersError;

      // Filter members by age for current profile
      const filteredMembers = filterMembersByAge(membersData || []);
      setMembers(filteredMembers);

      // Fetch attendance for today
      const today = new Date().toISOString().split('T')[0];
      const memberIds = filteredMembers.map(m => m.id);
      
      if (memberIds.length > 0) {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('asistencia')
          .select('*')
          .eq('fecha', today)
          .in('miembro_id', memberIds);

        if (attendanceError) throw attendanceError;
        setAttendance(attendanceData || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const terminology = getProfileTerminology(currentProfile);
  const totalMembers = members.length;
  const presentToday = attendance.filter(a => a.presente).length;
  const attendanceRate = totalMembers > 0 ? Math.round((presentToday / totalMembers) * 100) : 0;

  // Get upcoming birthdays (next 7 days)
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return members.filter(member => {
      const birthDate = new Date(member.fecha_nacimiento);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }
      
      return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
    });
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  // PFI Distribution (only for Renovación 21)
  const getPFIDistribution = () => {
    if (currentProfile.id !== 'renovacion_21') return null;

    const distribution = {
      'PRIMERA ETAPA': { count: 0, levels: ['Consolidado', 'Discipulado 1', 'Discipulado 2'] },
      'SEGUNDA ETAPA': { count: 0, levels: ['Escuela de Liderazgo', 'Escuela de Felipes', 'Escuela de Maestros'] },
      'TERCERA ETAPA': { count: 0, levels: ['Seminario Bíblico', 'No Aplica'] }
    };

    members.forEach(member => {
      if (member.nivel_ruta_pfi) {
        if (distribution['PRIMERA ETAPA'].levels.includes(member.nivel_ruta_pfi)) {
          distribution['PRIMERA ETAPA'].count++;
        } else if (distribution['SEGUNDA ETAPA'].levels.includes(member.nivel_ruta_pfi)) {
          distribution['SEGUNDA ETAPA'].count++;
        } else if (distribution['TERCERA ETAPA'].levels.includes(member.nivel_ruta_pfi)) {
          distribution['TERCERA ETAPA'].count++;
        }
      }
    });

    return distribution;
  };

  const pfiDistribution = getPFIDistribution();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Dashboard - {currentProfile.name}
        </h1>
        <p className="text-indigo-100">
          Resumen general del sistema de {terminology.member}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total {terminology.member}</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Presentes hoy</p>
              <p className="text-2xl font-bold text-gray-900">{presentToday}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">% Asistencia</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cumpleaños</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingBirthdays.length}</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <Gift className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* PFI Distribution - Only for Renovación 21 */}
      {pfiDistribution && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center mb-6">
            <BarChart3 className="w-6 h-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">📈 Distribución por Etapas de Ruta PFI</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(pfiDistribution).map(([stage, data], index) => {
              const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
              const bgColors = ['bg-blue-50', 'bg-yellow-50', 'bg-green-50'];
              const textColors = ['text-blue-700', 'text-yellow-700', 'text-green-700'];
              
              return (
                <div key={stage} className={`${bgColors[index]} rounded-lg p-4 border-l-4 border-${colors[index].split('-')[1]}-500`}>
                  <h3 className={`font-bold text-lg ${textColors[index]} mb-2`}>{stage}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-gray-900">{data.count}</span>
                    <span className="text-sm text-gray-600">
                      {totalMembers > 0 ? Math.round((data.count / totalMembers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    {data.levels.map(level => (
                      <div key={level} className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                        {level}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <Gift className="w-6 h-6 text-pink-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">🎂 Próximos Cumpleaños</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBirthdays.map(member => {
              const birthDate = new Date(member.fecha_nacimiento);
              const age = calculateAge(member.fecha_nacimiento) + 1; // Next age
              
              return (
                <div key={member.id} className="flex items-center p-3 bg-pink-50 rounded-lg">
                  {member.foto_url ? (
                    <img 
                      src={member.foto_url} 
                      alt={member.nombre}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-6 h-6 text-pink-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {member.nombre_favorito || member.nombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      {birthDate.toLocaleDateString()} - {age} años
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="flex items-center">
              <UserCheck className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium text-blue-700">Tomar Asistencia</span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </button>
          
          <button className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium text-green-700">Ver {terminology.member}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-green-600" />
          </button>
          
          <button className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
              <span className="font-medium text-purple-700">Ver Reportes</span>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600" />
          </button>
          
          <button className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-orange-600 mr-3" />
              <span className="font-medium text-orange-700">Transiciones</span>
            </div>
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;