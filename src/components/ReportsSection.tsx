import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Users, Award, Target, Crown, Star, UserCheck, UserX } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface ReportStats {
  totalJovenes: number;
  asistenciaHoy: number;
  faltaronHoy: number;
  promedioMes: number;
  asistenciaMasAltaMes: number;
  fechaAsistenciaMasAltaMes: string;
  asistenciaMasAltaHistorica: number;
  fechaAsistenciaMasAltaHistorica: string;
  porcentajeAsistenciaHoy: number;
  diasConAsistencia: number;
}

interface ReportsSectionProps {
  currentProfile: Profile;
}

export default function ReportsSection({ currentProfile }: ReportsSectionProps) {
  const [stats, setStats] = useState<ReportStats>({
    totalJovenes: 0,
    asistenciaHoy: 0,
    faltaronHoy: 0,
    promedioMes: 0,
    asistenciaMasAltaMes: 0,
    fechaAsistenciaMasAltaMes: '',
    asistenciaMasAltaHistorica: 0,
    fechaAsistenciaMasAltaHistorica: '',
    porcentajeAsistenciaHoy: 0,
    diasConAsistencia: 0
  });
  const [asistenciaDetallada, setAsistenciaDetallada] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadReportStats();
    loadDayDetails();
  }, [selectedMonth, selectedDay]);

  const loadReportStats = async () => {
    try {
      setLoading(true);
      
      // Total de miembros del perfil actual
      const { count: totalJovenes } = await supabase
        .from('jovenes')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_nacimiento', new Date(new Date().getFullYear() - currentProfile.ageRange.max, 0, 1).toISOString().split('T')[0])
        .lte('fecha_nacimiento', new Date(new Date().getFullYear() - currentProfile.ageRange.min, 11, 31).toISOString().split('T')[0]);

      // Obtener IDs de miembros del perfil actual
      const { data: jovenesDelPerfil } = await supabase
        .from('jovenes')
        .select('id')
        .gte('fecha_nacimiento', new Date(new Date().getFullYear() - currentProfile.ageRange.max, 0, 1).toISOString().split('T')[0])
        .lte('fecha_nacimiento', new Date(new Date().getFullYear() - currentProfile.ageRange.min, 11, 31).toISOString().split('T')[0]);

      const idsJovenes = jovenesDelPerfil?.map(j => j.id) || [];

      // Asistencia de hoy
      const today = new Date().toISOString().split('T')[0];
      const { count: asistenciaHoy } = idsJovenes.length > 0 ? await supabase
        .from('asistencia')
        .select('*', { count: 'exact', head: true })
        .eq('fecha', today)
        .eq('presente', true)
        .in('joven_id', idsJovenes) : { count: 0 };

      const faltaronHoy = (totalJovenes || 0) - (asistenciaHoy || 0);
      const porcentajeAsistenciaHoy = totalJovenes ? Math.round(((asistenciaHoy || 0) / totalJovenes) * 100) : 0;

      // Estadísticas del mes seleccionado
      const startOfMonth = `${selectedMonth}-01`;
      const endOfMonth = new Date(selectedMonth + '-01');
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      const endOfMonthStr = endOfMonth.toISOString().split('T')[0];

      const { data: asistenciasMes } = idsJovenes.length > 0 ? await supabase
        .from('asistencia')
        .select('fecha, presente')
        .gte('fecha', startOfMonth)
        .lte('fecha', endOfMonthStr)
        .in('joven_id', idsJovenes) : { data: [] };

      // Calcular estadísticas del mes
      const diasUnicos = [...new Set(asistenciasMes?.map(a => a.fecha) || [])];
      const asistenciasPorDia = diasUnicos.map(fecha => ({
        fecha,
        asistentes: asistenciasMes?.filter(a => a.fecha === fecha && a.presente).length || 0
      }));

      const promedioMes = asistenciasPorDia.length > 0 
        ? Math.round(asistenciasPorDia.reduce((sum, dia) => sum + dia.asistentes, 0) / asistenciasPorDia.length)
        : 0;

      const asistenciaMasAltaMes = Math.max(...asistenciasPorDia.map(d => d.asistentes), 0);
      const fechaAsistenciaMasAltaMes = asistenciasPorDia.find(d => d.asistentes === asistenciaMasAltaMes)?.fecha || '';

      // Asistencia más alta histórica
      const { data: todasAsistencias } = idsJovenes.length > 0 ? await supabase
        .from('asistencia')
        .select('fecha, presente')
        .in('joven_id', idsJovenes) : { data: [] };

      const todasFechas = [...new Set(todasAsistencias?.map(a => a.fecha) || [])];
      const asistenciasPorDiaHistorica = todasFechas.map(fecha => ({
        fecha,
        asistentes: todasAsistencias?.filter(a => a.fecha === fecha && a.presente).length || 0
      }));

      const asistenciaMasAltaHistorica = Math.max(...asistenciasPorDiaHistorica.map(d => d.asistentes), 0);
      const fechaAsistenciaMasAltaHistorica = asistenciasPorDiaHistorica.find(d => d.asistentes === asistenciaMasAltaHistorica)?.fecha || '';

      setStats({
        totalJovenes: totalJovenes || 0,
        asistenciaHoy: asistenciaHoy || 0,
        faltaronHoy,
        promedioMes,
        asistenciaMasAltaMes,
        fechaAsistenciaMasAltaMes,
        asistenciaMasAltaHistorica,
        fechaAsistenciaMasAltaHistorica,
        porcentajeAsistenciaHoy,
        diasConAsistencia: diasUnicos.length
      });

    } catch (error) {
      console.error('Error loading report stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDayDetails = async () => {
    try {
      // Cargar detalles del día seleccionado solo del perfil actual
      const { data: jovenesData } = await supabase
        .from('jovenes')
        .select('id, nombre, nombre_favorito, foto_url')
        .gte('fecha_nacimiento', new Date(new Date().getFullYear() - currentProfile.ageRange.max, 0, 1).toISOString().split('T')[0])
        .lte('fecha_nacimiento', new Date(new Date().getFullYear() - currentProfile.ageRange.min, 11, 31).toISOString().split('T')[0]);

      const { data: asistenciaData } = await supabase
        .from('asistencia')
        .select('joven_id, presente')
        .eq('fecha', selectedDay);

      const detalles = jovenesData?.map(joven => {
        const asistencia = asistenciaData?.find(a => a.joven_id === joven.id);
        return {
          ...joven,
          presente: asistencia?.presente || false,
          registrado: !!asistencia
        };
      }) || [];

      setAsistenciaDetallada(detalles);
    } catch (error) {
      console.error('Error loading day details:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">📊 Reportes - {currentProfile.systemName}</h2>
          <p className="text-slate-600">Análisis detallado de asistencia y participación de {currentProfile.memberLabel}s</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">📅 Mes a analizar</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">🔍 Día específico</label>
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas de hoy */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-8 h-8" />
          <div>
            <h3 className="text-2xl font-bold">Asistencia de Hoy</h3>
            <p className="text-blue-100">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.asistenciaHoy}</p>
            <p className="text-sm text-blue-100">Presentes</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-60" />
            <p className="text-3xl font-bold">{stats.faltaronHoy}</p>
            <p className="text-sm text-blue-100">Ausentes</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.porcentajeAsistenciaHoy}%</p>
            <p className="text-sm text-blue-100">Porcentaje</p>
          </div>
        </div>
      </div>

      {/* Trofeos y Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Record Histórico */}
        <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-100" />
            </div>
            <div>
              <h3 className="text-xl font-bold">🏆 Record Histórico</h3>
              <p className="text-yellow-100">Mayor asistencia registrada</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">{stats.asistenciaMasAltaHistorica}</p>
            <p className="text-lg">jóvenes presentes</p>
            {stats.fechaAsistenciaMasAltaHistorica && (
              <p className="text-sm text-yellow-100 mt-2">
                📅 {new Date(stats.fechaAsistenciaMasAltaHistorica).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        </div>

        {/* Record del Mes */}
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-purple-100" />
            </div>
            <div>
              <h3 className="text-xl font-bold">👑 Record del Mes</h3>
              <p className="text-purple-100">Mejor asistencia de {new Date(selectedMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">{stats.asistenciaMasAltaMes}</p>
            <p className="text-lg">jóvenes presentes</p>
            {stats.fechaAsistenciaMasAltaMes && (
              <p className="text-sm text-purple-100 mt-2">
                📅 {new Date(stats.fechaAsistenciaMasAltaMes).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas del mes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Promedio del Mes</p>
              <p className="text-3xl font-bold text-slate-900">{stats.promedioMes}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Días con Servicio</p>
              <p className="text-3xl font-bold text-slate-900">{stats.diasConAsistencia}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Registrados</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalJovenes}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Efectividad Hoy</p>
              <p className="text-3xl font-bold text-slate-900">{stats.porcentajeAsistenciaHoy}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Comparación visual */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          <Star className="w-6 h-6 mr-2 text-yellow-500" />
          📈 Comparación de Rendimiento
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="font-semibold text-slate-900">Record Histórico</p>
                <p className="text-sm text-slate-600">Mejor día de todos los tiempos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-600">{stats.asistenciaMasAltaHistorica}</p>
              <p className="text-sm text-slate-500">{currentProfile.memberLabel}s</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-semibold text-slate-900">Record del Mes</p>
                <p className="text-sm text-slate-600">Mejor día del mes actual</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{stats.asistenciaMasAltaMes}</p>
              <p className="text-sm text-slate-500">{currentProfile.memberLabel}s</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-semibold text-slate-900">Asistencia Hoy</p>
                <p className="text-sm text-slate-600">Participación actual</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{stats.asistenciaHoy}</p>
              <p className="text-sm text-slate-500">{currentProfile.memberLabel}s ({stats.porcentajeAsistenciaHoy}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis del día específico */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-indigo-500" />
          📋 Análisis del {new Date(selectedDay).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Presentes */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <h4 className="font-bold text-green-800 mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              ✅ Presentes ({asistenciaDetallada.filter(j => j.presente).length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {asistenciaDetallada.filter(j => j.presente).map((joven) => (
                <div key={joven.id} className="flex items-center space-x-3 bg-white/50 rounded-lg p-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {joven.foto_url ? (
                      <img src={joven.foto_url} alt={joven.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-green-800 truncate">
                    {joven.nombre_favorito || joven.nombre}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ausentes */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
            <h4 className="font-bold text-red-800 mb-4 flex items-center">
              <UserX className="w-5 h-5 mr-2" />
              ❌ Ausentes ({asistenciaDetallada.filter(j => !j.presente).length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {asistenciaDetallada.filter(j => !j.presente).map((joven) => (
                <div key={joven.id} className="flex items-center space-x-3 bg-white/50 rounded-lg p-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {joven.foto_url ? (
                      <img src={joven.foto_url} alt={joven.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-red-800 truncate">
                    {joven.nombre_favorito || joven.nombre}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}