# Alienta: análisis de producto, MVP y arquitectura

Fecha de revisión: 15 de agosto de 2026  
Nombre de trabajo: **Alienta — Biblia y Comunidad**

> Este documento es orientación de producto y tecnología, no asesoría jurídica. Antes de una publicación mundial se necesita una revisión legal por jurisdicción y una revisión formal de cada licencia bíblica.

## 1. Conclusión ejecutiva

La idea tiene una propuesta de valor fuerte: ayudar a una persona a pasar de “así me siento” a una lectura bíblica comprensible, una reflexión prudente y una oración, dentro de una experiencia muy sencilla. Esa promesa es más clara y defendible que lanzar inicialmente otra red social generalista.

El mayor riesgo no es técnico. Es combinar desde el primer día:

- texto bíblico con derechos distintos por versión y territorio;
- información que puede revelar salud mental y convicciones religiosas;
- generación por IA en situaciones de duelo, abuso o autolesión;
- contenido publicado por usuarios y menores de edad;
- moderación en muchos idiomas y países.

Por eso, el producto debe construirse en capas. La primera versión debe resolver muy bien la reflexión personal, la Biblia y el compartir; las comunidades deben comenzar como piloto cerrado y la cronología pública debe esperar hasta que exista una operación real de moderación.

## 2. Promesa central

**“Cuéntanos cómo estás y encuentra una palabra bíblica fiel, explicada con sencillez y acompañada de una oración.”**

Principios:

1. La Biblia es la fuente; la IA solo explica y estructura.
2. La app acompaña espiritualmente, pero no diagnostica, trata ni reemplaza a un profesional, pastor o servicio de emergencia.
3. Leer la Biblia no exige una cuenta.
4. Los sentimientos escritos son privados y efímeros de forma predeterminada.
5. La simplicidad y la accesibilidad son requisitos, no mejoras posteriores.
6. La postura doctrinal y el canon se muestran con transparencia.

## 3. Usuarios iniciales

### Persona primaria

Adulto hispanohablante que quiere orientación bíblica breve ante ansiedad, tristeza, gratitud, soledad, conflicto, esperanza, culpa o duelo. Puede tener poca experiencia tecnológica.

### Personas secundarias

- lector habitual que quiere una Biblia clara, buscador, marcadores y planes;
- líder de una iglesia o comunidad que quiere acompañar a un grupo;
- persona que comparte versículos en WhatsApp, Instagram u otras redes;
- adulto mayor que necesita texto grande, poco ruido y navegación predecible.

### Menores

La lectura sin cuenta puede ser accesible a cualquier edad. Para el MVP, la creación de contenido, comentarios y comunidades debe restringirse a mayores de 18 años. Incluir menores en funciones sociales exige consentimiento, protección, moderación y diseño por edad diferentes en cada país; se evaluará como producto separado.

## 4. Alcance recomendado del MVP

### Incluido

| Área | Función mínima |
|---|---|
| Inicio | Pregunta “¿Cómo te sientes hoy?”, emociones rápidas y texto opcional |
| Reflexión | 1–3 versículos, explicación sencilla, acción práctica y oración |
| Seguridad | detección de crisis, salida segura y recursos de ayuda por país |
| Biblia | Reina-Valera 1909 completa, lectura sin conexión, búsqueda, tamaño de texto, favoritos y progreso |
| Compartir | tarjeta PNG con fondo curado, referencia, atribución y marca de agua de Alienta |
| Estudio | 2 o 3 planes editoriales de 7 días con preguntas y progreso |
| Cuenta | opcional; correo con enlace de acceso para sincronizar favoritos y progreso |
| Idioma | interfaz en español desde el inicio; infraestructura lista para inglés, portugués y RTL |
| Comunidad | un piloto cerrado, por invitación, solo texto, con líderes verificados manualmente |
| Moderación | aceptar reglas, reportar, bloquear, cola de revisión y contacto visible |

### Excluido del primer lanzamiento público

- cronología mundial tipo X/Twitter;
- mensajes privados;
- grupos creados automáticamente sin revisión;
- publicación social para menores;
- transmisión en vivo, audio o video de usuarios;
- comentarios anónimos;
- generación libre de imágenes por IA en cada solicitud;
- una versión bíblica cuya licencia no esté documentada;
- “todos los idiomas” simultáneamente;
- consejos médicos, diagnósticos o promesas de curación.

### Motivo

El MVP no es una maqueta pequeña de todas las ideas. Es la versión mínima que demuestra la hipótesis principal: **las personas regresan porque una reflexión bíblica, segura y bien fundamentada les ayuda en su día**.

## 5. Experiencia principal

### Flujo de reflexión

1. La pantalla abre directamente en “¿Cómo te sientes hoy?”.
2. Hay opciones grandes: Triste, Ansioso, Agradecido, Solo, Esperanzado, Abrumado y “Otra cosa”.
3. El texto adicional es opcional. La app explica antes de enviarlo si será procesado por IA y si se guardará o no.
4. Se muestran una respiración o transición suave mientras se prepara la respuesta.
5. La respuesta tiene cuatro bloques fijos:
   - “Una palabra para hoy”;
   - texto y referencia bíblica;
   - explicación en lenguaje sencillo;
   - oración breve y una acción concreta.
6. Acciones: “Me ayudó”, “No me ayudó”, “Guardar” y “Compartir”.
7. Si se detecta riesgo urgente, la experiencia cambia: prioriza seguridad, contacto humano y recursos locales. Nunca responde únicamente con un versículo.

### Flujo de Biblia

1. Última lectura o selector Libro → capítulo.
2. Texto de alto contraste y tamaño regulable.
3. Pulsación sobre versículo: seleccionar, guardar, compartir o copiar con atribución.
4. Búsqueda local por palabra o referencia.
5. Sin cuenta y sin conexión para la versión descargada.

### Flujo de compartir

1. Elegir entre 4–6 plantillas accesibles.
2. Ajustar fondo, alineación y tamaño; no editar el texto del versículo.
3. Generar la imagen en el dispositivo.
4. Abrir la hoja de compartir del sistema. Esto permite usar las apps instaladas sin pedir permisos de cada red social.
5. La tarjeta incluye marca de agua discreta, versión bíblica y referencia. Las reglas de la licencia determinan si el texto puede compartirse.

## 6. IA: arquitectura segura y fiel al texto

La IA no debe elegir y citar versículos desde su memoria. El sistema debe usar recuperación controlada.

### Canal propuesto

1. **Entrada mínima:** idioma, emoción seleccionada y texto opcional.
2. **Moderación previa:** detectar autolesión, amenaza, abuso, odio o contenido sexual que requiera otro flujo.
3. **Clasificación estructurada:** emoción, intensidad, temas y si hay riesgo. No emitir un diagnóstico.
4. **Recuperación bíblica:** seleccionar referencias desde un mapa editorial `tema → pasajes` y recuperar el texto exacto desde la base licenciada.
5. **Generación fundamentada:** la IA recibe únicamente los pasajes aprobados, tono, idioma y esquema de salida. Se le prohíbe alterar citas o inventar referencias.
6. **Validación:** el servidor compara referencias y texto con la base de datos antes de devolver la respuesta.
7. **Moderación posterior:** revisar explicación y oración.
8. **Privacidad:** no guardar el texto original salvo consentimiento independiente y explícito.
9. **Evaluación humana:** un comité pastoral/editorial revisa un conjunto de respuestas por tema e idioma antes de cada lanzamiento.

### Respuesta estructurada

La función de IA devolverá JSON validado, no HTML libre:

```json
{
  "tone": "calm",
  "title": "No tienes que cargar todo a solas",
  "passages": [
    { "verseId": "spaRV1909.PSA.55.22", "reason": "..." }
  ],
  "reflection": "...",
  "prayer": "...",
  "nextStep": "...",
  "safetyLevel": "standard"
}
```

El cliente obtiene el texto bíblico por `verseId`. Así, ni el modelo ni una traducción automática modifican la Escritura.

### Crisis y salud mental

- No usar frases como “la Biblia curará tu depresión”.
- Mostrar que la reflexión fue generada con IA y puede equivocarse.
- Cuando haya intención de autolesión o peligro inmediato: mensaje empático, llamada a emergencias/servicio local, contacto con una persona de confianza y opción de seguir leyendo solo después de mostrar ayuda.
- Los teléfonos y recursos se mantienen en una tabla editorial por país; nunca se dejan codificados en el prompt.
- Diseñar y probar este flujo con un profesional de salud mental y un responsable pastoral.
- No emplear estos datos para publicidad ni segmentación.

### Proveedor

La implementación tendrá una interfaz `AiReflectionProvider`, de manera que el proveedor pueda cambiarse. Si se usa OpenAI, se recomienda empezar evaluando un modelo económico multilingüe para la clasificación y un modelo equilibrado para la redacción final. Las llamadas se hacen desde el servidor con `store: false`; la clave nunca vive en la app.

La documentación de OpenAI indica que los datos de API no se usan para entrenamiento salvo adhesión voluntaria, pero por defecto pueden existir registros de monitorización de abuso hasta por 30 días. Esto debe reflejarse en el consentimiento, el inventario de encargados y la política de privacidad.

## 7. Biblias, canon y licencias

### Primeras versiones propuestas

- Español: **Reina-Valera 1909**, marcada por eBible.org como dominio público.
- Inglés: **World English Bible**, cuyo texto está dedicado al dominio público; el nombre es una marca y no debe conservarse si se altera el texto.

Antes de importar se guardará una copia de la página de licencia, fecha de descarga y hash de cada archivo. “Dominio público” debe confirmarse para los territorios de distribución; no basta con encontrar un JSON en GitHub.

### Registro obligatorio por versión

Cada traducción tendrá un manifiesto:

```ts
type BibleLicense = {
  versionId: string;
  displayName: string;
  languageTag: string;
  canon: 'protestant-66' | 'catholic-73' | 'orthodox' | 'custom';
  rightsHolder: string | null;
  licenseName: string;
  licenseUrl: string;
  attribution: string;
  allowsOffline: boolean;
  allowsCommercialUse: boolean;
  allowsDerivativeWorks: boolean;
  shareQuoteLimit: number | null;
  allowedTerritories: string[] | 'worldwide';
  effectiveFrom: string;
  expiresAt: string | null;
  sourceSha256: string;
};
```

El código de compartir consulta este registro. Una futura NVI, RVR60, ESV u otra versión con licencia se integra sin cambiar la aplicación, solo al añadir contenido y reglas autorizadas.

### Neutralidad y tradición

El onboarding debe permitir escoger tradición/canon cuando existan varias opciones, sin declarar que una es “la correcta”. Las explicaciones deben separar claramente:

- texto bíblico;
- reflexión generada;
- notas editoriales;
- contenido de una denominación o comunidad concreta.

## 8. Estudio bíblico

Para el MVP conviene contenido editorial, no un tutor libre por IA.

Formato de un plan de 7 días:

- propósito y nivel;
- pasaje del día;
- contexto breve;
- 2 preguntas de observación;
- 1 pregunta de aplicación;
- oración;
- progreso local/sincronizado.

Planes iniciales sugeridos:

1. Paz en medio de la ansiedad.
2. Gratitud cotidiana.
3. Volver a empezar.

Después se puede añadir conversación con IA, siempre recuperando únicamente el material del plan y pasajes licenciados.

## 9. Comunidad y cronología

### Piloto de comunidades

- creación solo por solicitud;
- verificación manual de identidad y relación con una organización/comunidad;
- aceptación de código de conducta;
- roles: miembro, líder, moderador y administrador;
- grupos privados o visibles pero con ingreso aprobado;
- publicaciones y comentarios solo de texto en la primera etapa;
- reportar publicación/comentario/usuario, bloquear usuario y abandonar grupo;
- sin mensajes directos;
- cola de moderación y registro de decisiones.

“Líder verificado” significa que Alienta verificó identidad y documentación definida, no que garantiza toda afirmación teológica de esa persona.

### Cronología pública posterior

Antes de habilitarla se necesita:

- moderación automática y humana en cada idioma habilitado;
- tiempos de respuesta y turnos de responsables;
- términos, normas comunitarias y proceso de apelación;
- protección contra spam, acoso, explotación sexual y suplantación;
- limitación de frecuencia y reputación de cuentas;
- proceso de denuncias de propiedad intelectual;
- métricas de incidentes y plan de retirada urgente.

## 10. Idiomas e internacionalización

“Todos los idiomas” debe significar **arquitectura abierta a idiomas**, no un lanzamiento simultáneo.

Orden recomendado:

1. `es-CO` y español neutral, con Reina-Valera 1909.
2. `en` con World English Bible.
3. `pt-BR`, sujeto a una Biblia y moderación licenciadas.
4. Idiomas adicionales según demanda, recursos editoriales y capacidad de moderación.

Requisitos desde el primer commit:

- textos de interfaz fuera de los componentes;
- etiquetas BCP 47 (`es-CO`, `en-US`, `pt-BR`);
- pluralización y formatos mediante ICU;
- diseño compatible con texto 30–50 % más largo;
- dirección derecha-a-izquierda preparada;
- fuentes con cobertura suficiente;
- prompts, taxonomías, crisis y pruebas por idioma;
- no traducir una versión bíblica automáticamente.

## 11. Diseño y accesibilidad

### Lenguaje visual

- fondo cálido y limpio, mucho espacio y una sola acción primaria por pantalla;
- paleta serena con contraste AA;
- tipografía del sistema para la interfaz y una serif muy legible opcional para la Biblia;
- barra inferior con máximo cinco destinos: Hoy, Biblia, Estudios, Comunidad y Perfil;
- icono acompañado de texto; el color nunca será la única señal.

### Para adultos mayores

- cuerpo base equivalente a 17 pt y compatibilidad con tamaño del sistema;
- soporte de aumento hasta 200 % sin perder funciones;
- áreas táctiles grandes (objetivo interno: 48 × 48 dp o más);
- párrafos cortos, interlineado generoso y sin texto sobre fondos complejos;
- sin gestos ocultos obligatorios;
- lector de pantalla, orden de foco y etiquetas accesibles;
- alto contraste y modo oscuro;
- “Reducir movimiento” respetado.

### Movimiento

- transiciones de 150–250 ms, suaves y con propósito;
- entrada por capas de la reflexión, no animaciones continuas;
- microrespuesta háptica al guardar o completar un día;
- esqueletos de carga sin parpadeo;
- variante sin desplazamientos o escalado cuando el sistema pide reducir movimiento.

## 12. Arquitectura técnica recomendada

### Cliente

- Expo + React Native + TypeScript;
- Expo Router para rutas por archivos;
- React Native Reanimated para movimiento;
- `expo-sqlite` para Biblia, búsqueda y progreso sin conexión;
- TanStack Query para estado remoto;
- i18next/ICU para localización;
- Zod para validar datos de servidor e IA;
- `react-native-view-shot` + `expo-sharing` para tarjetas sociales.

Expo permite desarrollar en Windows, Android, iOS físico y web. EAS Build compila iOS en macOS remoto y EAS Submit permite enviar binarios desde Windows. Un Mac sigue siendo conveniente para el simulador, depuración nativa y contingencias, pero no es obligatorio para comenzar.

### Servidor

Supabase aporta:

- Postgres;
- autenticación;
- Row Level Security;
- almacenamiento;
- tiempo real;
- Edge Functions para IA y moderación.

Las claves del proveedor de IA viven únicamente en secretos del servidor. Las políticas RLS son parte de cada migración y se prueban como código.

### Datos bíblicos

- paquete SQLite por versión/idioma;
- descarga inicial o inclusión de la versión principal;
- índice FTS para búsqueda;
- tabla canónica de libros y alias por idioma;
- hash y manifiesto de licencia por paquete;
- actualizaciones de contenido versionadas separadamente del binario.

### Estructura prevista

```text
Alienta_ Biblia y Comunidad/
├─ src/
│  ├─ app/
│  │  ├─ _layout.tsx
│  │  ├─ (tabs)/
│  │  │  ├─ _layout.tsx
│  │  │  ├─ index.tsx
│  │  │  ├─ bible.tsx
│  │  │  ├─ studies.tsx
│  │  │  ├─ communities.tsx
│  │  │  └─ profile.tsx
│  │  └─ reflection/[id].tsx
│  ├─ components/
│  ├─ features/
│  │  ├─ check-in/
│  │  ├─ reflection/
│  │  ├─ bible/
│  │  ├─ sharing/
│  │  ├─ studies/
│  │  └─ community/
│  ├─ core/
│  │  ├─ api/
│  │  ├─ auth/
│  │  ├─ database/
│  │  ├─ privacy/
│  │  └─ telemetry/
│  ├─ i18n/
│  │  └─ locales/es-CO.json
│  └─ theme/
├─ assets/
│  ├─ bible/
│  └─ share-backgrounds/
├─ scripts/
│  └─ import-bible/
├─ supabase/
│  ├─ functions/generate-reflection/
│  ├─ functions/moderate-content/
│  └─ migrations/
├─ docs/
├─ .env.example
├─ app.config.ts
├─ eas.json
├─ package.json
└─ tsconfig.json
```

No se necesita un monorepo todavía. Cuando exista un panel administrativo web, podrá añadirse `apps/admin` sin hacer más compleja la primera etapa.

## 13. Modelo de datos de alto nivel

### Cuenta y privacidad

- `profiles`
- `user_consents`
- `data_export_requests`
- `account_deletion_requests`
- `user_blocks`

### Reflexión

- `emotion_taxonomy`
- `verse_topics`
- `reflection_feedback`
- `saved_reflections`

No habrá una tabla de textos emocionales sin una decisión explícita de producto y consentimiento. Se puede guardar el resultado sin conservar la entrada.

### Estudio

- `study_plans`
- `study_days`
- `study_progress`

### Comunidad

- `communities`
- `community_members`
- `leader_applications`
- `posts`
- `comments`
- `reactions`
- `reports`
- `moderation_decisions`
- `appeals`

Todas las tablas de usuario tendrán RLS, borrado lógico donde sea necesario para investigación y un calendario explícito de retención.

## 14. Seguridad y privacidad

### Datos especialmente delicados

La frase escrita bajo “¿Cómo te sientes?” puede revelar:

- salud física o mental;
- convicciones religiosas;
- orientación sexual;
- abuso o violencia;
- identidad de terceros.

Esto exige privacidad por diseño:

- procesar sin cuenta cuando sea posible;
- separar identidad y contenido;
- cifrado en tránsito y en reposo;
- no incluir texto sensible en logs, analítica, crash reports ni notificaciones;
- consentimiento granular para historial/sincronización;
- botón para eliminar cuenta y datos en la app;
- URL pública para solicitar borrado en Google Play;
- exportación y corrección de datos;
- vencimiento de sesiones, MFA para administradores y mínimos privilegios;
- revisión de dependencias y secretos;
- copias de seguridad probadas;
- plan de incidentes y canal de privacidad.

### Moderación de usuarios

Apple exige para UGC filtrado, reporte, bloqueo y contacto publicado. Google exige reglas aceptadas, moderación robusta, reporte dentro de la app y bloqueo. Estos mecanismos deben existir antes del primer usuario comunitario, no como parche después de publicar.

### Eliminación de cuentas

Si se crea una cuenta, Apple requiere borrado desde la app. Google exige además una ruta web donde se pueda solicitar el borrado y declarar el tratamiento en Data Safety.

## 15. Países y tiendas: matriz inicial

### Colombia

La Ley 1581 y la SIC tratan salud y convicciones religiosas como datos sensibles. El tratamiento normalmente requiere autorización previa, expresa e informada, finalidades claras, política de tratamiento y medios para ejercer derechos. El texto emocional no debe guardarse automáticamente.

### Unión Europea / EEE

- GDPR: creencias religiosas y salud son categorías especiales; se necesita una base válida y, para este diseño, normalmente consentimiento explícito y separado.
- DSA: una plataforma comunitaria necesita reporte de contenido ilegal, decisiones informadas, apelación y protección reforzada para menores.
- AI Act: desde el 2 de agosto de 2026 aplican obligaciones de transparencia para determinadas interacciones con IA. La app debe indicar claramente que la reflexión es generada por IA y etiquetar el contenido cuando corresponda.

### Estados Unidos

- COPPA aplica a servicios dirigidos a menores de 13 años que recogen datos personales o cuando existe conocimiento de esa recolección.
- Para el MVP se evita la cuenta social de menores; la lectura puede seguir siendo anónima.
- Antes de ofrecer funciones de bienestar mental se revisarán las obligaciones federales y estatales aplicables; la app no se presentará como producto médico.

### Brasil

La LGPD clasifica convicción religiosa y salud como datos sensibles y exige una hipótesis legal específica; cuando se use consentimiento debe ser específico, destacado y para finalidades determinadas. Los menores necesitan un tratamiento reforzado.

### Apple App Store

- programa de desarrolladores: USD 99 al año;
- política de privacidad accesible en ficha y app;
- borrado de cuenta dentro de la app;
- moderación completa para UGC;
- revisión adicional si se hacen afirmaciones médicas;
- cuestionario de privacidad, clasificación por edad y datos de contacto.

### Google Play

- registro de distribución completa: USD 25 una vez;
- una cuenta personal nueva debe hacer prueba cerrada con al menos 12 personas durante 14 días continuos antes de solicitar producción;
- formulario Data Safety y declaración de salud, incluso para certificar que no hay funciones de salud;
- URL y función interna de borrado de cuenta;
- política específica para contenido generado por IA y UGC.

### Estrategia de expansión

No se activa un país solo por traducir la interfaz. Cada expansión necesita:

1. licencia bíblica por territorio;
2. política y consentimiento localizados;
3. recursos de crisis verificados;
4. moderación en el idioma;
5. edad mínima y consentimiento parental;
6. revisión fiscal/comercial si hay pagos;
7. ficha de tienda y soporte localizados.

## 16. Costos

Valores en USD, sin impuestos, conversión de moneda ni honorarios profesionales.

### Prototipo sin publicar

| Servicio | Costo inicial recomendado |
|---|---:|
| GitHub Free, repositorio privado con 2 colaboradores | $0 |
| VS Code, Node.js, Git, Android Studio | $0 |
| Expo/EAS Free | $0 dentro de sus límites |
| Supabase Free | $0 dentro de sus límites |
| Biblia de dominio público | $0, conservando pruebas de licencia |
| IA | se puede usar respuesta simulada al inicio; luego consumo variable |

### Publicación y beta real

| Concepto | Referencia |
|---|---:|
| Apple Developer Program | $99/año |
| Google Play, distribución completa | $25 una vez |
| Dominio | estimación $10–25/año |
| Expo Starter opcional | $19/mes |
| Supabase Pro recomendado para producción | desde $25/mes |
| IA | variable por modelo, longitud y número de reflexiones |
| Revisión legal, pastoral y de salud | cotización profesional |
| Moderación humana | costo operativo desde el primer piloto social |

Con la tarifa mostrada por OpenAI el 15 de agosto de 2026, 5.000 reflexiones mensuales de aproximadamente 1.500 tokens de entrada y 500 de salida costarían cerca de $4,50 con GPT-5.6 Luna o $45 con GPT-5.6 Terra, antes de caché, reintentos e impuestos. Es una estimación de planeación, no una cotización; se configurarán límites de gasto por proyecto.

Un lanzamiento técnico pequeño puede operar alrededor de **$44/mes + IA + dominio** usando Expo Starter y Supabase Pro. El costo importante que no debe subestimarse es la moderación humana, no el servidor.

## 17. Roadmap realista para dos personas

El tiempo depende de experiencia y disponibilidad. Para un equipo pequeño a tiempo parcial, un MVP seguro suele requerir 3–6 meses.

### Fase 0 — 1 a 2 semanas

- entidad/propiedad, nombre de trabajo y cuentas;
- entrevistas breves con usuarios;
- postura doctrinal y canon;
- mapa de datos y consentimiento;
- wireframes y prototipo de cinco pantallas.

### Fase 1 — 3 a 5 semanas

- proyecto Expo, diseño y navegación;
- Biblia local RVR1909;
- lector, búsqueda, favoritos y accesibilidad;
- pruebas automáticas básicas.

### Fase 2 — 3 a 4 semanas

- clasificación, recuperación y reflexión por IA;
- flujos de crisis;
- tarjetas sociales;
- dos planes bíblicos.

### Fase 3 — 2 a 4 semanas

- bienvenida inicial omitible y preferencias locales;
- cuentas opcionales y sincronización;
- privacidad, exportación y borrado;
- analítica sin texto sensible;
- pruebas de seguridad, accesibilidad e idiomas.

### Fase 4 — 2 a 4 semanas

- 12+ testers de Android cuando aplique;
- TestFlight;
- revisión editorial y legal;
- fichas, capturas, Data Safety y App Privacy;
- lanzamiento limitado en Colombia.

### Fase 5 — después de validar retención

- comunidades cerradas;
- panel de moderación;
- inglés y segundo paquete bíblico;
- cronología pública solo cuando la operación de seguridad esté lista.

## 18. Decisiones que deben cerrarse antes de escribir el núcleo

1. **Propietario legal:** persona o entidad. Para dos colaboradores y continuidad, se recomienda entidad/organización si ya existe; no crearla solo por tecnología sin asesoría contable.
2. **Audiencia social inicial:** propuesta: 18+; lectura anónima para todos.
3. **Tradición inicial:** propuesta: canon protestante de 66 libros con etiqueta transparente; añadir otros cánones después.
4. **País de piloto:** propuesta: Colombia.
5. **Idiomas de v1:** propuesta: solo español; código preparado para más.
6. **Historial emocional:** propuesta: apagado por defecto, con guardado explícito.
7. **Comunidad:** propuesta: piloto privado, sin mensajes directos.
8. **Nombre:** usar “Alienta” como nombre de trabajo hasta una búsqueda marcaria y de disponibilidad en tiendas.

## 19. Métricas para saber si funciona

### Valor

- porcentaje que completa su primera reflexión;
- “Me ayudó / No me ayudó” por tema e idioma;
- porcentaje que abre el pasaje completo;
- guardados y compartidos;
- retención D1, D7 y D30;
- finalización de planes.

### Seguridad

- respuestas con cita no verificable: objetivo 0;
- tiempo de respuesta a reportes;
- tasa de bloqueo y reportes por 1.000 publicaciones;
- falsos negativos/positivos en pruebas de crisis;
- incidentes de exposición de texto sensible: objetivo 0;
- solicitudes de borrado completadas dentro del plazo definido.

No optimizar tiempo de pantalla ni rachas agresivas. El objetivo es utilidad y hábito saludable, no dependencia.

## 20. Fuentes oficiales revisadas

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple Developer Program](https://developer.apple.com/programs/)
- [Apple Human Interface Guidelines — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/)
- [Google Play — User-generated content](https://support.google.com/googleplay/android-developer/answer/9876937)
- [Google Play — Account deletion](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Google Play — AI-generated content](https://support.google.com/googleplay/android-developer/answer/14094294)
- [Google Play — Health Content and Services](https://support.google.com/googleplay/android-developer/answer/16679511)
- [Google Play — Testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [European Commission — GDPR and special categories](https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en)
- [European Commission — Digital Services Act](https://commission.europa.eu/news-and-media/news/new-rules-protect-your-rights-and-activity-online-eu-2024-02-16_en)
- [European Commission — AI Act transparency](https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems)
- [SIC Colombia — Políticas de tratamiento](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/politicas-de-tratamiento-de-datos-personales)
- [Brasil — Lei 13.709 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
- [FTC — COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [eBible — Reina-Valera 1909](https://ebible.org/spaRV1909/copyright.htm)
- [eBible — World English Bible](https://ebible.org/eng-web/copr.htm)
- [Expo — EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo — Enviar a tiendas desde cualquier sistema](https://docs.expo.dev/deploy/submit-to-app-stores/)
- [Supabase Pricing](https://supabase.com/pricing)
- [GitHub Pricing](https://github.com/pricing)
- [OpenAI Docs — modelos y precios](https://developers.openai.com/api/docs/models)
- [OpenAI Docs — moderación](https://developers.openai.com/api/reference/resources/moderations)
- [OpenAI Docs — controles de datos](https://developers.openai.com/api/docs/guides/your-data)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
