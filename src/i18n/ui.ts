import type { Locale } from '@/consts';

/**
 * Diccionario de textos de interfaz reutilizables (nav, CTAs genéricos).
 * No contiene copy de las secciones de la landing — eso se define aparte.
 */
export const ui: Record<Locale, Record<string, string>> = {
	es: {
		'nav.home': 'Inicio',
		'cta.contact': 'Contáctanos',
	},
	en: {
		'nav.home': 'Home',
		'cta.contact': 'Contact us',
	},
};
