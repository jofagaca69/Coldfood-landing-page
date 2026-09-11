/**
 * Genera favicons, apple-touch-icon, iconos PWA y la imagen Open Graph
 * a partir de src/brand/logo-source.png.
 *
 * Re-ejecutar con `pnpm gen:assets` cada vez que se reemplace ese archivo
 * (por ejemplo, al recibir el logo en alta resolución).
 *
 * Los colores de marca usados aquí (canvas, acento dorado) deben coincidir
 * con BRAND en src/consts.ts y con los tokens --color-canvas / --color-accent
 * en src/styles/global.css. Si la paleta cambia, actualizar los tres sitios.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE = path.join(ROOT, 'src/brand/logo-source.png');
const PUBLIC = path.join(ROOT, 'public');

// Debe coincidir con src/consts.ts -> BRAND
const CANVAS = { r: 252, g: 250, b: 246 }; // #FCFAF6
const CANVAS_HEX = '#FCFAF6';
const THEME_COLOR_HEX = '#1B602F'; // green-800
const GOLD_ACCENT = { r: 225, g: 163, b: 29 }; // gold-400 #E1A31D

/**
 * Encuentra la fila donde empieza el wordmark ("Coldfood") explorando la
 * franja derecha de la imagen (donde no hay cuerpo de la papa) en busca de
 * píxeles color-texto (marrón oscuro). Evita hardcodear una altura de
 * recorte fija, para que el script se adapte si el logo fuente cambia de
 * tamaño/proporción.
 */
async function findIsotypeCutoffRow(meta) {
	const { data } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const { width, height } = meta;
	const rightZoneStart = Math.round(width * 0.73);
	// 0: corta ante el primer píxel color-texto detectado (incluida la punta de un asta
	// como la "d" de "Coldfood", que puede asomar 1-2px antes del cuerpo del wordmark).
	const THRESHOLD = 0;

	for (let y = 0; y < height; y++) {
		let count = 0;
		for (let x = rightZoneStart; x < width; x++) {
			const i = (y * width + x) * 4;
			const alpha = data[i + 3];
			if (alpha < 160) continue;
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const isWordmarkBrown = r > g && g >= b && r < 160 && r > 50 && g < 115;
			if (isWordmarkBrown) count++;
		}
		if (count > THRESHOLD) return y;
	}
	// No se encontró wordmark (p. ej. si el logo fuente es solo el isotipo): usar todo el alto.
	return height;
}

/**
 * Recorta la papa+hojas del wordmark (fila `cutoffRow` hacia arriba) y, opcionalmente,
 * también quita las hojas (píxeles verdes) para quedarse solo con la papa.
 *
 * Los tamaños muy pequeños (16/32/96px) usan solo la papa: el isotipo completo es
 * mucho más ancho que alto, y a esos tamaños las hojas se pierden y solo restan
 * espacio en blanco arriba/abajo del ícono cuadrado. Los tamaños grandes
 * (apple-touch-icon, 192/512) sí tienen resolución para lucir las hojas.
 */
async function extractIsotype(cutoffRow, { includeLeaves }) {
	let { data, info } = await sharp(SOURCE)
		.extract({ left: 0, top: 0, width: 218, height: cutoffRow })
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	if (!includeLeaves) {
		data = Buffer.from(data); // copia mutable
		for (let i = 0; i < data.length; i += 4) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			if (g > r + 10 && g > b + 10) data[i + 3] = 0; // borra píxeles verdes (hojas)
		}
	}

	const png = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
		.png()
		.toBuffer();
	return sharp(png).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
}

/** Centra un recorte RGBA ya trimeado en un lienzo cuadrado transparente. */
function padToSquare({ data, info }, paddingRatio) {
	const side = Math.round(Math.max(info.width, info.height) * (1 + paddingRatio * 2));
	const left = Math.round((side - info.width) / 2);
	const top = Math.round((side - info.height) / 2);
	return sharp({ create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
		.composite([{ input: data, left, top }])
		.png();
}

/** Empaqueta uno o más PNG en un único .ico (formato ICONDIR + entradas + payloads PNG). */
function buildIco(entries) {
	const count = entries.length;
	const headerSize = 6 + 16 * count;
	let offset = headerSize;
	const header = Buffer.alloc(headerSize);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type: icon
	header.writeUInt16LE(count, 4);

	entries.forEach((entry, i) => {
		const base = 6 + i * 16;
		const dim = entry.size >= 256 ? 0 : entry.size; // 0 significa 256px
		header.writeUInt8(dim, base + 0); // width
		header.writeUInt8(dim, base + 1); // height
		header.writeUInt8(0, base + 2); // color palette
		header.writeUInt8(0, base + 3); // reserved
		header.writeUInt16LE(1, base + 4); // color planes
		header.writeUInt16LE(32, base + 6); // bits per pixel
		header.writeUInt32LE(entry.buffer.length, base + 8); // tamaño del payload
		header.writeUInt32LE(offset, base + 12); // offset del payload
		offset += entry.buffer.length;
	});

	return Buffer.concat([header, ...entries.map((e) => e.buffer)]);
}

async function main() {
	await mkdir(PUBLIC, { recursive: true });

	const meta = await sharp(SOURCE).metadata();
	console.log(`Logo fuente: ${meta.width}×${meta.height}px — src/brand/logo-source.png`);

	const cutoffRow = await findIsotypeCutoffRow(meta);
	console.log(`Isotipo recortado antes de la fila y=${cutoffRow} (inicio detectado del wordmark).`);

	// --- Papa sola (sin hojas), para los tamaños diminutos donde las hojas no se leen ---
	const potatoOnly = await extractIsotype(cutoffRow, { includeLeaves: false });
	const potatoSquare = await padToSquare(potatoOnly, 0.14).toBuffer();

	const favicon32 = await sharp(potatoSquare).resize(32, 32).png().toBuffer();
	const favicon16 = await sharp(potatoSquare).resize(16, 16).png().toBuffer();
	const icoBuffer = buildIco([
		{ size: 16, buffer: favicon16 },
		{ size: 32, buffer: favicon32 },
	]);
	await writeFile(path.join(PUBLIC, 'favicon.ico'), icoBuffer);
	console.log('✓ public/favicon.ico (16+32, solo papa)');

	await sharp(potatoSquare).resize(96, 96).png().toFile(path.join(PUBLIC, 'favicon-96.png'));
	console.log('✓ public/favicon-96.png (solo papa)');

	// --- apple-touch-icon: mismo recorte que el favicon (consistencia), fondo sólido
	//     (iOS no respeta transparencia) ---
	const potatoOnCanvas = await padToSquare(potatoOnly, 0.2).flatten({ background: CANVAS }).toBuffer();
	await sharp(potatoOnCanvas).resize(180, 180).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'));
	console.log('✓ public/apple-touch-icon.png (solo papa)');

	// --- Isotipo completo (papa + hojas), para los iconos PWA grandes con más resolución ---
	const fullIsotype = await extractIsotype(cutoffRow, { includeLeaves: true });
	const isotypeSquareTransparent = await padToSquare(fullIsotype, 0.1).toBuffer();

	await sharp(isotypeSquareTransparent).resize(192, 192).png().toFile(path.join(PUBLIC, 'icon-192.png'));
	console.log('✓ public/icon-192.png (papa + hojas)');

	await sharp(isotypeSquareTransparent).resize(512, 512).png().toFile(path.join(PUBLIC, 'icon-512.png'));
	console.log('✓ public/icon-512.png (papa + hojas)');

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

	// --- Web app manifest ---
	const manifest = {
		name: 'Coldfood | Productos Precocidos',
		short_name: 'Coldfood',
		start_url: '/',
		display: 'standalone',
		background_color: CANVAS_HEX,
		theme_color: THEME_COLOR_HEX,
		icons: [
			{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
		],
	};
	await writeFile(path.join(PUBLIC, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
	console.log('✓ public/site.webmanifest');

	console.log('\nListo. Revisa visualmente public/og-image.jpg y public/favicon-96.png antes de publicar.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
