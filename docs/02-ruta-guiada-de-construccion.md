# Ruta guiada de construcción

Este es el orden de trabajo. Cada bloque debe quedar ejecutable y verificado antes de pasar al siguiente; no se pegará todo el producto en un solo paso.

## Etapa 0 — Preparar propiedad y colaboración

### Paso 1. Definir quién será dueño

Antes de abrir las cuentas de tienda, decidir si Alienta pertenecerá a una persona o a una entidad legal. El nombre del vendedor puede quedar visible. Si se usa una entidad, preparar:

- nombre legal;
- dirección y teléfono;
- correo con dominio propio;
- sitio web básico;
- número D-U-N-S para las cuentas de organización cuando sea requerido.

La otra persona debe entrar como colaborador con su propia cuenta; nunca compartir contraseñas.

### Paso 2. Crear GitHub

Página: [github.com](https://github.com/)

1. Cada integrante crea su cuenta y activa 2FA.
2. Crear una organización `alienta-app` o el nombre disponible.
3. Crear un repositorio privado, por ejemplo `alienta-mobile`.
4. Añadir al segundo integrante.
5. Proteger `main`: cambios mediante pull request y al menos una aprobación.
6. Usar ramas `codex/...` para trabajo asistido y `feature/...` para trabajo manual.

Para dos personas, GitHub Free permite repositorios privados y colaboradores sin costo. No hace falta GitLab, Bitbucket ni un servidor propio en esta etapa.

### Paso 3. Crear cuentas técnicas gratuitas

Todavía no pagar las tiendas.

1. Expo: [expo.dev/signup](https://expo.dev/signup)
2. Supabase: [supabase.com/dashboard](https://supabase.com/dashboard)
3. Proveedor de IA: se crea cuando el prototipo funcione con respuestas simuladas.

Crear las cuentas de Apple y Google cerca de la beta, con tiempo suficiente para verificación y pruebas.

## Etapa 1 — Preparar el computador

Instalar en este orden:

1. Git: [git-scm.com/downloads](https://git-scm.com/downloads)
2. Node.js LTS: [nodejs.org](https://nodejs.org/)
3. Visual Studio Code: [code.visualstudio.com](https://code.visualstudio.com/)
4. Android Studio: [developer.android.com/studio](https://developer.android.com/studio)
5. Expo Go en un teléfono Android o iPhone para la primera prueba.

Extensiones mínimas de VS Code:

- ESLint;
- Prettier;
- Error Lens, opcional.

No instalar veinte extensiones ni generadores. Menos herramientas hacen más reproducible el entorno.

### Verificación prevista

```powershell
git --version
node --version
npm --version
adb --version
```

Usaremos una versión LTS vigente de Node y fijaremos la versión exacta en `.nvmrc` o `.node-version` al crear el proyecto.

## Etapa 2 — Generar la aplicación

Después de aprobar las decisiones del análisis, se generará una plantilla Expo en una carpeta temporal dentro del espacio de trabajo. Se revisarán sus archivos y solo entonces se integrarán en la raíz. Este procedimiento evita que el generador reemplace este `README.md` o la documentación existente.

El comando base de referencia será:

```powershell
npx create-expo-app@latest .bootstrap-expo --template default@sdk-latest
```

No debe ejecutarse manualmente todavía. Antes se comprobará la plantilla vigente, se verificará la ruta temporal resuelta y se hará la integración de forma controlada. Después se añadirá TypeScript estricto, formato, lint y pruebas.

### Primeros archivos que se configurarán

1. `package.json`
2. `app.config.ts`
3. `tsconfig.json`
4. `.gitignore`
5. `.env.example`
6. `src/app/_layout.tsx`
7. `src/app/(tabs)/_layout.tsx`
8. `src/theme/tokens.ts`
9. `src/i18n/index.ts`
10. `src/i18n/locales/es-CO.json`

### Primer criterio de terminado

- abre en Android y en Expo Go;
- muestra las cinco pestañas;
- soporta modo claro/oscuro;
- no tiene errores de TypeScript, lint ni pruebas;
- un lector de pantalla anuncia correctamente la navegación.

## Etapa 3 — Construir en orden de riesgo

### Bloque A. Sistema visual y accesibilidad

La dirección visual y sus criterios de validación están documentados en [`03-sistema-visual-alienta.md`](03-sistema-visual-alienta.md).

Archivos principales:

- `src/theme/tokens.ts`
- `src/theme/ThemeProvider.tsx`
- `src/components/AppText.tsx`
- `src/components/AppButton.tsx`
- `src/components/Screen.tsx`
- `src/components/EmptyState.tsx`

Se validarán contraste, texto al 200 %, áreas táctiles y reducir movimiento.

### Bloque B. Inicio con respuesta simulada

- `src/features/check-in/types.ts`
- `src/features/check-in/emotions.ts`
- `src/features/check-in/EmotionPicker.tsx`
- `src/features/check-in/CheckInForm.tsx`
- `src/features/reflection/types.ts`
- `src/features/reflection/mockReflection.ts`
- `src/app/(tabs)/index.tsx`
- `src/app/reflection/[id].tsx`

La experiencia se probará antes de conectar IA o guardar datos.

Estado: **completado y listo para validación en dispositivo**.

- permite seleccionar una emoción o describirla en un máximo de 240 caracteres;
- clasifica el estado localmente y muestra una reflexión simulada, oración y acción concreta;
- descarta el texto original y solo navega con una categoría general;
- interrumpe la reflexión automática ante señales explícitas de riesgo y muestra recursos oficiales de Colombia;
- no usa IA, cuenta de usuario, analítica, base de datos ni almacenamiento local;
- incluye pruebas del clasificador y compila para web e iOS.

La detección local de riesgo es una protección provisional del prototipo, no un diagnóstico ni el sistema de seguridad definitivo. El Bloque F deberá ampliar y evaluar esta capa antes de conectar IA.

### Bloque C. Biblia local

- `scripts/import-bible/README.md`
- `scripts/import-bible/validate-license.ts`
- `scripts/import-bible/build-database.ts`
- `src/features/bible/license.ts`
- `src/features/bible/repository.ts`
- `src/features/bible/BibleReader.tsx`
- `src/features/bible/BibleSearch.tsx`
- `src/app/(tabs)/bible.tsx`

El importador validará versículos, capítulos, canon, licencia y hash. No se copiará un archivo bíblico de un repositorio no verificado.

Estado: **completado y listo para validación en dispositivo**.

- empaqueta RVR1909 y World English Bible Protestant Edition desde las fuentes oficiales de eBible.org;
- conserva manifiestos, instantáneas de licencia y SHA-256 de cada fuente;
- incluye exactamente 66 libros, 1.189 capítulos y 62.205 registros de versículos;
- permite seleccionar traducción, navegar por libro y capítulo, buscar palabras o referencias, guardar favoritos, recordar la última lectura y ajustar el tamaño del texto;
- funciona sin conexión mediante SQLite en iOS y Android, con soporte configurado para la preview web;
- muestra dentro de la app la procedencia, licencia, canon y huella de cada traducción;
- mantiene el texto bíblico separado de las reflexiones locales y de cualquier contenido futuro generado con IA;
- incluye pruebas del canon, importador, licencias, base empaquetada, búsquedas y hash final.

### Bloque D. Compartir

- `src/features/sharing/ShareCard.tsx`
- `src/features/sharing/shareTemplates.ts`
- `src/features/sharing/createShareImage.ts`
- `src/features/sharing/shareActions.ts`
- `src/features/sharing/ShareComposer.tsx`
- `src/app/share.tsx`

Estado: **completado y listo para validación en dispositivo**.

- comparte tanto un versículo exacto como una reflexión local sin permitir editar su contenido;
- ofrece cuatro estilos procedurales accesibles, sin añadir archivos gráficos pesados al paquete;
- permite escoger formato cuadrado 1:1 o historia 9:16, alineación y tres escalas de texto;
- conserva siempre la referencia, la versión, la atribución editorial y la marca de Alienta;
- genera PNG de 1.080 px localmente: captura nativa en iOS y Android y Canvas en web;
- abre la hoja de compartir del sistema en dispositivos y descarga el PNG como alternativa web;
- permite copiar el texto con su referencia y marca sin alterar el original;
- incluye pruebas de texto largo, fuente adaptable, marca, atribución, nombres seguros y relaciones de aspecto.

### Bloque E. Supabase y cuenta opcional

- `src/core/api/supabase.ts`
- `src/core/auth/AuthProvider.tsx`
- `supabase/migrations/0001_profiles.sql`
- `supabase/migrations/0002_consents.sql`
- `supabase/tests/rls.sql`

La lectura y la reflexión básica continúan disponibles sin cuenta.

### Bloque F. IA

- `supabase/functions/generate-reflection/index.ts`
- `supabase/functions/generate-reflection/prompt.ts`
- `supabase/functions/generate-reflection/schema.ts`
- `supabase/functions/generate-reflection/safety.ts`
- `src/features/reflection/api.ts`
- `tests/evals/reflections.es-CO.json`

Puertas de calidad:

- ninguna cita inventada;
- resultado JSON válido;
- salida segura en casos de autolesión;
- no registrar texto sensible;
- límite por usuario/dispositivo;
- presupuesto máximo y reintentos controlados.

### Bloque G. Estudios

- `content/studies/es-CO/*.json`
- `src/features/studies/repository.ts`
- `src/features/studies/StudyPlanCard.tsx`
- `src/app/(tabs)/studies.tsx`

Cada plan tendrá autor/revisor, fecha y versión.

### Bloque H. Comunidad piloto

- migraciones de comunidades, miembros, publicaciones, reportes y bloqueos;
- reglas RLS;
- aceptación de normas;
- panel mínimo de moderación antes de habilitar publicaciones.

No se habilitará comunidad solo porque la interfaz exista.

## Etapa 4 — Pruebas y publicación

### Automatización mínima

En cada pull request:

```powershell
npm run typecheck
npm run lint
npm test
```

Antes de beta:

- pruebas en Android pequeño y grande;
- iPhone físico y al menos dos tamaños;
- texto máximo, modo oscuro y lector de pantalla;
- conexión lenta/sin conexión;
- borrado de cuenta y exportación;
- enlaces de privacidad, soporte y eliminación;
- revisión de secretos y dependencias;
- evaluación de 100+ escenarios de reflexión.

### Cuentas de publicación

1. Apple Developer Program: elegir individual u organización con conocimiento del nombre de vendedor y roles.
2. Google Play: elegir personal u organización; la elección y verificación deben coincidir con el propietario real.
3. Preparar la prueba cerrada de Google cuando aplique.
4. Usar EAS Build para binarios y EAS Submit para envío.
5. Publicar primero a grupos de prueba, nunca directamente a producción.

## Forma de colaboración recomendada

1. Crear un issue pequeño por función.
2. Crear una rama desde `main`.
3. Hacer commits breves y descriptivos.
4. Abrir pull request con capturas y pasos de prueba.
5. La otra persona revisa y aprueba.
6. Fusionar solo con verificaciones verdes.

No usar una rama `develop` para un equipo de dos; `main` protegida y ramas cortas son suficientes.

## Primer encuentro guiado

En el siguiente bloque de trabajo se hará exactamente esto:

1. confirmar las ocho decisiones de producto;
2. verificar herramientas instaladas;
3. conectar el repositorio local con GitHub;
4. generar el proyecto Expo;
5. ejecutar la pantalla inicial en un teléfono;
6. dejar el primer commit verificado.

No se necesita copiar manualmente todo el código: al trabajar en este repositorio, los archivos pueden generarse y verificarse aquí; se explicará cada uno y se mantendrá la secuencia documentada.
