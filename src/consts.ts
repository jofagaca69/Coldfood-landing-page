/**
 * Fuente única de verdad para dominio, marca y valores SEO por defecto.
 * Cambiar el dominio o la marca debe requerir editar solo este archivo.
 */

export const SITE = {
	url: 'https://www.precocidoscoldfood.com',
	name: 'Coldfood',
	legalName: 'Grupo Coldfood SAS',
	defaultLocale: 'es',
	locales: ['es', 'en'] as const,
	// Generada por `pnpm gen:assets` (scripts/generate-brand-assets.mjs) a partir de src/brand/logo-source.png
	defaultOgImage: '/og-image.jpg',
	// TODO: completar si existe cuenta de Twitter/X (formato "@usuario")
	twitter: '',
} as const;

export type Locale = (typeof SITE.locales)[number];

/**
 * Colores de marca fuera de Tailwind (favicons, manifest, theme-color del navegador).
 * Deben coincidir con los tokens semánticos `--color-primary` y `--color-canvas`
 * de src/styles/global.css y con las constantes homónimas en
 * scripts/generate-brand-assets.mjs — si cambian aquí, cambian en los tres sitios.
 */
export const BRAND = {
	/** green-800: color de marca para la barra del navegador */
	themeColor: '#1B602F',
	/** canvas: fondo de página, usado como splash background del manifest */
	backgroundColor: '#FCFAF6',
} as const;

/**
 * Textos SEO por defecto por idioma, usados por SEO.astro cuando una página
 * no pasa su propio title/description. Reflejan el posicionamiento real del
 * negocio (fabricante/exportador B2B), no una tienda de consumo final.
 */
export const SEO_DEFAULTS: Record<Locale, { title: string; description: string }> = {
	es: {
		title: 'Congelados y precocidos colombianos | Coldfood',
		description:
			'Fabricante colombiano de precocidos, prefritos, frutas congeladas y pulpas. 47 referencias para food service y exportación. Cadena de frío -18 °C.',
	},
	en: {
		title: 'Colombian Frozen & Pre-cooked Foods | Coldfood',
		description:
			'Colombian manufacturer of pre-cooked, pre-fried, frozen fruit and fruit pulp. 47 SKUs for food service and export. -18 °C cold chain, FDA & INVIMA.',
	},
};

/** Mapa de locale de Astro a etiqueta og:locale (formato xx_XX). */
export const OG_LOCALE_MAP: Record<Locale, string> = {
	es: 'es_ES',
	en: 'en_US',
};
