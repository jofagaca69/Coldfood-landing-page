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
		'nav.language': 'Idioma',
		'nav.menuOpen': 'Abrir menú',
		'cta.contact': 'Contáctanos',
	},
	en: {
		'nav.main': 'Main',
		'nav.home': 'Home',
		'nav.about': 'About Us',
		'nav.categories': 'Categories',
		'nav.products': 'Products',
		'nav.language': 'Language',
		'nav.menuOpen': 'Open menu',
		'cta.contact': 'Contact us',
	},
};
