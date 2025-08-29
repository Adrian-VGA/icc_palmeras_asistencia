/*
  # Sistema de Asistencia Renovación 21

  1. Nuevas Tablas
    - `jovenes`
      - `id` (uuid, primary key)
      - `nombre` (text, nombre completo del joven)
      - `fecha_nacimiento` (date, fecha de nacimiento)
      - `hobby` (text, hobby o intereses)
      - `color_favorito` (text, color favorito)
      - `felipe_lider` (text, nombre del líder Felipe)
      - `nivel_pfi` (text, nivel PFI del joven)
      - `direccion` (text, dirección de residencia)
      - `contacto` (text, número de contacto)
      - `otros` (text, información adicional)
      - `foto_url` (text, URL de la foto)
      - `created_at` (timestamptz, fecha de creación)
      - `updated_at` (timestamptz, fecha de actualización)

    - `asistencia`
      - `id` (uuid, primary key)
      - `joven_id` (uuid, foreign key to jovenes)
      - `fecha` (date, fecha de la asistencia)
      - `presente` (boolean, si estuvo presente)
      - `created_at` (timestamptz, fecha de registro)

  2. Seguridad
    - Enable RLS en ambas tablas
    - Políticas para permitir todas las operaciones (sistema interno)

  3. Storage
    - Bucket para fotos de los jóvenes
*/

-- Crear tabla jovenes
CREATE TABLE IF NOT EXISTS jovenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  fecha_nacimiento date NOT NULL,
  hobby text DEFAULT '',
  color_favorito text DEFAULT '',
  felipe_lider text DEFAULT '',
  nivel_pfi text DEFAULT '',
  direccion text DEFAULT '',
  contacto text DEFAULT '',
  otros text DEFAULT '',
  foto_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla asistencia
CREATE TABLE IF NOT EXISTS asistencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  joven_id uuid NOT NULL REFERENCES jovenes(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  presente boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(joven_id, fecha)
);

-- Habilitar RLS
ALTER TABLE jovenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;

-- Crear políticas permisivas para uso interno
CREATE POLICY "Allow all operations on jovenes"
  ON jovenes
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on asistencia"
  ON asistencia
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para auto-actualizar updated_at
CREATE TRIGGER update_jovenes_updated_at
  BEFORE UPDATE ON jovenes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_jovenes_nombre ON jovenes(nombre);
CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON asistencia(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencia_joven_fecha ON asistencia(joven_id, fecha);

-- Crear bucket para fotos (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('jovenes', 'jovenes', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para permitir uploads
CREATE POLICY "Allow public uploads"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'jovenes');

CREATE POLICY "Allow public downloads"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'jovenes');

CREATE POLICY "Allow public deletes"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'jovenes');