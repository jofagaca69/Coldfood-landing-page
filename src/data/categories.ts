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
	/**
	 * Párrafo breve de uso/manejo (para qué se usa, cómo se maneja, canal
	 * objetivo). Se escribe una sola vez por categoría y se reutiliza en cada
	 * ficha de producto (ProductDetail.astro) para dar profundidad de
	 * contenido sin repetir texto por las 47 referencias del catálogo.
	 */
	usage: { es: string; en: string };
}

export const CATEGORIES: Category[] = [
	{
		slug: 'productos-frescos',
		es: 'Frescos Congelados',
		en: 'Frozen Fresh Products',
		usage: {
			es: 'Materia prima congelada en fresco, sin cocción previa, para que el cliente controle el proceso final de cocción según su receta. Uso habitual en cocinas industriales, restaurantes y food service.',
			en: 'Raw produce frozen without pre-cooking, so the buyer controls the final cooking process to their own recipe. Common in industrial kitchens, restaurants and food service.',
		},
	},
	{
		slug: 'productos-pre-cocidos',
		es: 'Precocidos',
		en: 'Pre-cooked',
		usage: {
			es: 'Precocidos que reducen el tiempo de cocción en cocina hasta en la mitad, conservando sabor y textura. Pensados para food service y restaurantes que necesitan servir rápido sin perder calidad.',
			en: 'Pre-cooked products that cut kitchen cooking time roughly in half while keeping flavor and texture. Built for food service and restaurants that need to plate fast without losing quality.',
		},
	},
	{
		slug: 'productos-costa-rica',
		es: 'Productos Costa Rica',
		en: 'Costa Rican Products',
		usage: {
			es: 'Línea de yuca fresca y precocida empacada bajo las especificaciones del mercado de Costa Rica, con el mismo control de cadena de frío que el resto del catálogo.',
			en: 'Fresh and pre-cooked cassava line packed to Costa Rican market specifications, under the same cold-chain control as the rest of the catalog.',
		},
	},
	{
		slug: 'frutas-congeladas',
		es: 'Frutas Congeladas',
		en: 'Frozen Fruits',
		usage: {
			es: 'Fruta entera o en trozos, congelada en su punto óptimo de maduración para conservar sabor y valor nutricional. Uso en jugos, postres, panadería y food service.',
			en: 'Whole or chunked fruit, frozen at peak ripeness to preserve flavor and nutritional value. Used in juices, desserts, bakery and food service.',
		},
	},
	{
		slug: 'productos-pre-fritos',
		es: 'Prefritos',
		en: 'Pre-fried',
		usage: {
			es: 'Prefritos listos para terminar de freír u hornear en pocos minutos, dorados por fuera y suaves por dentro. Pensados para reducir tiempo y consumo de aceite en cocina.',
			en: 'Pre-fried products ready to finish frying or baking in a few minutes, crisp outside and soft inside. Built to cut kitchen time and oil use.',
		},
	},
	{
		slug: 'pulpas-de-frutas',
		es: 'Pulpas de Fruta',
		en: 'Fruit Pulps',
		usage: {
			es: 'Pulpa de fruta lista para preparar jugos, batidos y bases de coctelería, disponible en doypack y display individual.',
			en: 'Fruit pulp ready for juices, smoothies and cocktail bases, available in doypack and individual display packs.',
		},
	},
	{
		slug: 'pulpas-mix-de-frutas',
		es: 'Pulpas Mix de Frutas',
		en: 'Mixed Fruit Pulps',
		usage: {
			es: 'Mezclas de pulpas de dos frutas en una sola presentación, pensadas para ampliar el menú de jugos y bebidas sin sumar más referencias al inventario.',
			en: 'Two-fruit pulp blends in a single pack, built to expand a business’ juice and beverage menu without adding more SKUs to inventory.',
		},
	},
	{
		slug: 'masas-listas',
		es: 'Productos de Panadería',
		en: 'Bakery Products',
		usage: {
			es: 'Masas y productos de panadería precocidos o prehorneados, listos para hornear en el punto de venta y servir recién horneados.',
			en: 'Pre-cooked or par-baked dough products, ready to bake on-site and serve fresh out of the oven.',
		},
	},
];
