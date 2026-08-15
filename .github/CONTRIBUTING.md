# Colaboración en Alienta

## Rama principal

`main` representa el estado estable. No se trabaja directamente sobre ella después del commit inicial.

## Nombres de ramas

- `codex/<descripcion-corta>`: trabajo realizado con asistencia de Codex.
- `feature/<descripcion-corta>`: funciones desarrolladas manualmente.
- `fix/<descripcion-corta>`: correcciones de errores.
- `docs/<descripcion-corta>`: cambios exclusivos de documentación.

Usar minúsculas, palabras separadas por guiones y nombres breves. Ejemplos:

```text
codex/expo-base
feature/bible-reader
fix/share-card-overflow
docs/privacy-notes
```

## Flujo de trabajo

1. Actualizar `main`.
2. Crear una rama con el prefijo correspondiente.
3. Hacer cambios pequeños y verificables.
4. Ejecutar las validaciones del proyecto.
5. Abrir un pull request hacia `main`.
6. Esperar las verificaciones automáticas y, cuando haya un segundo integrante, al menos una aprobación.
7. Fusionar mediante **Squash and merge**.

## Pull requests

- Explicar qué cambia y por qué.
- Añadir pasos de prueba.
- Incluir capturas cuando cambie la interfaz.
- No incluir claves, archivos `.env`, certificados ni datos sensibles.
- No mezclar cambios no relacionados.

## Commits

Usar mensajes en modo imperativo y con alcance claro:

```text
docs: define MVP and repository workflow
feat: add emotion picker
fix: prevent long verse text overflow
```
