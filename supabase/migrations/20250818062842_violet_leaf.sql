/*
  # Migración Completa - Arreglar Esquema de Base de Datos

  1. Actualizar tabla jovenes
    - Agregar `nombre_favorito` si no existe
    - Renombrar `nivel_pfi` a `nivel_ruta_pfi` si es necesario
    - Agregar `nivel_ruta_pfi` si no existe

  2. Crear tabla lideres completa
    - `id` (uuid, primary key)
    - `nombre` (text, nombre del líder)
    - `nombre_favorito` (text, nombre favorito)
    - `fecha_nacimiento` (date, fecha de nacimiento)
    - `color_favorito` (text, color favorito)
    - `direccion` (text, dirección)
    - `telefono` (text, teléfono)
    - `foto_url` (text, URL de la foto)
    - `activo` (boolean, si está activo)
    - `created_at` (timestamptz, fecha de creación)

  3. Seguridad
    - Enable RLS en tabla lideres
    - Políticas para permitir todas las operaciones

  4. Storage
    - Bucket para logos si no existe
*/

-- Agregar columna nombre_favorito a jovenes si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jovenes' AND column_name = 'nombre_favorito'
  ) THEN
    ALTER TABLE jovenes ADD COLUMN nombre_favorito text DEFAULT '';
  END IF;
END $$;

-- Verificar si existe nivel_pfi y renombrar a nivel_ruta_pfi
DO $$
BEGIN
  -- Si existe nivel_pfi, renombrarla
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jovenes' AND column_name = 'nivel_pfi'
  ) THEN
    ALTER TABLE jovenes RENAME COLUMN nivel_pfi TO nivel_ruta_pfi;
  END IF;
  
  -- Si no existe nivel_ruta_pfi después del rename, crearla
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jovenes' AND column_name = 'nivel_ruta_pfi'
  ) THEN
    ALTER TABLE jovenes ADD COLUMN nivel_ruta_pfi text DEFAULT '';
  END IF;
END $$;

-- Crear tabla lideres si no existe
CREATE TABLE IF NOT EXISTS lideres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  nombre_favorito text DEFAULT '',
  fecha_nacimiento date,
  color_favorito text DEFAULT '#3B82F6',
  direccion text DEFAULT '',
  telefono text DEFAULT '',
  foto_url text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en lideres
ALTER TABLE lideres ENABLE ROW LEVEL SECURITY;

-- Crear política para lideres (permitir todas las operaciones)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lideres' AND policyname = 'Allow all operations on lideres'
  ) THEN
    CREATE POLICY "Allow all operations on lideres"
      ON lideres
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Crear índices para lideres si no existen
CREATE INDEX IF NOT EXISTS idx_lideres_nombre ON lideres(nombre);
CREATE INDEX IF NOT EXISTS idx_lideres_activo ON lideres(activo);

-- Crear bucket para logos si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para logos
DO $$
BEGIN
  -- Política para uploads
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Allow public uploads for logos'
  ) THEN
    CREATE POLICY "Allow public uploads for logos"
      ON storage.objects
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'logos');
  END IF;

  -- Política para downloads
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Allow public downloads for logos'
  ) THEN
    CREATE POLICY "Allow public downloads for logos"
      ON storage.objects
      FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'logos');
  END IF;

  -- Política para deletes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Allow public deletes for logos'
  ) THEN
    CREATE POLICY "Allow public deletes for logos"
      ON storage.objects
      FOR DELETE
      TO anon, authenticated
      USING (bucket_id = 'logos');
  END IF;
END $$;