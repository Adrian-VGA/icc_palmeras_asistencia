/*
  # Actualización del Sistema - Líderes y Mejoras

  1. Nueva Tabla
    - `lideres`
      - `id` (uuid, primary key)
      - `nombre` (text, nombre del líder)
      - `foto_url` (text, URL de la foto)
      - `activo` (boolean, si está activo)
      - `created_at` (timestamptz, fecha de creación)

  2. Modificaciones a tabla jovenes
    - Agregar `nombre_favorito` (text, nombre favorito del joven)
    - Cambiar `nivel_pfi` a `nivel_ruta_pfi`

  3. Seguridad
    - Enable RLS en tabla lideres
    - Políticas para permitir todas las operaciones
*/

-- Crear tabla lideres
CREATE TABLE IF NOT EXISTS lideres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  foto_url text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en lideres
ALTER TABLE lideres ENABLE ROW LEVEL SECURITY;

-- Crear política para lideres
CREATE POLICY "Allow all operations on lideres"
  ON lideres
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

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

-- Cambiar nombre de columna nivel_pfi a nivel_ruta_pfi si existe la columna nivel_pfi
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jovenes' AND column_name = 'nivel_pfi'
  ) THEN
    ALTER TABLE jovenes RENAME COLUMN nivel_pfi TO nivel_ruta_pfi;
  END IF;
END $$;

-- Si no existe nivel_ruta_pfi, crearla
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jovenes' AND column_name = 'nivel_ruta_pfi'
  ) THEN
    ALTER TABLE jovenes ADD COLUMN nivel_ruta_pfi text DEFAULT '';
  END IF;
END $$;

-- Crear índice para lideres
CREATE INDEX IF NOT EXISTS idx_lideres_nombre ON lideres(nombre);
CREATE INDEX IF NOT EXISTS idx_lideres_activo ON lideres(activo);