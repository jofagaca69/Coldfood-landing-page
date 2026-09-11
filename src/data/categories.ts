/**
 * Categorías de producto de Coldfood. Fuente única para el desplegable del
 * navbar y, más adelante, para el JSON completo de productos: cada producto
 * futuro debería referenciar uno de estos `slug` en su campo `categorySlug`.
 *
 * Nombres verificados contra el catálogo oficial del cliente (Canva ES/EN),
 * no traducidos a mano.
 */

export interface Category {
	slug: string;
	es: string;
	en: string;
}

export const CATEGORIES: Category[] = [
	{ slug: 'productos-frescos', es: 'Productos Frescos', en: 'Fresh Products' },
	{ slug: 'productos-pre-cocidos', es: 'Productos Pre-cocidos', en: 'Pre-cooked Products' },
	{ slug: 'productos-costa-rica', es: 'Productos Costa Rica', en: 'Costa Rican Products' },
	{ slug: 'frutas-congeladas', es: 'Frutas Congeladas', en: 'Frozen Fruits' },
	{ slug: 'productos-pre-fritos', es: 'Productos Pre-fritos', en: 'Pre-fried Products' },
	{ slug: 'pulpas-de-frutas', es: 'Pulpas de Frutas', en: 'Frozen Fruit Pulps' },
	{ slug: 'pulpas-mix-de-frutas', es: 'Pulpas Mix de Frutas', en: 'Mixed Fruit Pulps' },
	{ slug: 'masas-listas', es: 'Masas Listas', en: 'Ready-to-Use Doughs' },
];
