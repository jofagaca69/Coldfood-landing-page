// Herramienta de desarrollo, uso puntual: reemplaza las fotos de producto en
// src/assets/products/ con las fotografías reales de empaque entregadas por
// el cliente en Downloads/image/{producto_esp,producto_eng}/N.png (1920x1080,
// fondo blanco), recortando el margen blanco sobrante y optimizándolas a
// .webp con el nombre de slug que ya usa el glob de src/data/products.ts.
//
// No es parte del build ni se importa desde el sitio. Sigue el estilo de
// scripts/generate-brand-assets.mjs / scripts/extract-catalog-images.mjs
// (ESM + sharp, sin dependencias nuevas).
//
// Uso: node scripts/import-product-photos.mjs [--dry-run]
//
// El mapeo fue armado a mano revisando cada una de las 69+69 fotos fuente
// (numeradas de forma independiente entre carpeta ES y EN — el mismo índice
// NO es el mismo producto de un idioma a otro).
//
// Notas sobre el mapeo:
// - Las 4 variantes "-cr" (Costa Rica) de yuca/plátano reutilizan la misma
//   foto que su equivalente no-CR: las fotos nuevas no traen empaque
//   distinto para Costa Rica.
// - "pulpa-mix-mango-banano-doypack" no tiene foto propia en inglés (el
//   folder EN trae un duplicado de "passion fruit-mango" en su lugar). Se
//   deja sin generar en inglés a propósito: el glob de products.ts ya hace
//   fallback automático a la foto en español para ese único archivo
//   (mismo mecanismo que ya cubría los 5 productos pre-fritos antes de
//   este cambio).
// - Hay una foto "garrafa" de guayaba en ambos idiomas que no se usa: hoy
//   products.ts no define esa presentación para pulpa-guayaba. No se crea
//   ningún archivo para ella (no se amplía el catálogo sin que se pida).

import { mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SRC_ROOT = 'C:\\Users\\jofa7\\Downloads\\image';
const SRC_ES = path.join(SRC_ROOT, 'producto_esp');
const SRC_EN = path.join(SRC_ROOT, 'producto_eng');
const OUT_DIR = path.join(root, 'src', 'assets', 'products');

const DRY_RUN = process.argv.includes('--dry-run');

const RESIZE_WIDTH = 900; // cubre ProductGallery (800) y ProductCard (400) con margen para @2x
const WEBP_QUALITY = 80;

// Las fotos fuente traen el producto centrado en un lienzo 1920x1080 con
// mucho margen blanco alrededor (para que quepa cualquier ángulo del pack
// shot). ProductGallery/ProductCard ya ponen su propio padding + fondo
// blanco alrededor de la imagen (`object-contain` dentro de un contenedor
// `aspect-square`), así que ese margen del lienzo original es puro espacio
// perdido: recortarlo hace que el producto se vea más grande y consistente
// en las fichas sin cambiar nada de los componentes.
const TRIM_BACKGROUND = '#FFFFFF';
const TRIM_THRESHOLD = 20; // tolerancia sobre "blanco puro" (antialiasing/sombras suaves del render)
const TRIM_PADDING_RATIO = 0.04; // margen que se vuelve a agregar tras recortar, relativo al lado mayor

/** @type {Array<{ basename: string, es: number, en?: number }>} */
const MAPPING = [
	// Productos frescos / pre-cocidos (bolsa individual)
	{ basename: 'yuca-trozos-fresca', es: 7, en: 1 },
	{ basename: 'yuca-astillas-fresca', es: 16, en: 2 },
	{ basename: 'yuca-cassava-fresca', es: 4, en: 3 },
	{ basename: 'platano-verde-entero-fresco', es: 17, en: 4 },
	{ basename: 'papa-criolla-precocida', es: 2, en: 5 },
	{ basename: 'yuca-astilla-precocida', es: 6, en: 6 },
	{ basename: 'mix-ajiaco-precocido', es: 8, en: 7 },
	{ basename: 'mix-sancocho-precocido', es: 11, en: 8 },
	{ basename: 'arracacha-precocida', es: 13, en: 9 },
	{ basename: 'mazorca-trozos-precocida', es: 3, en: 10 },

	// Costa Rica: reutilizan la foto de su equivalente no-CR (ver nota arriba)
	{ basename: 'yuca-trozos-fresca-cr', es: 7, en: 1 },
	{ basename: 'yuca-astillas-fresca-cr', es: 16, en: 2 },
	{ basename: 'yuca-cassava-fresca-cr', es: 4, en: 3 },
	{ basename: 'yuca-astilla-precocida-cr', es: 6, en: 6 },

	// Frutas congeladas
	{ basename: 'mora-congelada', es: 1, en: 17 },
	{ basename: 'tomate-arbol-congelado', es: 22, en: 18 },
	{ basename: 'lulo-congelado', es: 19, en: 19 },
	{ basename: 'lulo-chunks-congelado', es: 18, en: 20 },
	{ basename: 'fresas-congeladas', es: 27, en: 21 },
	{ basename: 'pina-congelada', es: 28, en: 22 },
	{ basename: 'guayaba-chunks-congelada', es: 20, en: 23 },
	{ basename: 'guayaba-entera-congelada', es: 21, en: 24 },

	// Pre-fritos (antes 5 de estos no tenían foto en inglés)
	{ basename: 'tostones-platano-verde', es: 15, en: 11 },
	{ basename: 'tajadas-platano-maduro-prefrita', es: 9, en: 12 },
	{ basename: 'platanos-maduros-enteros', es: 14, en: 13 },
	{ basename: 'yuca-francesa-prefrita', es: 12, en: 14 },
	{ basename: 'yuca-croqueta-prefrita', es: 5, en: 15 },
	{ basename: 'cubitos-platano-maduro-prefrito', es: 10, en: 16 },

	// Masas listas
	{ basename: 'pandebonos-prehorneados', es: 23, en: 66 },
	{ basename: 'almojabanas-tradicionales-prehorneadas', es: 24, en: 67 },
	{ basename: 'bunuelos-para-freir', es: 25, en: 68 },
	{ basename: 'pandebonos-para-hornear', es: 26, en: 69 },

	// Pulpas — doypack (250 g, bolsita individual)
	{ basename: 'pulpa-guayaba-doypack', es: 29, en: 25 },
	{ basename: 'pulpa-maracuya-doypack', es: 30, en: 26 },
	{ basename: 'pulpa-papaya-doypack', es: 31, en: 27 },
	{ basename: 'pulpa-guanabana-doypack', es: 32, en: 28 },
	{ basename: 'pulpa-fresa-doypack', es: 33, en: 29 },
	{ basename: 'pulpa-lulo-doypack', es: 34, en: 30 },
	{ basename: 'pulpa-tomate-arbol-doypack', es: 35, en: 33 },
	{ basename: 'pulpa-mora-doypack', es: 36, en: 31 },
	{ basename: 'pulpa-mango-doypack', es: 37, en: 32 },
	{ basename: 'pulpa-pina-doypack', es: 38, en: 34 },
	{ basename: 'pulpa-mix-frutos-rojos-doypack', es: 39, en: 35 },
	{ basename: 'pulpa-mix-frutos-amarillos-doypack', es: 40, en: 36 },
	{ basename: 'pulpa-mix-pina-mango-doypack', es: 41, en: 37 },
	{ basename: 'pulpa-mix-maracuya-mango-doypack', es: 42, en: 38 },
	// sin foto propia en inglés: el folder EN duplica "passion fruit-mango"
	// en vez de traer "mango-banana" doypack. Fallback automático a ES.
	{ basename: 'pulpa-mix-mango-banano-doypack', es: 43 },

	// Pulpas — display (900 g / 10 unidades)
	{ basename: 'pulpa-mora-display', es: 44, en: 40 },
	{ basename: 'pulpa-fresa-display', es: 45, en: 41 },
	{ basename: 'pulpa-tomate-arbol-display', es: 46, en: 42 },
	{ basename: 'pulpa-guayaba-display', es: 47, en: 43 },
	{ basename: 'pulpa-maracuya-display', es: 48, en: 44 },
	{ basename: 'pulpa-guanabana-display', es: 49, en: 45 },
	{ basename: 'pulpa-mango-display', es: 50, en: 46 },
	{ basename: 'pulpa-pina-display', es: 51, en: 47 },
	{ basename: 'pulpa-papaya-display', es: 52, en: 48 },
	{ basename: 'pulpa-lulo-display', es: 53, en: 49 },
	{ basename: 'pulpa-mix-frutos-rojos-display', es: 54, en: 50 },
	{ basename: 'pulpa-mix-frutos-amarillos-display', es: 55, en: 51 },
	{ basename: 'pulpa-mix-pina-mango-display', es: 56, en: 52 },
	{ basename: 'pulpa-mix-maracuya-mango-display', es: 57, en: 53 },
	{ basename: 'pulpa-mix-mango-banano-display', es: 58, en: 54 },

	// Pulpas — garrafa (1.1 kg / 946 ml)
	{ basename: 'pulpa-maracuya-garrafa', es: 59, en: 55 },
	{ basename: 'pulpa-guanabana-garrafa', es: 60, en: 56 },
	{ basename: 'pulpa-mango-garrafa', es: 61, en: 57 },
	{ basename: 'pulpa-lulo-garrafa', es: 63, en: 59 },
	{ basename: 'pulpa-mora-garrafa', es: 64, en: 60 },
	{ basename: 'pulpa-mix-frutos-rojos-garrafa', es: 65, en: 61 },
	{ basename: 'pulpa-mix-frutos-amarillos-garrafa', es: 66, en: 62 },
	{ basename: 'pulpa-mix-pina-mango-garrafa', es: 67, en: 63 },
	{ basename: 'pulpa-mix-maracuya-mango-garrafa', es: 68, en: 64 },
	{ basename: 'pulpa-mix-mango-banano-garrafa', es: 69, en: 65 },
];

function srcFile(dir, n) {
	return path.join(dir, `${n}.png`);
}

async function convertOne(sourcePath, outPath) {
	if (DRY_RUN) return;

	// Recorta el margen blanco en un paso sin pérdida (trim/extend trabajan
	// sobre el raster crudo) y solo al final se codifica a webp — así el
	// recorte no agrega una segunda generación de compresión con pérdida.
	//
	// OJO: cada paso se materializa en un Buffer aparte en vez de encadenar
	// .trim().extend().resize() en un solo pipeline. Con sharp 0.35.4 / vips
	// 8.18.6 encadenar extend() seguido de resize() en la misma llamada da
	// dimensiones de salida incorrectas (verificado a mano: un caso real dio
	// 1042x631 encadenado vs. 900x520 correcto separando las llamadas).
	const trimmedBuffer = await sharp(sourcePath)
		.trim({ background: TRIM_BACKGROUND, threshold: TRIM_THRESHOLD })
		.toBuffer();

	const { width, height } = await sharp(trimmedBuffer).metadata();
	const pad = Math.round(Math.max(width, height) * TRIM_PADDING_RATIO);

	const extendedBuffer = await sharp(trimmedBuffer)
		.extend({ top: pad, bottom: pad, left: pad, right: pad, background: TRIM_BACKGROUND })
		.toBuffer();

	await sharp(extendedBuffer)
		.resize({ width: RESIZE_WIDTH, withoutEnlargement: true })
		.webp({ quality: WEBP_QUALITY })
		.toFile(outPath);
}

async function main() {
	mkdirSync(OUT_DIR, { recursive: true });

	let written = 0;
	let skippedEn = 0;

	for (const entry of MAPPING) {
		const esOut = path.join(OUT_DIR, `${entry.basename}-es.webp`);
		await convertOne(srcFile(SRC_ES, entry.es), esOut);
		written++;
		console.log(`${DRY_RUN ? '[dry-run] ' : ''}ES  ${entry.basename}-es.webp  <- producto_esp/${entry.es}.png`);

		if (entry.en) {
			const enOut = path.join(OUT_DIR, `${entry.basename}-en.webp`);
			await convertOne(srcFile(SRC_EN, entry.en), enOut);
			written++;
			console.log(`${DRY_RUN ? '[dry-run] ' : ''}EN  ${entry.basename}-en.webp  <- producto_eng/${entry.en}.png`);
		} else {
			skippedEn++;
			// Si quedó un archivo viejo (recorte del PDF) para este basename,
			// se borra para que el fallback a ES del propio glob de
			// products.ts sea el que se vea — no una foto vieja de baja
			// resolución mezclada entre las nuevas.
			const staleEn = path.join(OUT_DIR, `${entry.basename}-en.webp`);
			if (existsSync(staleEn)) {
				if (!DRY_RUN) unlinkSync(staleEn);
				console.log(`--  ${entry.basename}-en.webp  (sin foto EN nueva; se borra la vieja, fallback a ES)`);
			} else {
				console.log(`--  ${entry.basename}-en.webp  (sin foto EN, products.ts hace fallback a ES)`);
			}
		}
	}

	console.log(`\nTotal productos mapeados: ${MAPPING.length}`);
	console.log(`Archivos ${DRY_RUN ? 'a escribir' : 'escritos'}: ${written}`);
	console.log(`Sin foto propia en inglés (fallback ES): ${skippedEn}`);
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
