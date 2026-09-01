# Configuración de Supabase para la cuenta opcional

Este bloque añade autenticación por correo y consentimiento granular, pero conserva el modo invitado. Si faltan variables o Supabase no responde, la Biblia, los favoritos, la última lectura y la reflexión local siguen funcionando en el dispositivo.

Referencias técnicas: [inicio de autenticación para React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) y [variables de entorno de Expo](https://docs.expo.dev/guides/environment-variables/).

## 1. Crear el proyecto

1. Crea un proyecto en Supabase.
2. En **Project Settings → API**, copia la URL del proyecto y la clave pública `publishable`.
3. Nunca copies la clave `service_role` dentro de Expo: cualquier variable `EXPO_PUBLIC_*` queda incluida en la aplicación cliente.

## 2. Aplicar el esquema

Ejecuta en orden, desde el SQL Editor:

1. `supabase/migrations/0001_profiles.sql`
2. `supabase/migrations/0002_consents.sql`
3. `supabase/migrations/0003_bible_sync.sql`
4. `supabase/tests/rls.sql`

El cuarto archivo no cambia datos; aborta si detecta RLS incompleto, privilegios anónimos o columnas sensibles inesperadas.

## 3. Configurar Expo

Copia `.env.example` como `.env.local` y reemplaza ambos valores:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REEMPLAZAR
```

Instala las dependencias y reinicia Metro para que Expo vuelva a incluir las variables:

```bash
npm install
npx expo start --tunnel --go --clear
```

## 4. Configurar los retornos de autenticación

En **Authentication → URL Configuration** cambia el `Site URL` que viene en
`localhost:3000` por la URL web activa de Alienta. Agrega también estas Redirect URLs:

```text
alienta://**
exp://**
http://localhost:8081/**
https://TU_CODESPACE-8081.app.github.dev/**
```

`exp://**` se usa únicamente durante las pruebas con Expo Go y debe retirarse al
publicar. En producción conserva la dirección exacta de la web oficial y
`alienta://auth/callback`; evita comodines amplios.

La aplicación envía una dirección de retorno distinta según dónde se ejecute:

- web: `https://.../auth/callback`;
- Expo Go: `exp://.../--/auth/callback`;
- compilación instalada: `alienta://auth/callback`.

Si se dispone de una web estable, puede fijarse la URL completa en `.env.local`:

```dotenv
EXPO_PUBLIC_AUTH_REDIRECT_URL=https://alienta.app/auth/callback
```

Déjala vacía mientras se quiera que cada plataforma vuelva a sí misma.

Mantén la confirmación de correo habilitada. La ruta `auth/callback` elimina los
tokens de la barra del navegador después de crear la sesión y muestra un estado
propio de Alienta. Si se personalizan las plantillas de correo, comprueba que
utilicen `{{ .RedirectTo }}` para respetar la dirección enviada por la app.

## 5. Recuperación de contraseña

Desde **Perfil → Tu cuenta → Olvidé mi contraseña**, Alienta llama a
`resetPasswordForEmail` con la misma ruta de retorno. El enlace abre una pantalla
pública que restaura temporalmente la sesión, solicita dos veces la contraseña
nueva y la guarda mediante `updateUser`.

Por seguridad, el formulario nunca informa si un correo está registrado. El
servicio de correo de prueba de Supabase tiene una cuota reducida; para producción
se debe configurar SMTP propio.

## Alcance de privacidad

- `profiles` guarda únicamente identificador, nombre opcional, idioma y fechas.
- `user_consents` guarda una decisión versionada por propósito.
- `bible_reading_progress` guarda únicamente versión, libro, capítulo y versículo.
- `bible_favorites` guarda la referencia y su estado; `favorited=false` conserva la retirada para resolver cambios entre dispositivos.
- Ninguna tabla remota guarda el contenido textual de los versículos.
- El tamaño de texto continúa siendo una preferencia local de cada dispositivo.
- Las políticas RLS bloquean estas tablas si no existe un consentimiento `bible_sync` vigente.
- `bible_sync` sigue siendo la autorización explícita: sin ese permiso el cliente no lee ni escribe estas tablas y conserva el funcionamiento local.
- Con permiso activo, el cliente reconcilia al iniciar, al volver al primer plano, después de un cambio local y cada 30 segundos mientras permanece abierto.
- El tamaño de texto y el contenido bíblico siguen siendo exclusivamente locales.
- El texto libre de “cómo te sientes” no se guarda ni se sincroniza.
- La clave pública es segura en el cliente únicamente junto con RLS; la clave `service_role` nunca debe llegar a la app.

Las versiones `*-pilot-2026-08-30` identifican una prueba técnica. Antes de publicar se deben sustituir por textos legales revisados, versionados y accesibles desde la propia pantalla de registro.
