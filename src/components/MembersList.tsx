import React, { useState, useEffect } from 'react';
import { Search, User, Edit, Trash2, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Joven, Profile } from '../types';

interface MembersListProps {
  currentProfile: Profile;
}

export default function MembersList({ currentProfile }: MembersListProps) {
  const [jovenes, setJovenes] = useState<Joven[]>([]);
  const [filteredJovenes, setFilteredJovenes] = useState<Joven[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJovenes();
  }, []);

  useEffect(() => {
    filterJovenes();
  }, [jovenes, searchTerm, levelFilter]);

  const loadJovenes = async () => {
    try {
      // Solo cargar miembros del perfil actual
      const { data, error } = await supabase
        .from('jovenes')
        .select('*')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setJovenes(data || []);
    } catch (error) {
      console.error('Error loading jovenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJovenes = () => {
    let filtered = jovenes;

    if (searchTerm) {
      filtered = filtered.filter(joven =>
        joven.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        joven.felipe_lider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'todos') {
      filtered = filtered.filter(joven => 
        joven.nivel_ruta_pfi?.toLowerCase() === levelFilter.toLowerCase()
      );
    }

    setFilteredJovenes(filtered);
  };

  const deleteJoven = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este joven? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jovenes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setJovenes(prev => prev.filter(j => j.id !== id));
    } catch (error) {
      console.error('Error deleting joven:', error);
      alert('Error al eliminar el joven');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Lista de {currentProfile.memberLabel}s</h2>
        <p className="text-gray-600">Gestiona la información de todos los {currentProfile.memberLabel}s registrados en {currentProfile.systemName}</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o líder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los niveles</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de miembros */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {currentProfile.memberLabel.charAt(0).toUpperCase() + currentProfile.memberLabel.slice(1)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel PFI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Líder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJovenes.map((joven) => (
                <tr key={joven.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {joven.foto_url ? (
                          <img
                            src={joven.foto_url}
                            alt={joven.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{joven.nombre}</div>
                        <div className="text-sm text-gray-500">{joven.hobby}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {calculateAge(joven.fecha_nacimiento)} años
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(joven.fecha_nacimiento).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      joven.nivel_ruta_pfi?.toLowerCase() === 'seminario biblico' ? 'bg-green-100 text-green-800' :
                      joven.nivel_ruta_pfi?.toLowerCase().includes('escuela') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {joven.nivel_ruta_pfi || 'No definido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {joven.felipe_lider || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {joven.contacto || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteJoven(joven.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredJovenes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron jóvenes con los criterios seleccionados.</p>
        </div>
      )}
    </div>
  );
}