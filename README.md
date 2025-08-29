# Sistema de Asistencia Renovación 21

Sistema moderno para la gestión de asistencia de jóvenes del ministerio Renovación 21.

## Características

- **Registro completo de jóvenes** con foto y datos personales
- **Sistema visual de asistencia** con fotos para fácil identificación
- **Dashboard con estadísticas** en tiempo real
- **Multiplataforma** - funciona en móviles, tablets y PC
- **Sincronización automática** entre dispositivos
- **Base de datos en la nube** con respaldo automático

## Tecnologías

- React + TypeScript
- Tailwind CSS para estilos
- Supabase para base de datos y storage
- Vite para desarrollo y build
- PWA ready para instalación en dispositivos

## Configuración

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Configura Supabase:
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Copia `.env.example` a `.env` y completa las variables
   - Ejecuta las migraciones en el SQL Editor de Supabase
4. Inicia el servidor de desarrollo: `npm run dev`

## Deployment

El proyecto está configurado para deployment en GitHub Pages:

1. Haz push a tu repositorio de GitHub
2. Habilita GitHub Pages en la configuración del repositorio
3. El sitio se construirá automáticamente con GitHub Actions

## Uso

### Registrar Jóvenes
1. Ve a la sección "Registrar"
2. Completa el formulario con todos los datos
3. Sube una foto del joven
4. Guarda el registro

### Tomar Asistencia
1. Ve a la sección "Asistencia"
2. Verás las fotos de todos los jóvenes registrados
3. Haz clic en "Marcar" para los que estén presentes
4. Los cambios se guardan automáticamente

### Ver Estadísticas
El dashboard muestra:
- Total de jóvenes registrados
- Asistencia del día actual
- Promedio de asistencia mensual
- Distribución por nivel PFI

## Estructura de Datos

### Joven
- Nombre completo
- Fecha de nacimiento
- Hobby
- Color favorito
- Felipe líder asignado
- Nivel PFI
- Dirección
- Contacto
- Información adicional
- Foto

### Asistencia
- Registro por fecha
- Estado presente/ausente
- Historial completo

## Soporte

Para reportar problemas o solicitar características, crea un issue en GitHub.