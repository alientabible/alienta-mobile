# Alienta — Biblia y Comunidad

Repositorio de trabajo para una aplicación móvil cristiana, accesible y multilingüe para iOS y Android.

## Estado

El proyecto está en fase de definición. Todavía no se ha generado la aplicación para evitar fijar una arquitectura antes de cerrar las decisiones esenciales de producto, seguridad, privacidad y licencias.

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

Cerrar las decisiones de la sección 18 del análisis y después generar el esqueleto ejecutable de la aplicación.

## Flujo de Git

- `main` se mantiene estable mediante pull requests.
- Las ramas asistidas usan `codex/<descripcion>`.
- Las funciones manuales usan `feature/<descripcion>`.
- Las reglas completas están en [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md).
