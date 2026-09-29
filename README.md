# Coldfood — landing page

Sitio institucional y catálogo de producto de **Coldfood** (Grupo Coldfood SAS),
fabricante y exportador colombiano de precocidos, prefritos, frutas congeladas y
pulpas de fruta. Bilingüe (es/en), estático, sin backend propio.

## Stack

- **[Astro 7](https://docs.astro.build)** en modo `output: 'static'` — genera HTML estático puro.
- **Tailwind v4** vía `@tailwindcss/vite`, configurado en CSS (`src/styles/global.css`,
  bloque `@theme`), sin `tailwind.config.js`.
- Sin framework de UI (no React/Vue/Svelte). Componentes `.astro` puros; la
  interactividad mínima necesaria va en `<script>` vanilla dentro del propio componente.
- **pnpm** como gestor de paquetes (no usar `npm`/`yarn`). Node **>=22.12.0**.
- Formularios de contacto/PQRSD servidos por [Web3Forms](https://web3forms.com) (sin backend propio).

## Requisitos

- Node.js ≥ 22.12.0
- pnpm ([instalación](https://pnpm.io/installation))

## Puesta en marcha

```sh
pnpm install
cp .env.example .env   # completar PUBLIC_WEB3FORMS_ACCESS_KEY (ver abajo)
pnpm dev
```

El sitio queda disponible en `http://localhost:4321`.

### Variable de entorno

`PUBLIC_WEB3FORMS_ACCESS_KEY` es la access key pública de Web3Forms que usan los
formularios de `/contacto/` y `/pqrsd/`. Es una variable `PUBLIC_*`: Astro la
incrusta en el HTML en tiempo de build, así que debe existir un `.env` con el
valor real **antes** de correr `pnpm build` para producción. Sin ella, los
formularios se publican con `access_key` vacío y muestran un aviso de "formulario
aún no configurado" en vez de enviar.

## Comandos

| Comando               | Acción                                                          |
| :--------------------- | :--------------------------------------------------------------- |
| `pnpm dev`             | Servidor de desarrollo en `localhost:4321`                      |
| `pnpm check`           | Chequeo de tipos y diagnósticos de Astro (`astro check`)         |
| `pnpm build`           | Build de producción a `./dist/`                                 |
| `pnpm preview`         | Sirve el build de `./dist/` localmente, para verificar antes de subir |
| `pnpm gen:assets`      | Regenera `public/og-image.jpg` a partir de `src/brand/logo-source.png` |

Antes de dar por cerrado cualquier cambio, correr `pnpm check` y `pnpm build`
sin errores.

## Estructura del proyecto

```text
public/                  Archivos servidos tal cual (favicons, .htaccess, robots)
src/
├── assets/               Imágenes fuente (procesadas por astro:assets)
│   ├── categorias/        Fotos de las 8 categorías (home, navbar)
│   ├── conocenos/         Fotos de la página "Conócenos"
│   ├── contacto/          Foto de la página "Contacto"
│   ├── products/          Fotos de empaque por producto (<slug>-es.webp / -en.webp)
│   ├── fonts/              Fuentes variables auto-hospedadas (Montserrat, Satoshi)
│   └── docs/                Política de datos (PDF enlazado desde los formularios)
├── brand/                Logo fuente único (logo-source.png) para pnpm gen:assets
├── components/           Componentes .astro reutilizables (Header, Footer, Hero, SEO...)
│   ├── contacto/, home/, products/  Componentes específicos de cada sección
├── data/                 Contenido/datos del sitio (ver "Editar contenido" abajo)
├── i18n/                 Diccionario de textos de interfaz y helpers de idioma
├── layouts/              Layout.astro — envoltorio HTML de todas las páginas
├── pages/                Rutas del sitio (es sin prefijo, en/ para inglés)
├── scripts/              <script> vanilla importados desde componentes (hero, web3forms)
├── styles/               global.css — paleta y tokens Tailwind v4
└── consts.ts             Dominio, marca y SEO por defecto (fuente única)
scripts/                 Scripts de build/mantenimiento fuera del sitio (gen:assets)
```

## Editar contenido

No hace falta tocar componentes para actualizar textos o datos del negocio:

- **Productos y categorías**: `src/data/products.ts` (las 47 referencias del
  catálogo: nombre, descripciones, variantes, empaque, estiba) y
  `src/data/categories.ts` (las 8 categorías oficiales). Cada producto
  referencia una categoría por `categorySlug`.
- **Textos de interfaz** (nav, botones, formularios, copy de cada sección):
  `src/i18n/ui.ts`. Cada clave existe en `es` y `en` — añadir/editar ambas a la vez.
- **Datos de contacto** (teléfonos, WhatsApp, correos, dirección, horario,
  redes sociales): `src/data/contact.ts`.
- **Marca y SEO** (dominio, nombre legal, colores de marca, títulos/descripciones
  SEO por defecto): `src/consts.ts`.
- **Paleta de color**: `src/styles/global.css`, bloque `@theme`. Los tokens
  semánticos (`canvas`, `ink`, `primary`, `accent`, `cta`, etc.) son los que se
  usan en los componentes; las rampas crudas (`green-500`, `gold-400`...) no se
  usan directamente. Hay reglas de contraste ya auditadas contra WCAG comentadas
  en el propio archivo (p. ej. `gold-50…400` y `sand-100…500` nunca como color
  de texto) — leerlas antes de introducir un color nuevo.
- **Fotos de producto**: agregar el archivo a `src/assets/products/` con el
  nombre `<slug-o-basename>-es.webp` / `-en.webp` (ver comentario en
  `products.ts`); si falta el archivo de un idioma se usa el del otro, y si
  faltan los dos la imagen se omite sin romper el build.
- **Logo / favicons / imagen Open Graph**: `src/brand/logo-source.png` es la
  fuente. `pnpm gen:assets` regenera `public/og-image.jpg` a partir de ese
  archivo. Los favicons (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`,
  `apple-touch-icon.png`, `android-chrome-192x192.png`,
  `android-chrome-512x512.png`) y `site.webmanifest` se generaron con
  [realfavicongenerator.net](https://realfavicongenerator.net) a partir del
  mismo logo y viven en `public/` como archivos finales — si el logo cambia,
  regenerarlos ahí y reemplazarlos a mano (y mantener `BRAND` en `consts.ts`
  en sync con los colores usados).

## Internacionalización

- `es` es el locale por defecto, sin prefijo (`/`, `/productos/`...).
- `en` va prefijado (`/en/`, `/en/productos/`...).
- El slug de ruta no se traduce entre idiomas: `/conocenos/` y `/en/conocenos/`
  son la misma página.
- Usar siempre los helpers de `src/i18n/utils.ts` para construir rutas
  (`getLocalizedPath`, `getLocalizedAbsoluteUrl`) — nunca concatenar `/en/` a mano.

## SEO

- `src/consts.ts` es la fuente única de dominio/marca/SEO por defecto.
- `src/components/SEO.astro` genera el `<head>` (title, description, canonical,
  hreflang es/en/x-default, Open Graph, Twitter). Las páginas pasan sus props a
  través de `<Layout title=... description=...>`, sin `<meta>` sueltos.
- `src/components/JsonLd.astro` genera el JSON-LD (`Organization` + `WebSite`,
  y `Product`/`ItemList`/`BreadcrumbList`/`ContactPage`/`AboutPage` según la página).
- `@astrojs/sitemap` está configurado con soporte i18n; cualquier página nueva
  se incluye sola en el sitemap.

## Despliegue

El sitio se genera 100% estático (`build.format: 'directory'`, URLs con slash
final) pensado para hosting compartido Apache/LiteSpeed (cPanel):

```sh
pnpm build
```

1. Asegurarse de que `.env` tenga la access key real de Web3Forms antes del build.
2. Subir el contenido de `./dist/` a la raíz pública del hosting (`public_html/`
   o equivalente).
3. `dist/.htaccess` y `dist/en/.htaccess` ya vienen incluidos en el build (fuente:
   `public/.htaccess` y `public/en/.htaccess`) y cubren: redirección a
   `https://www.<dominio>`, páginas 404 propias, compresión y cache-control por
   tipo de archivo.

Si cambia el dominio, actualizar `SITE.url` en `src/consts.ts`, `site` en
`astro.config.mjs` y el dominio hardcodeado en `public/.htaccess` (los tres
deben coincidir).

## Problemas conocidos

Si en `astro dev` las clases de Tailwind dejan de aplicarse (elementos sin
estilo o con tamaño nativo en vez del de la clase), es caché corrupta del
servidor de desarrollo, no un error real. Solución: detener el servidor, borrar
`.astro/` y `node_modules/.vite/`, y volver a iniciar.
