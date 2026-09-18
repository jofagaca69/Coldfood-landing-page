/**
 * Categorías de producto de Coldfood. Fuente única para el desplegable del
 * navbar y para el JSON completo de productos: cada producto referencia uno
 * de estos `slug` en su campo `categorySlug`.
 *
 * `slug` es estable (referenciado por productos, anclas de /productos/ y
 * JSON-LD) — nunca cambiarlo sin migrar también `src/data/products.ts`.
 * Los nombres `es`/`en` se alinearon con el diseño de home entregado por el
 * cliente (`src/assets/disenoIA.pdf`), que renombra 4 de las 8 líneas;
 * `productos-costa-rica` y `pulpas-mix-de-frutas` no aparecen en ese diseño
 * y conservan el nombre anterior.
 */

export interface Category {
	slug: string;
	es: string;
	en: string;
}

export const CATEGORIES: Category[] = [
	{ slug: 'productos-frescos', es: 'Frescos Congelados', en: 'Frozen Fresh Products' },
	{ slug: 'productos-pre-cocidos', es: 'Precocidos', en: 'Pre-cooked' },
	{ slug: 'productos-costa-rica', es: 'Productos Costa Rica', en: 'Costa Rican Products' },
	{ slug: 'frutas-congeladas', es: 'Frutas Congeladas', en: 'Frozen Fruits' },
	{ slug: 'productos-pre-fritos', es: 'Prefritos', en: 'Pre-fried' },
	{ slug: 'pulpas-de-frutas', es: 'Pulpas de Fruta', en: 'Fruit Pulps' },
	{ slug: 'pulpas-mix-de-frutas', es: 'Pulpas Mix de Frutas', en: 'Mixed Fruit Pulps' },
	{ slug: 'masas-listas', es: 'Productos de Panadería', en: 'Bakery Products' },
];
