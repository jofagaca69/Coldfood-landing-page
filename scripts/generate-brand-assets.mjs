/**
 * Genera la imagen Open Graph a partir de src/brand/logo-source.png.
 *
 * Re-ejecutar con `pnpm gen:assets` cada vez que se reemplace ese archivo
 * (por ejemplo, al recibir el logo en alta resolución).
 *
 * Los colores de marca usados aquí (canvas, acento dorado) deben coincidir
 * con BRAND en src/consts.ts y con los tokens --color-canvas / --color-accent
 * en src/styles/global.css. Si la paleta cambia, actualizar los tres sitios.
 *
 * Los favicons (favicon.ico, favicon-16x16.png, favicon-32x32.png,
 * apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png)
 * y `site.webmanifest` NO se generan aquí: se produjeron con
 * https://realfavicongenerator.net a partir del mismo logo y viven
 * directamente en `public/` como archivos finales. Si el logo cambia,
 * regenerarlos ahí y reemplazarlos a mano.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE = path.join(ROOT, 'src/brand/logo-source.png');
const PUBLIC = path.join(ROOT, 'public');

// Debe coincidir con src/consts.ts -> BRAND
const CANVAS = { r: 252, g: 250, b: 246 }; // #FCFAF6
const GOLD_ACCENT = { r: 225, g: 163, b: 29 }; // gold-400 #E1A31D

async function main() {
	await mkdir(PUBLIC, { recursive: true });

	const meta = await sharp(SOURCE).metadata();
	console.log(`Logo fuente: ${meta.width}×${meta.height}px — src/brand/logo-source.png`);

	// --- Open Graph image (1200×630): lockup completo (isotipo + wordmark) sobre canvas ---
	const OG_W = 1200;
	const OG_H = 630;
	const logoBuffer = await sharp(SOURCE).toBuffer();
	const logoTargetWidth = Math.round(meta.width * 1.19); // ~260px; nítido al reemplazar por el logo en alta
	const logoResized = await sharp(logoBuffer)
		.resize({ width: logoTargetWidth })
		.toBuffer({ resolveWithObject: true });

	const accentBar = await sharp({
		create: { width: OG_W, height: 10, channels: 4, background: GOLD_ACCENT },
	})
		.png()
		.toBuffer();

	await sharp({ create: { width: OG_W, height: OG_H, channels: 4, background: CANVAS } })
		.composite([
			{ input: logoResized.data, gravity: 'centre' },
			{ input: accentBar, left: 0, top: OG_H - 10 },
		])
		.jpeg({ quality: 90 })
		.toFile(path.join(PUBLIC, 'og-image.jpg'));
	console.log('✓ public/og-image.jpg (1200×630)');

	console.log('\nListo. Revisa visualmente public/og-image.jpg antes de publicar.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
