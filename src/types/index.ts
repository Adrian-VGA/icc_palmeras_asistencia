export interface Joven {
  id: string;
  nombre: string;
  nombre_favorito?: string;
  fecha_nacimiento: string;
  hobby: string;
  color_favorito: string;
  felipe_lider: string;
  nivel_ruta_pfi: string;
  direccion: string;
  contacto: string;
  otros: string;
  foto_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Lider {
  id: string;
  nombre: string;
  nombre_favorito?: string;
  fecha_nacimiento?: string;
  color_favorito?: string;
  direccion?: string;
  telefono?: string;
  foto_url?: string;
  activo: boolean;
  created_at: string;
}

export interface Asistencia {
  id: string;
  joven_id: string;
  fecha: string;
  presente: boolean;
  created_at: string;
}

export interface JovenConAsistencia extends Joven {
  asistencia_hoy?: boolean;
  edad?: number;
}

export interface EstadisticasAsistencia {
  totalJovenes: number;
  asistenciaHoy: number;
  promedioMes: number;
  asistenciaMasAlta: number;
  fechaAsistenciaMasAlta: string;
  faltaronHoy: number;
  distribucionNivel: Record<string, number>;
}

export interface Profile {
  id: string;
  name: string;
  displayName: string;
  subtitle: string;
  logo: string;
  password: string;
  ageRange: {
    min: number;
    max: number;
  };
  memberLabel: string;
  showPFI: boolean;
  leaderLabel: string;
  systemName: string;
}

export interface Transition {
  id: string;
  joven_id: string;
  from_profile: string;
  to_profile: string;
  reason: string;
  created_at: string;
  processed: boolean;
}