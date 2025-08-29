import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lider, Profile } from '../types';
import { Users, Plus, Edit2, Trash2, Calendar, Phone, MapPin, Heart, User, Camera } from 'lucide-react';
import { ChromePicker } from 'react-color';

interface LeadersManagerProps {
  currentProfile: Profile;
}

export default function LeadersManager({ currentProfile }: LeadersManagerProps) {
  const [leaders, setLeaders] = useState<Lider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    nombre_favorito: '',
    fecha_nacimiento: '',
    color_favorito: '#3B82F6',
    direccion: '',
    telefono: '',
    foto_url: '',
    activo: true
  });

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from('lideres')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching leaders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, telefono: formatted });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('jovenes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('jovenes')
        .getPublicUrl(fileName);

      setFormData({ ...formData, foto_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLeader) {
        const { error } = await supabase
          .from('lideres')
          .update(formData)
          .eq('id', editingLeader.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lideres')
          .insert([formData]);
        
        if (error) throw error;
      }

      await fetchLeaders();
      resetForm();
    } catch (error) {
      console.error('Error saving leader:', error);
    }
  };

  const handleEdit = (leader: Lider) => {
    setEditingLeader(leader);
    setFormData({
      nombre: leader.nombre,
      nombre_favorito: leader.nombre_favorito || '',
      fecha_nacimiento: leader.fecha_nacimiento || '',
      color_favorito: leader.color_favorito || '#3B82F6',
      direccion: leader.direccion || '',
      telefono: leader.telefono || '',
      foto_url: leader.foto_url || '',
      activo: leader.activo
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este líder?')) return;
    
    try {
      const { error } = await supabase
        .from('lideres')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchLeaders();
    } catch (error) {
      console.error('Error deleting leader:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      nombre_favorito: '',
      fecha_nacimiento: '',
      color_favorito: '#3B82F6',
      direccion: '',
      telefono: '',
      foto_url: '',
      activo: true
    });
    setEditingLeader(null);
    setShowForm(false);
    setShowColorPicker(false);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">👑 {currentProfile.leaderLabel}s</h2>
            <p className="text-gray-600">Gestiona los {currentProfile.leaderLabel.toLowerCase()}s de {currentProfile.systemName}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Líder</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingLeader ? '✏️ Editar Líder' : '➕ Nuevo Líder'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nombre del líder"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    😊 Nombre Favorito
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_favorito}
                    onChange={(e) => setFormData({ ...formData, nombre_favorito: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="¿Cómo le gusta que le digan?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  {formData.fecha_nacimiento && (
                    <p className="text-sm text-gray-500 mt-1">
                      Edad: {calculateAge(formData.fecha_nacimiento)} años
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="(123) 456-7890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Heart className="w-4 h-4 inline mr-1" />
                    Color Favorito
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-12 h-12 rounded-xl border-2 border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
                      style={{ backgroundColor: formData.color_favorito }}
                    />
                    <span className="text-sm text-gray-600">{formData.color_favorito}</span>
                  </div>
                  {showColorPicker && (
                    <div className="absolute z-10 mt-2">
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowColorPicker(false)}
                      />
                      <ChromePicker
                        color={formData.color_favorito}
                        onChange={(color) => setFormData({ ...formData, color_favorito: color.hex })}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Dirección de residencia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Foto del Líder
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                {formData.foto_url && (
                  <div className="mt-3">
                    <img
                      src={formData.foto_url}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                  Líder activo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editingLeader ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaders.map((leader) => (
          <div
            key={leader.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                {leader.foto_url ? (
                  <img
                    src={leader.foto_url}
                    alt={leader.nombre}
                    className="w-16 h-16 object-cover rounded-full border-3 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{leader.nombre}</h3>
                  {leader.nombre_favorito ? (
                    <p className="text-sm text-indigo-600">"{String(leader.nombre_favorito)}"</p>
                  ) : null}
                  {leader.fecha_nacimiento && (
                    <p className="text-sm text-gray-500">
                      {calculateAge(leader.fecha_nacimiento)} años
                    </p>
                  )}
                </div>
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: leader.color_favorito }}
                />
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {leader.telefono && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{leader.telefono}</span>
                  </div>
                )}
                {leader.direccion && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{leader.direccion}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    !!leader.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {!!leader.activo ? '✅ Activo' : '⏸️ Inactivo'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(leader)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(leader.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaders.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay líderes registrados</h3>
          <p className="text-gray-500 mb-6">Comienza agregando el primer líder juvenil</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Agregar Primer Líder
          </button>
        </div>
      )}
    </div>
  );
}