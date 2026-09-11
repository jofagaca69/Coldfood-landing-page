/**
 * Fuente única de verdad para dominio, marca y valores SEO por defecto.
 * Cambiar el dominio o la marca debe requerir editar solo este archivo.
 */

export const SITE = {
	url: 'https://www.precocidoscoldfood.com',
	name: 'Coldfood',
	legalName: 'Precocidos Coldfood',
	defaultLocale: 'es',
	locales: ['es', 'en'] as const,
	// TODO: reemplazar por la imagen de marca (1200×630) antes de publicar
	defaultOgImage: '/og-image.jpg',
	// TODO: completar si existe cuenta de Twitter/X (formato "@usuario")
	twitter: '',
} as const;

export type Locale = (typeof SITE.locales)[number];

/**
 * Textos SEO por defecto por idioma. Son placeholders: el copy final
 * de título y descripción debe definirlo el usuario antes de publicar.
 */
export const SEO_DEFAULTS: Record<Locale, { title: string; description: string }> = {
	es: {
		title: 'Coldfood | Alimentos precocidos congelados',
		description:
			'Coldfood: alimentos precocidos congelados listos para preparar. Calidad y practicidad para tu día a día.',
	},
	en: {
		title: 'Coldfood | Frozen precooked foods',
		description:
			'Coldfood: frozen precooked foods ready to prepare. Quality and convenience for your everyday life.',
	},
};

/** Mapa de locale de Astro a etiqueta og:locale (formato xx_XX). */
export const OG_LOCALE_MAP: Record<Locale, string> = {
	es: 'es_ES',
	en: 'en_US',
};
