import type { PackFormat } from '@/data/products';

/**
 * Íconos lineales mínimos por formato de empaque, dibujados a mano en el
 * mismo estilo que ya usan Header.astro/Hero.astro (stroke, sin relleno,
 * viewBox 24×24) — el proyecto deliberadamente no suma una librería de
 * íconos (ver CLAUDE.md: "Sin framework de UI", componentes .astro puros),
 * así que se sigue ese patrón en vez de una dependencia nueva.
 *
 * `bolsa`, `doypack` y `display` comparten el mismo cuerpo base (rectángulo
 * redondeado, x=6.5 y=6 w=11 h=14 r=2.5 — para leerse como familia) y se
 * diferencian solo por el remate superior o las marcas internas; `garrafa`
 * es una silueta propia (jarra con asa).
 */

const BODY = 'M9 6H15A2.5 2.5 0 0 1 17.5 8.5V17.5A2.5 2.5 0 0 1 15 20H9A2.5 2.5 0 0 1 6.5 17.5V8.5A2.5 2.5 0 0 1 9 6Z';

export const FORMAT_ICONS: Record<PackFormat, { viewBox: string; paths: string[] }> = {
	bolsa: {
		viewBox: '0 0 24 24',
		paths: [
			BODY,
			// Línea de sellado cerca del borde superior.
			'M7.2 10h9.6',
		],
	},
	doypack: {
		viewBox: '0 0 24 24',
		paths: [
			BODY,
			// Pestaña de cierre zip (doypack), sobresale del borde superior.
			'M10 6V4h4v2',
		],
	},
	display: {
		viewBox: '0 0 24 24',
		paths: [
			BODY,
			// Grilla interna: unidades individuales dentro del display.
			'M12 6v14M6.5 13h11',
		],
	},
	garrafa: {
		viewBox: '0 0 24 24',
		paths: [
			// Cuerpo + cuello de la garrafa.
			'M9 4h5v2.4l2 2.4V18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8.8l2-2.4V4Z',
			// Asa.
			'M16 11h2.3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H16',
		],
	},
};
