# Alienta — Biblia y Comunidad

Repositorio de trabajo para una aplicación móvil cristiana, accesible y multilingüe para iOS y Android.

## Estado

La base móvil ya funciona con Expo SDK 57, React Native y TypeScript. Incluye cinco áreas navegables, sistema visual editorial, modo claro/oscuro, componentes accesibles y la infraestructura inicial de traducciones en español. El Inicio ofrece un flujo local de reflexión simulada, sin IA ni persistencia. La Biblia local ya incorpora RVR1909 y WEB con lectura, búsqueda, favoritos y progreso sin conexión. También permite convertir versículos y reflexiones en tarjetas PNG verificables, listas para la hoja de compartir del dispositivo. La cuenta opcional ya tiene una base protegida con Supabase y modo invitado. Una bienvenida inicial omitible guarda localmente idioma, propósito, familiaridad bíblica, emoción y ritmo de lectura. La última lectura y las referencias favoritas se sincronizan entre dispositivos solo con sesión y consentimiento `bible_sync`; el texto bíblico, el tamaño de fuente y los datos emocionales no se envían. Los avisos de lectura se programan localmente, después de un permiso explícito, con texto general y sin registrar tokens remotos. La primera base del Bloque F ya define consentimiento, seguridad previa, temas estructurados, pasajes editoriales y validación estricta de la futura respuesta, todavía sin conectar un proveedor de IA.

## Documentación

- [Análisis, MVP y arquitectura](docs/01-analisis-mvp-y-arquitectura.md)
- [Ruta guiada de construcción](docs/02-ruta-guiada-de-construccion.md)
- [Sistema visual de Alienta](docs/03-sistema-visual-alienta.md)
- [Configuración de Supabase](docs/04-configuracion-supabase.md)

## Decisiones propuestas

- Cliente móvil: Expo + React Native + TypeScript.
- Backend: Supabase (Postgres, autenticación, almacenamiento y funciones de servidor).
- Biblia inicial: Reina-Valera 1909 en español y World English Bible en inglés, importadas desde eBible.org con procedencia, licencia y hashes verificados.
- Lanzamiento inicial: español, lectura sin cuenta y funciones sociales limitadas a un piloto cerrado para adultos.
- IA: respuestas basadas exclusivamente en versículos recuperados de la base bíblica; nunca se permitirá que el modelo invente o reescriba el texto bíblico.

## Siguiente hito

Someter los pasajes candidatos del Bloque F a revisión pastoral/editorial y completar el límite, presupuesto, moderación y política de errores del servidor antes de conectar un proveedor de IA. La validación equivalente de los avisos en Android continúa como puerta pendiente antes de la beta.

## Desarrollo local

Requisitos instalados: Node.js, OpenJDK 17, Android Studio, Android SDK 36 y un emulador Android.

Después de instalar OpenJDK 17, reinicia la terminal para que Windows cargue las nuevas variables de entorno.

```powershell
npm install
npm run android
```

Otros comandos disponibles:

```powershell
npm start
npm run web
npm run lint
npm run typecheck
npm test
```

## Flujo de Git

- `main` se mantiene estable mediante pull requests.
- Las ramas asistidas usan `codex/<descripcion>`.
- Las funciones manuales usan `feature/<descripcion>`.
- Las reglas completas están en [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md).
