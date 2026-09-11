# Coldfood — landing page

Contexto para agentes de código (Claude Code, Cursor, etc.). Este archivo es la
fuente canónica: `CLAUDE.md` es un symlink a este mismo archivo, y Cursor lee
`AGENTS.md` de forma nativa — no dupliques este contenido en otro lado.

## Stack

- **Astro 7** (`output: 'static'`), **Tailwind v4** vía `@tailwindcss/vite` — **no** uses
  `@astrojs/tailwind` (deprecado) ni crees `tailwind.config.js` (Tailwind v4 se
  configura en CSS, ver `src/styles/global.css`).
- **Sin framework de UI** (no React/Vue/Svelte/Alpine). Los componentes son
  `.astro` puros; la interactividad mínima necesaria va en un `<script>` vanilla
  dentro del propio componente.
- **pnpm** (hay `pnpm-lock.yaml` y `pnpm-workspace.yaml`) — nunca `npm`/`yarn`.
  Node `>=22.12.0`.
- Alias de imports: `@/*` → `src/*` (definido en `tsconfig.json`).

## Desarrollo

Iniciar el servidor en modo background:

```
astro dev --background
```

Gestionar con `astro dev stop`, `astro dev status`, `astro dev logs`.

**Antes de dar por terminado cualquier cambio**, correr:

```
pnpm astro check
pnpm build
```

**Bug conocido**: si en `astro dev` las clases de Tailwind no se aplican
(elementos sin estilo o con tamaño nativo en vez del de la clase), es caché
corrupta del server, no un error real. Solución: `astro dev stop`, borrar
`.astro/` y `node_modules/.vite/`, volver a `astro dev --background`.

## Arquitectura

### SEO e i18n — no dupliques lo que ya existe

- `src/consts.ts` es la fuente única de verdad: `SITE` (dominio, nombre,
  locales), `BRAND` (colores fuera de Tailwind: theme-color, background),
  `SEO_DEFAULTS`, `OG_LOCALE_MAP`. Cambiar el dominio o la marca = editar solo
  este archivo.
- `src/components/SEO.astro` genera todo el `<head>` semántico (title,
  description, canonical, hreflang es/en/x-default, Open Graph, Twitter,
  theme-color). Pásale props vía `<Layout title=... description=...>` —
  **nunca** añadas `<meta>`/`<title>` sueltos en una página.
- `src/components/JsonLd.astro` — `Organization` + `WebSite` en `@graph`.
  Si se necesita `Product`/`LocalBusiness`, extender aquí, no crear otro
  componente JSON-LD.
- `@astrojs/sitemap` ya está configurado con soporte i18n — cualquier página
  nueva se incluye sola en el sitemap con sus alternates, no hay que tocar
  `astro.config.mjs`.
- `build.format: 'directory'` → todo link interno debe llevar slash final
  (`/productos/`, no `/productos`).

### i18n — usar siempre los helpers, nunca hardcodear rutas

`src/i18n/utils.ts`:
- `resolveLocale(Astro.currentLocale)` — locale activo con fallback a `es`.
- `useTranslations(locale)` → `t('clave')` — textos de UI, diccionario en
  `src/i18n/ui.ts` (añadir la clave en `es` y `en` a la vez).
- `getLocalizedPath(path, locale)` / `getLocalizedAbsoluteUrl(path, locale)` —
  construir URLs localizadas. **Nunca** concatenar `/en/` a mano.
- `getPathWithoutLocale(pathname, locale)` — necesario para reconstruir
  alternates/selector de idioma a partir de `Astro.url.pathname`, que ya trae
  el prefijo del locale activo.

Decisiones ya tomadas (no las cambies sin que el usuario lo pida):
- `es` es el locale por defecto sin prefijo (`/`), `en` va prefijado (`/en/`).
- El slug de ruta **no se traduce** entre idiomas: `/conocenos/` y
  `/en/conocenos/` (mismo segmento). Traducir slugs requeriría extender el
  sistema de i18n, fuera de alcance hasta que se pida explícitamente.
- Inicio, Conócenos, Productos y Contacto son **páginas separadas**, no anclas
  de una sola landing.
- El desplegable de Categorías del navbar enlaza a anclas dentro de
  `/productos/` (`/productos/#slug`), no a páginas propias por categoría.

### Paleta de color — `src/styles/global.css`

Tailwind v4 configurado en CSS con `@theme` (no hay `tailwind.config.js`).
Dos capas:

1. **Rampas crudas** (`green`, `gold`, `brown`, `clay`, `sand`, pasos 50–950)
   derivadas de los colores reales del logo y los empaques de Coldfood — no
   son arbitrarias, no las regeneres a ojo.
2. **Tokens semánticos** (`canvas`, `surface`, `ink`, `ink-muted`, `primary`,
   `link`, `accent`, `accent-ink`, `cta`, `focus`, etc.) — **usar estos en los
   componentes**, no los pasos de rampa directamente.

Reglas de accesibilidad ya auditadas contra WCAG (comentadas en el propio
archivo — leerlas antes de introducir un color nuevo):
- `gold-50…400` y `sand-100…500` **nunca** como color de texto (no llegan a
  4.5:1 de contraste).
- Nunca texto blanco sobre `accent` (gold-400) — usar `text-ink`.
- El foco nunca se suprime (`:focus-visible` global ya definido).

`BRAND.themeColor`/`BRAND.backgroundColor` en `consts.ts`, los tokens
`--color-canvas`/`--color-primary` en `global.css`, y las constantes
`CANVAS`/`THEME_COLOR_HEX` en `scripts/generate-brand-assets.mjs` deben
coincidir siempre. Si cambia la marca, actualizar los tres.

### Recursos de marca (favicons, OG image)

- `src/brand/logo-source.png` es el **único** archivo fuente. Hoy es un
  placeholder de baja resolución (218×196px); cuando llegue el logo en alta
  resolución, reemplazar ese archivo y correr:
  ```
  pnpm gen:assets
  ```
  Esto regenera automáticamente `favicon.ico`, `favicon-96.png`,
  `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `og-image.jpg` y
  `site.webmanifest`. **Nunca editar a mano los archivos generados en
  `public/`** — se pierden en el siguiente `gen:assets`.
- El script detecta automáticamente dónde termina el isotipo (papa+hojas) y
  empieza el wordmark por heurística de color, no por un pixel fijo — no
  hardcodear alturas de recorte si se toca ese script.

### Datos de producto

- `src/data/categories.ts` — las 8 categorías oficiales (slug + nombre es/en),
  verificadas contra el catálogo real del cliente (Canva ES/EN), no
  traducidas a mano. Cuando se construya el JSON completo de productos, cada
  producto debe referenciar uno de estos `slug` en un campo `categorySlug`
  para que el navbar y el catálogo compartan la misma fuente de categorías.

### Componentes de UI

- `src/layouts/Layout.astro` monta `<Header />` automáticamente después de
  `<body>` — las páginas nuevas no necesitan importarlo.
- `src/components/Header.astro` — el desplegable de Categorías y el menú
  móvil usan `<details>/<summary>` nativos, no un dropdown a base de JS
  propio. Es accesible por teclado sin gestionar `aria-expanded` a mano y
  funciona sin JavaScript; el único `<script>` es una mejora progresiva
  (cierra al hacer click afuera / Escape). Mantener este patrón para
  cualquier otro desplegable/acordeón que se agregue, salvo que haya una
  razón concreta para no hacerlo.

## Documentación de Astro

Consultar antes de tareas relacionadas:

- [Rutas, rutas dinámicas y middleware](https://docs.astro.build/en/guides/routing/)
- [Componentes de Astro](https://docs.astro.build/en/basics/astro-components/)
- [Componentes de framework (React/Vue/Svelte)](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Estilos y Tailwind](https://docs.astro.build/en/guides/styling/)
- [Internacionalización](https://docs.astro.build/en/guides/internationalization/)
- [`astro:assets` / `<Image>`](https://docs.astro.build/en/guides/images/)
