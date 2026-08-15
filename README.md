# Alienta — Biblia y Comunidad

Repositorio de trabajo para una aplicación móvil cristiana, accesible y multilingüe para iOS y Android.

## Estado

La base móvil ya funciona con Expo SDK 57, React Native y TypeScript. La primera pantalla accesible de Alienta está preparada para ejecutarse en Android y web; la integración con Biblia, IA y Supabase se añadirá por fases.

## Documentación

- [Análisis, MVP y arquitectura](docs/01-analisis-mvp-y-arquitectura.md)
- [Ruta guiada de construcción](docs/02-ruta-guiada-de-construccion.md)

## Decisiones propuestas

- Cliente móvil: Expo + React Native + TypeScript.
- Backend: Supabase (Postgres, autenticación, almacenamiento y funciones de servidor).
- Biblia inicial: Reina-Valera 1909 en español y World English Bible en inglés, sujetas a una verificación final de procedencia y licencia antes de importar los textos.
- Lanzamiento inicial: español, lectura sin cuenta y funciones sociales limitadas a un piloto cerrado para adultos.
- IA: respuestas basadas exclusivamente en versículos recuperados de la base bíblica; nunca se permitirá que el modelo invente o reescriba el texto bíblico.

## Siguiente hito

Implementar la navegación del MVP y el primer flujo local de “¿Cómo te sientes hoy?” antes de conectar servicios externos.

## Desarrollo local

Requisitos instalados: Node.js, OpenJDK 17, Android Studio, Android SDK 36 y un emulador Android.

```powershell
npm install
npm run android
```

Otros comandos disponibles:

```powershell
npm start
npm run web
npm run lint
```

## Flujo de Git

- `main` se mantiene estable mediante pull requests.
- Las ramas asistidas usan `codex/<descripcion>`.
- Las funciones manuales usan `feature/<descripcion>`.
- Las reglas completas están en [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md).
