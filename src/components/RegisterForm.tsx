import React, { useState } from 'react';
import { Camera, Save, User, Calendar, Heart, Palette, Users, Award, MapPin, Phone, FileText, Smile, Crop } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { ChromePicker } from 'react-color';
import { Profile } from '../types';

interface RegisterFormProps {
  currentProfile: Profile;
}

export default function RegisterForm({ currentProfile }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    nombre_favorito: '',
    fecha_nacimiento: '',
    hobby: '',
    color_favorito: '#FF6B6B',
    felipe_lider: '',
    nivel_ruta_pfi: '',
    direccion: '',
    contacto: '',
    otros: ''
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [lideres, setLideres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    loadLideres();
  }, []);

  const loadLideres = async () => {
    try {
      const { data } = await supabase
        .from('lideres')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      setLideres(data || []);
    } catch (error) {
      console.error('Error loading lideres:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleColorChange = (color: any) => {
    setFormData({ ...formData, color_favorito: color.hex });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File, jovenId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${jovenId}.${fileExt}`;
    const filePath = `fotos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('jovenes')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('jovenes')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      console.log('Starting registration process...');
      const jovenId = uuidv4();
      console.log('Generated ID:', jovenId);
      let fotoUrl = '';

      // Subir foto si existe
      if (foto) {
        console.log('Uploading photo...');
        fotoUrl = await uploadPhoto(foto, jovenId);
        console.log('Photo uploaded:', fotoUrl);
      }

      // Insertar joven en la base de datos
      console.log('Inserting joven data:', { id: jovenId, ...formData, foto_url: fotoUrl });
      const { error } = await supabase
        .from('jovenes')
        .insert({
          id: jovenId,
          ...formData,
          foto_url: fotoUrl
        });

      if (error) throw error;

      console.log('Joven registered successfully');
      setSuccess(true);
      setFormData({
        nombre: '',
        nombre_favorito: '',
        fecha_nacimiento: '',
        hobby: '',
        color_favorito: '#FF6B6B',
        felipe_lider: '',
        nivel_ruta_pfi: '',
        direccion: '',
        contacto: '',
        otros: ''
      });
      setFoto(null);
      setPreviewUrl('');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error registrando joven:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        alert(`Error al registrar el joven: ${error.message}`);
      } else {
      alert('Error al registrar el joven. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const nivelesRutaPFI = [
    { value: '', label: 'Seleccionar nivel' },
    { value: 'No aplica', label: 'No aplica' },
    { value: 'Consolidado', label: 'PRIMERA ETAPA: Consolidado' },
    { value: 'Discipulado 1', label: 'PRIMERA ETAPA: Discipulado 1' },
    { value: 'Discipulado 2', label: 'PRIMERA ETAPA: Discipulado 2' },
    { value: 'Escuela de Liderazgo', label: 'SEGUNDA ETAPA: Escuela de Liderazgo' },
    { value: 'Escuela de Felipes', label: 'SEGUNDA ETAPA: Escuela de Felipes' },
    { value: 'Escuela de Maestros', label: 'SEGUNDA ETAPA: Escuela de Maestros' },
    { value: 'Seminario Biblico', label: 'TERCERA ETAPA: Seminario Bíblico' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-purple-100">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            ✨ Registrar Nuevo {currentProfile.memberLabel.charAt(0).toUpperCase() + currentProfile.memberLabel.slice(1)}
          </h2>
          <p className="text-gray-600">Complete toda la información del {currentProfile.memberLabel} para su registro en {currentProfile.name}</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg">
            <p className="text-green-700 font-medium">🎉 ¡{currentProfile.memberLabel.charAt(0).toUpperCase() + currentProfile.memberLabel.slice(1)} registrado exitosamente!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección de Foto */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              📸 Fotografía del {currentProfile.memberLabel.charAt(0).toUpperCase() + currentProfile.memberLabel.slice(1)}
            </h3>
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-purple-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="foto"
                />
                <label
                  htmlFor="foto"
                  className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  📷 Seleccionar Foto
                </label>
                <p className="text-sm text-purple-600 mt-2">Formatos: JPG, PNG (máx. 5MB)</p>
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-1" />
                👤 Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center">
                <Smile className="w-4 h-4 mr-1" />
                😊 Nombre Favorito
              </label>
              <input
                type="text"
                name="nombre_favorito"
                value={formData.nombre_favorito}
                onChange={handleInputChange}
                placeholder="¿Cómo le gusta que le digan?"
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                🎂 Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                ❤️ Hobby Favorito
              </label>
              <input
                type="text"
                name="hobby"
                value={formData.hobby}
                onChange={handleInputChange}
                placeholder="¿Qué le gusta hacer?"
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center">
                <Palette className="w-4 h-4 mr-1" />
                🎨 Color Favorito
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm flex items-center space-x-3"
                >
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: formData.color_favorito }}
                  ></div>
                  <span>{formData.color_favorito}</span>
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 z-10 mt-2">
                    <div className="fixed inset-0" onClick={() => setShowColorPicker(false)}></div>
                    <ChromePicker
                      color={formData.color_favorito}
                      onChange={handleColorChange}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-1" />
                👨‍🏫 Felipe Líder
              </label>
              <select
                name="felipe_lider"
                value={formData.felipe_lider}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="">Seleccionar líder</option>
                {lideres.map((lider) => (
                  <option key={lider.id} value={lider.nombre}>
                    {lider.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentProfile.showPFI && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center">
                <Award className="w-4 h-4 mr-1" />
                🏆 Nivel de Ruta PFI
              </label>
              <select
                name="nivel_ruta_pfi"
                value={formData.nivel_ruta_pfi}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
              >
                {nivelesRutaPFI.map((nivel) => (
                  <option key={nivel.value} value={nivel.value}>
                    {nivel.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                🏠 Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                📱 Número de Contacto
              </label>
              <input
                type="tel"
                name="contacto"
                value={formData.contacto}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              📝 Otros (Información adicional)
            </label>
            <textarea
              name="otros"
              value={formData.otros}
              onChange={handleInputChange}
              rows={3}
              placeholder="Cualquier información adicional relevante..."
              className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? '⏳ Guardando...' : `✨ Registrar ${currentProfile.memberLabel.charAt(0).toUpperCase() + currentProfile.memberLabel.slice(1)}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}