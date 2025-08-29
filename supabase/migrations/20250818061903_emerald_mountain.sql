/*
  # Actualización tabla líderes - Campos adicionales

  1. Modificaciones a tabla lideres
    - Agregar `nombre_favorito` (text, nombre favorito del líder)
    - Agregar `fecha_nacimiento` (date, fecha de nacimiento)
    - Agregar `color_favorito` (text, color favorito)
    - Agregar `direccion` (text, dirección)
    - Agregar `telefono` (text, número de teléfono)

  2. Mantener compatibilidad
    - Todos los campos nuevos son opcionales
    - No afecta datos existentes
*/

-- Agregar nuevas columnas a la tabla lideres
DO $$
BEGIN
  -- Agregar nombre_favorito si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lideres' AND column_name = 'nombre_favorito'
  ) THEN
    ALTER TABLE lideres ADD COLUMN nombre_favorito text DEFAULT '';
  END IF;

  -- Agregar fecha_nacimiento si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lideres' AND column_name = 'fecha_nacimiento'
  ) THEN
    ALTER TABLE lideres ADD COLUMN fecha_nacimiento date;
  END IF;

  -- Agregar color_favorito si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lideres' AND column_name = 'color_favorito'
  ) THEN
    ALTER TABLE lideres ADD COLUMN color_favorito text DEFAULT '#3B82F6';
  END IF;

  -- Agregar direccion si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lideres' AND column_name = 'direccion'
  ) THEN
    ALTER TABLE lideres ADD COLUMN direccion text DEFAULT '';
  END IF;

  -- Agregar telefono si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lideres' AND column_name = 'telefono'
  ) THEN
    ALTER TABLE lideres ADD COLUMN telefono text DEFAULT '';
  END IF;
END $$;