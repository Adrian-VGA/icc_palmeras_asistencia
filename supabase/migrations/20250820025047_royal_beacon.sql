/*
  # Sistema de Transiciones Generacionales

  1. Nueva Tabla
    - `transitions`
      - `id` (uuid, primary key)
      - `joven_id` (uuid, foreign key to jovenes)
      - `from_profile` (text, perfil de origen)
      - `to_profile` (text, perfil de destino)
      - `reason` (text, razón de la transición)
      - `created_at` (timestamptz, fecha de creación)
      - `processed` (boolean, si fue procesada)

  2. Seguridad
    - Enable RLS en tabla transitions
    - Políticas para permitir todas las operaciones
*/

-- Crear tabla transitions si no existe
CREATE TABLE IF NOT EXISTS transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  joven_id uuid NOT NULL REFERENCES jovenes(id) ON DELETE CASCADE,
  from_profile text NOT NULL,
  to_profile text NOT NULL,
  reason text DEFAULT 'Cambio por edad',
  created_at timestamptz DEFAULT now(),
  processed boolean DEFAULT false
);

-- Habilitar RLS en transitions
ALTER TABLE transitions ENABLE ROW LEVEL SECURITY;

-- Crear política para transitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transitions' AND policyname = 'Allow all operations on transitions'
  ) THEN
    CREATE POLICY "Allow all operations on transitions"
      ON transitions
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Crear índices para transitions
CREATE INDEX IF NOT EXISTS idx_transitions_joven_id ON transitions(joven_id);
CREATE INDEX IF NOT EXISTS idx_transitions_processed ON transitions(processed);
CREATE INDEX IF NOT EXISTS idx_transitions_created_at ON transitions(created_at);