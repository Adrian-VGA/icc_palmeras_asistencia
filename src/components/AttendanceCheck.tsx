import React, { useState, useEffect } from 'react';
import { Check, X, Search, Filter, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JovenConAsistencia, Profile } from '../types';

interface AttendanceCheckProps {
  currentProfile: Profile;
}

export default function AttendanceCheck({ currentProfile }: AttendanceCheckProps) {
  const [jovenes, setJovenes] = useState<JovenConAsistencia[]>([]);
  const [filteredJovenes, setFilteredJovenes] = useState<JovenConAsistencia[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('todos');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string>('');

  useEffect(() => {
    loadJovenes();
  }, [selectedDate]);

  useEffect(() => {
    filterJovenes();
  }, [jovenes, searchTerm, filter]);

  const loadJovenes = async () => {
    try {
      console.log(`Loading ${currentProfile.memberLabel}s for attendance...`);
      
      // Solo cargar miembros del perfil actual
      const { data: jovenesData, error } = await supabase
        .from('jovenes')
        .select('*')
        .lte('fecha_nacimiento', new Date(new Date().getFullYear() - currentProfile.ageRange.min, 11, 31).toISOString().split('T')[0])
        .order('nombre');

      if (error) throw error;
      console.log('Jóvenes loaded:', jovenesData?.length);

      console.log('Loading attendance for date:', selectedDate);
      
      // Cargar asistencias de hoy
      const { data: asistenciasData } = await supabase
        .from('asistencia')
        .select('*')
        .eq('fecha', selectedDate);

      console.log('Attendance data:', asistenciasData?.length);

      const jovenesConAsistencia = jovenesData.map(joven => ({
        ...joven,
        asistencia_hoy: asistenciasData?.some(a => a.joven_id === joven.id && a.presente) || false
      }));

      setJovenes(jovenesConAsistencia);
      console.log('Jóvenes with attendance loaded successfully');
    } catch (error) {
      console.error('Error loading jovenes:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterJovenes = () => {
    let filtered = jovenes;

    if (searchTerm) {
      filtered = filtered.filter(joven =>
        joven.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter === 'presentes') {
      filtered = filtered.filter(joven => joven.asistencia_hoy);
    } else if (filter === 'ausentes') {
      filtered = filtered.filter(joven => !joven.asistencia_hoy);
    }

    setFilteredJovenes(filtered);
  };

  const toggleAsistencia = async (jovenId: string, presente: boolean) => {
    setUpdating(jovenId);

    try {
      // Verificar si ya existe registro de asistencia
      const { data: existingAttendance } = await supabase
        .from('asistencia')
        .select('id')
        .eq('joven_id', jovenId)
        .eq('fecha', selectedDate)
        .single();

      if (existingAttendance) {
        // Actualizar registro existente
        await supabase
          .from('asistencia')
          .update({ presente: !presente })
          .eq('id', existingAttendance.id);
      } else {
        // Crear nuevo registro
        await supabase
          .from('asistencia')
          .insert({
            joven_id: jovenId,
            fecha: selectedDate,
            presente: true
          });
      }

      // Actualizar estado local
      setJovenes(prev => prev.map(joven => 
        joven.id === jovenId 
          ? { ...joven, asistencia_hoy: !presente }
          : joven
      ));
    } catch (error) {
      console.error('Error updating attendance:', error);
    } finally {
      setUpdating('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">📅 Tomar Asistencia - {currentProfile.systemName}</h2>
        <p className="text-gray-600">Marca la asistencia de los {currentProfile.memberLabel}s para la fecha seleccionada</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de Asistencia</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Buscar Joven</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 w-full">🎯 Filtrar</label>
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="presentes">Presentes</option>
              <option value="ausentes">Ausentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 md:p-6">
          <p className="text-sm text-blue-600 font-medium">Total {currentProfile.memberLabel}s</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-700">{jovenes.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 md:p-6">
          <p className="text-sm text-green-600 font-medium">Presentes</p>
          <p className="text-2xl md:text-3xl font-bold text-green-700">
            {jovenes.filter(j => j.asistencia_hoy).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 md:p-6">
          <p className="text-sm text-red-600 font-medium">Ausentes</p>
          <p className="text-2xl md:text-3xl font-bold text-red-700">
            {jovenes.filter(j => !j.asistencia_hoy).length}
          </p>
        </div>
      </div>

      {/* Lista de jóvenes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {filteredJovenes.map((joven) => (
          <div
            key={joven.id}
            className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-3 md:p-4 transition-all duration-200 border ${
              joven.asistencia_hoy 
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-green-200' 
                : 'border-slate-200 hover:border-blue-300 hover:shadow-xl'
            }`}
          >
            <div className="flex flex-col items-center space-y-2 md:space-y-3">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-lg">
                {joven.foto_url ? (
                  <img
                    src={joven.foto_url}
                    alt={joven.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 text-xs md:text-sm leading-tight">
                  {joven.nombre_favorito || joven.nombre}
                </h3>
                {joven.fecha_nacimiento && (
                  <p className="text-xs text-gray-500">
                    {new Date().getFullYear() - new Date(joven.fecha_nacimiento).getFullYear()} años
                  </p>
                )}
                <p className="text-xs text-gray-500 truncate">{joven.nivel_ruta_pfi}</p>
              </div>

              <button
                onClick={() => toggleAsistencia(joven.id, joven.asistencia_hoy || false)}
                disabled={updating === joven.id}
                className={`w-full py-2 px-2 md:px-4 rounded-xl font-medium text-xs md:text-sm transition-all duration-200 ${
                  joven.asistencia_hoy
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
                    : 'bg-gradient-to-r from-gray-200 to-slate-200 text-gray-700 hover:from-gray-300 hover:to-slate-300'
                } disabled:opacity-50`}
              >
                {updating === joven.id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-1">
                    {joven.asistencia_hoy ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="hidden md:inline">Presente</span>
                        <span className="md:hidden">✓</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        <span className="hidden md:inline">Marcar</span>
                        <span className="md:hidden">Marcar</span>
                      </>
                    )}
                  </div>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredJovenes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron jóvenes con los criterios de búsqueda.</p>
        </div>
      )}
    </div>
  );
}