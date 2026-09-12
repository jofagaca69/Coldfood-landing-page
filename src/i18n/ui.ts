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
		'hero.badge': '11 años de sabor colombiano',
		'hero.title.a': 'Precocidos colombianos,',
		'hero.title.b': 'listos para su cocina.',
		'hero.subtitle':
			'Papa criolla, yuca, arracacha y plátano. Producimos, empacamos y despachamos en cadena de frío para distribuidores y food service.',
		'hero.cta.primary': 'Pedir cotización',
		'hero.cta.secondary': 'Ver las 14 referencias',
		'hero.coldChain': 'Cadena de frío -18 °C',
		'hero.pack.tostones.alt': 'Empaque de Tostones de plátano verde Coldfood, 1.000 g',
		'hero.pack.maduros.alt': 'Empaque de Plátanos maduros enteros Coldfood, 500 g',
		'hero.pack.yuca.alt': 'Empaque de Yuca croqueta prefrita Coldfood, 1.000 g',
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
		'hero.badge': '11 years of Colombian flavor',
		'hero.title.a': 'Precooked food,',
		'hero.title.b': 'ready for your kitchen.',
		'hero.subtitle':
			'Criolla potato, cassava, arracacha and plantain. We produce, pack and ship in cold chain for distributors and food service.',
		'hero.cta.primary': 'Request a quote',
		'hero.cta.secondary': 'View all 14 products',
		'hero.coldChain': 'Cold chain -18 °C',
		'hero.pack.tostones.alt': 'Coldfood green plantain tostones pack, 1,000 g',
		'hero.pack.maduros.alt': 'Coldfood whole ripe plantains pack, 500 g',
		'hero.pack.yuca.alt': 'Coldfood prefried cassava croquette pack, 1,000 g',
	},
};
