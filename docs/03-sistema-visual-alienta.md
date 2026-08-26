# Sistema visual de Alienta

Estado: implementado en la rama de rediseño y pendiente de validación visual final en iPhone y web.

## Dirección creativa

Alienta se presenta como un **santuario contemporáneo**: sereno, editorial y cercano. La interfaz toma como principios la pausa, el espacio en blanco, la jerarquía tipográfica y las superficies suaves, pero conserva una identidad propia basada en verde pino, salvia y terracota.

No se reproducen marcas, logotipos, composiciones exactas ni activos de las referencias visuales. Las referencias se usan para identificar principios de diseño transferibles.

## Tipografía

| Uso | Familia | Motivo |
|---|---|---|
| Títulos, citas y versículos | Cormorant Garamond | Voz editorial, humana y contemplativa |
| Interfaz, navegación y texto funcional | Manrope | Lectura clara en tamaños pequeños y contraste moderno |

Los tamaños admiten el escalado del sistema. Los textos de interfaz no deben convertirse en imágenes.

## Paleta principal

### Modo claro

| Token | Color | Uso |
|---|---|---|
| Lino | `#F3EFE6` | Fondo general |
| Papel | `#FAF7F0` | Superficies |
| Papel elevado | `#FFFDF8` | Tarjetas principales |
| Pino | `#214E43` | Acción y marca |
| Salvia | `#DCE8E2` | Superficie suave |
| Terracota | `#B66F55` | Acento cálido |
| Tinta | `#17221E` | Texto principal |

### Modo oscuro

| Token | Color | Uso |
|---|---|---|
| Noche pino | `#0B1210` | Fondo general |
| Bosque profundo | `#111A17` | Superficies |
| Bosque elevado | `#18231F` | Tarjetas principales |
| Salvia luminosa | `#8BC5AE` | Acción y marca |
| Cobre suave | `#DE9A78` | Acento cálido |
| Marfil | `#F4F0E7` | Texto principal |

El modo oscuro no invierte los colores de manera automática: usa superficies, contornos y acentos definidos específicamente para baja luminosidad.

## Personalidad por sección

| Sección | Tono | Idea visual |
|---|---|---|
| Hoy | Verde pino | Respiro y acompañamiento |
| Biblia | Verde hoja | Lectura quieta y editorial |
| Estudios | Terracota | Camino, ritmo y progreso |
| Comunidad | Azul niebla | Cercanía, confianza y cuidado |
| Perfil | Ciruela gris | Preferencias personales y calma |

Los tonos secundarios ayudan a orientarse sin convertir cada sección en una aplicación diferente.

## Componentes base

- `AppText`: jerarquía tipográfica accesible.
- `AppButton`: acción principal con estados deshabilitado y presionado.
- `Screen`: ancho de lectura controlado en web y espacio seguro en móvil.
- `SectionHeader`: encabezado editorial con tono propio por sección.
- `EditorialActionCard`: tarjeta reutilizable para acciones o contenido.
- `PreviewNotice`: separa con honestidad una vista visual de una función terminada.
- `ThemeQuickToggle`: validación rápida de claro y oscuro.
- `AppIcon`: una única fuente de iconos con SF Symbols en iOS y Material Symbols en Android/web.
- `ScreenReveal`: transición no direccional que lleva cada sección suavemente a foco.

## Profundidad y movimiento

La profundidad se organiza en tres niveles: `soft`, `raised` y `floating`. En web se
representa con `boxShadow` y una luz interior sutil; en iOS usa sombras nativas y en
Android combina elevación con el color de sombra del tema.

El movimiento editorial evita desplazamientos decorativos entre pantallas:

- las secciones aparecen mediante una transición breve de enfoque, escala y opacidad;
- el icono activo de la navegación responde con un resorte amortiguado;
- las tarjetas de sentimientos elevan ligeramente su profundidad al seleccionarse;
- los elementos ambientales de los encabezados respiran de forma lenta y discreta;
- todas las animaciones ambientales o de transición se detienen si el sistema solicita
  reducir movimiento.

## Reglas de experiencia

1. Una acción primaria por bloque visual.
2. Ningún texto esencial sobre fondos fotográficos sin una capa de contraste verificada.
3. Áreas táctiles de al menos 48 puntos.
4. Las tarjetas no sustituyen la jerarquía: los títulos y el espacio deben guiar primero.
5. Animaciones breves, funcionales y opcionales; respetar reducir movimiento.
6. Las funciones aún no construidas se muestran como vistas previas, nunca como capacidades disponibles.

## Validación antes de aprobar el sistema

- iPhone físico en claro y oscuro;
- web a 390 px, 768 px y escritorio;
- texto del sistema al 200 %;
- VoiceOver o TalkBack en navegación y selector de apariencia;
- contraste de texto, controles y estados seleccionados;
- teclado abierto en el flujo “¿Cómo está tu corazón hoy?”.
