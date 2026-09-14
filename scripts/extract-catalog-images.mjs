// Herramienta de desarrollo, uso puntual: extrae los pack shots embebidos en
// CatálogoCongelados2026.pdf hacia archivos .webp sueltos para poder triarlos
// a mano y copiar los buenos a src/assets/products/.
//
// No es parte del build ni se importa desde el sitio. Sigue el estilo de
// scripts/generate-brand-assets.mjs (ESM + sharp, sin dependencias nuevas).
//
// Uso: node scripts/extract-catalog-images.mjs [--min-side=300] [--out=DIR]
//
// Resultado del triaje manual ya hecho (referencia, por si se vuelve a correr
// tras un catálogo actualizado): de ~317 candidatos únicos ≥300px, unos 24
// son pack shots completos y limpios (bolsa + producto en un solo raster);
// el resto son capas sueltas —bolsas vacías sin el "recorte" de producto
// superpuesto, fondos decorativos, sellos, o SMasks que quedaron con encoding
// distinto y no componen bien— y no sirven directamente. Los que sí sirvieron
// ya están copiados en src/assets/products/ con el nombre del slug del
// producto. Cuatro productos de "Productos Frescos" (yuca en astilla, yuca
// cassava, yuca en trozos, plátano verde entero) aparecían así en los objetos
// individuales pero SÍ estaban completos en el collage de la página
// ("obj01756", 566×800): para esos se recortó ese collage en cuadrantes en
// vez de usar el objeto individual.

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const args = Object.fromEntries(
	process.argv.slice(2).map((a) => {
		const [k, v] = a.replace(/^--/, '').split('=');
		return [k, v ?? true];
	}),
);

const PDF_PATH = path.join(root, 'CatálogoCongelados2026.pdf');
const MIN_SIDE = Number(args['min-side'] ?? 300);
const OUT_DIR = args.out
	? path.resolve(String(args.out))
	: path.join(root, '.tmp-catalog-images');

mkdirSync(OUT_DIR, { recursive: true });

const buf = readFileSync(PDF_PATH);
// El PDF no usa /ObjStm (comprobado antes de escribir este script), así que
// cada objeto indirecto aparece literal en el archivo como "N G obj ... endobj".
const latin1 = buf.toString('latin1');

const objRe = /(\d+)\s+0\s+obj([\s\S]*?)endobj/g;
const objects = new Map(); // num -> { dictText, streamBuf }

let m;
while ((m = objRe.exec(latin1))) {
	const num = Number(m[1]);
	const body = m[2];
	const streamStart = body.indexOf('stream');
	if (streamStart === -1) {
		objects.set(num, { dictText: body, streamBuf: null });
		continue;
	}
	const dictText = body.slice(0, streamStart);
	// El contenido del stream empieza justo tras "stream\r\n" o "stream\n".
	// OJO: el chequeo debe indexar `body` (offset relativo al objeto), no
	// `latin1` (offset relativo a todo el archivo) — si no, el byte de
	// arranque del stream queda desalineado y zlib falla con "incorrect
	// header check".
	let dataStart = streamStart + 'stream'.length;
	if (body[dataStart] === '\r') dataStart++;
	if (body[dataStart] === '\n') dataStart++;
	const endIdx = body.lastIndexOf('endstream');
	const rawSlice = body.slice(dataStart, endIdx > dataStart ? endIdx : undefined);
	objects.set(num, { dictText, streamBuf: Buffer.from(rawSlice, 'latin1') });
}

function getNum(dict, key) {
	const re = new RegExp(`/${key}\\s+(\\d+)`);
	const mm = re.exec(dict);
	return mm ? Number(mm[1]) : undefined;
}

function getRef(dict, key) {
	const re = new RegExp(`/${key}\\s+(\\d+)\\s+0\\s+R`);
	const mm = re.exec(dict);
	return mm ? Number(mm[1]) : undefined;
}

/** Número de componentes de color: /DeviceGray, /DeviceRGB, o /ICCBased N 0 R (mira /N del objeto referenciado). */
function resolveColorComponents(dictText) {
	if (/\/ColorSpace\s*\/DeviceGray/.test(dictText)) return 1;
	if (/\/ColorSpace\s*\/DeviceRGB/.test(dictText)) return 3;
	const iccRef = /\/ColorSpace\s*\[\s*\/ICCBased\s+(\d+)\s+0\s+R\s*\]/.exec(dictText);
	if (iccRef) {
		const target = objects.get(Number(iccRef[1]));
		if (target) {
			const n = getNum(target.dictText, 'N');
			if (n) return n;
		}
	}
	return null;
}

function unfilterPngPredictor(data, colors, bpc, columns) {
	const bytesPerPixel = Math.max(1, Math.ceil((colors * bpc) / 8));
	const rowBytes = Math.ceil((columns * colors * bpc) / 8);
	const out = Buffer.alloc(rowBytes * (data.length / (rowBytes + 1)));
	let inPos = 0;
	let outPos = 0;
	let prevRow = Buffer.alloc(rowBytes);
	while (inPos < data.length) {
		const filterType = data[inPos];
		inPos++;
		const row = data.subarray(inPos, inPos + rowBytes);
		inPos += rowBytes;
		const outRow = out.subarray(outPos, outPos + rowBytes);
		for (let i = 0; i < rowBytes; i++) {
			const a = i >= bytesPerPixel ? outRow[i - bytesPerPixel] : 0;
			const b = prevRow[i];
			const c = i >= bytesPerPixel ? prevRow[i - bytesPerPixel] : 0;
			let val = row[i];
			switch (filterType) {
				case 0:
					break;
				case 1:
					val = (val + a) & 0xff;
					break;
				case 2:
					val = (val + b) & 0xff;
					break;
				case 3:
					val = (val + Math.floor((a + b) / 2)) & 0xff;
					break;
				case 4: {
					const p = a + b - c;
					const pa = Math.abs(p - a);
					const pb = Math.abs(p - b);
					const pc = Math.abs(p - c);
					const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
					val = (val + pred) & 0xff;
					break;
				}
				default:
					break;
			}
			outRow[i] = val;
		}
		prevRow = outRow;
		outPos += rowBytes;
	}
	return out;
}

async function decodeImageObject(num, obj) {
	const { dictText, streamBuf } = obj;
	if (!/\/Subtype\s*\/Image/.test(dictText)) return null;
	if (!/FlateDecode/.test(dictText)) return null; // no hay DCTDecode en este PDF

	const width = getNum(dictText, 'Width');
	const height = getNum(dictText, 'Height');
	const bpc = getNum(dictText, 'BitsPerComponent') ?? 8;
	if (!width || !height) return null;
	if (width < MIN_SIDE && height < MIN_SIDE) return null;

	const colors = resolveColorComponents(dictText);
	if (!colors) return null;

	let raw;
	try {
		raw = inflateSync(streamBuf);
	} catch {
		return null;
	}

	const hasPredictor = /\/Predictor\s+1[0-5]/.test(dictText);
	if (hasPredictor) {
		raw = unfilterPngPredictor(raw, colors, bpc, width);
	}

	const expected = width * height * colors;
	if (raw.length < expected) return null;
	raw = raw.subarray(0, expected);

	let sharpImg = sharp(raw, { raw: { width, height, channels: colors } });

	const smaskRef = getRef(dictText, 'SMask');
	if (smaskRef && objects.has(smaskRef)) {
		const smaskObj = objects.get(smaskRef);
		const sw = getNum(smaskObj.dictText, 'Width');
		const sh = getNum(smaskObj.dictText, 'Height');
		const sBpc = getNum(smaskObj.dictText, 'BitsPerComponent') ?? 8;
		if (sw && sh && /FlateDecode/.test(smaskObj.dictText)) {
			try {
				let sraw = inflateSync(smaskObj.streamBuf);
				if (/\/Predictor\s+1[0-5]/.test(smaskObj.dictText)) {
					sraw = unfilterPngPredictor(sraw, 1, sBpc, sw);
				}
				const sExpected = sw * sh;
				if (sraw.length >= sExpected) {
					sraw = sraw.subarray(0, sExpected);
					let maskBuf = sraw;
					if (sw !== width || sh !== height) {
						maskBuf = await sharp(sraw, { raw: { width: sw, height: sh, channels: 1 } })
							.resize(width, height)
							.raw()
							.toBuffer();
					}
					const rgbBuf = colors === 1
						? await sharpImg.toColourspace('srgb').raw().toBuffer()
						: raw;
					sharpImg = sharp(rgbBuf, { raw: { width, height, channels: 3 } }).joinChannel(maskBuf, {
						raw: { width, height, channels: 1 },
					});
				}
			} catch {
				// si la máscara falla, seguimos sin alfa
			}
		}
	}

	const webpBuf = await sharpImg.webp({ quality: 92 }).toBuffer();
	const hash = crypto.createHash('sha1').update(webpBuf).digest('hex').slice(0, 10);
	return { num, width, height, webpBuf, hash };
}

const results = [];
const seenHashes = new Set();

for (const [num, obj] of objects) {
	if (!/\/Subtype\s*\/Image/.test(obj.dictText)) continue;
	try {
		const decoded = await decodeImageObject(num, obj);
		if (!decoded) continue;
		if (seenHashes.has(decoded.hash)) continue;
		seenHashes.add(decoded.hash);
		results.push(decoded);
	} catch (err) {
		console.warn(`obj ${num}: ${err.message}`);
	}
}

results.sort((a, b) => a.num - b.num);

for (const r of results) {
	const name = `obj${String(r.num).padStart(5, '0')}-${r.width}x${r.height}-${r.hash}.webp`;
	writeFileSync(path.join(OUT_DIR, name), r.webpBuf);
}

console.log(`Objetos imagen totales: ${[...objects.values()].filter((o) => /\/Subtype\s*\/Image/.test(o.dictText)).length}`);
console.log(`Candidatos únicos >= ${MIN_SIDE}px: ${results.length}`);
console.log(`Guardados en: ${OUT_DIR}`);
