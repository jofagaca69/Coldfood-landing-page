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

/**
 * Canales de contacto. Cambiar teléfono o correos solo aquí.
 * TODO: confirmar con el cliente WhatsApp y buzones reales antes de publicar.
 */
export const CONTACT = {
	/** Número internacional sin + ni espacios, para wa.me */
	whatsapp: '573508852633',
	whatsappDisplay: '+57 350 885 2633',
	email: 'contacto@precocidoscoldfood.com',
	pqrsEmail: 'pqrs@precocidoscoldfood.com',
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
