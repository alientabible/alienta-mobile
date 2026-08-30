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
3. `supabase/tests/rls.sql`

El tercer archivo no cambia datos; aborta si detecta RLS incompleto, privilegios anónimos o columnas sensibles inesperadas.

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

## 4. Confirmación de correo

Para la prueba inicial se puede mantener la confirmación de correo habilitada. Después de crear una cuenta, confirma el mensaje recibido y vuelve a **Perfil → Tu cuenta** para iniciar sesión.

Antes de publicar, configura el enlace profundo de confirmación para que el correo regrese directamente a Alienta. No se debe desactivar la confirmación en producción solo para evitar este paso.

## Alcance de privacidad

- `profiles` guarda únicamente identificador, nombre opcional, idioma y fechas.
- `user_consents` guarda una decisión versionada por propósito.
- `bible_sync` es solo una autorización preparada para el siguiente incremento; activarla todavía no sube lecturas.
- El texto libre de “cómo te sientes” no se guarda ni se sincroniza.
- La clave pública es segura en el cliente únicamente junto con RLS; la clave `service_role` nunca debe llegar a la app.

Las versiones `*-pilot-2026-08-30` identifican una prueba técnica. Antes de publicar se deben sustituir por textos legales revisados, versionados y accesibles desde la propia pantalla de registro.
