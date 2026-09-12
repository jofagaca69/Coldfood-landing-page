import type { Locale } from '@/consts';

/**
 * Diccionario de textos de interfaz reutilizables (nav, CTAs genéricos).
 * No contiene copy de las secciones de la landing — eso se define aparte.
 */
export const ui: Record<Locale, Record<string, string>> = {
	es: {
		'nav.main': 'Principal',
		'nav.home': 'Inicio',
		'nav.about': 'Conócenos',
		'nav.categories': 'Categorías',
		'nav.products': 'Productos',
		'nav.allProducts': 'Ver todo el catálogo',
		'nav.language': 'Idioma',
		'nav.menuOpen': 'Abrir menú',
		'nav.menuClose': 'Cerrar menú',
		'cta.contact': 'Contáctanos',
		'cta.whatsapp': 'WhatsApp',
		'whatsapp.message': 'Hola, quiero información sobre los productos de Coldfood.',
		'bar.tagline': 'Distribución nacional de congelados',
		'bar.cta': 'Escríbenos por WhatsApp',
	},
	en: {
		'nav.main': 'Main',
		'nav.home': 'Home',
		'nav.about': 'About Us',
		'nav.categories': 'Categories',
		'nav.products': 'Products',
		'nav.allProducts': 'View full catalog',
		'nav.language': 'Language',
		'nav.menuOpen': 'Open menu',
		'nav.menuClose': 'Close menu',
		'cta.contact': 'Contact us',
		'cta.whatsapp': 'WhatsApp',
		'whatsapp.message': 'Hi, I would like information about Coldfood products.',
		'bar.tagline': 'Nationwide frozen food distribution',
		'bar.cta': 'Message us on WhatsApp',
	},
};
