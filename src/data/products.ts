/**
 * Catálogo completo de productos de Coldfood: nombre, descripciones corta y
 * larga, características, variantes (peso/presentación + unidades por caja),
 * configuración de carga y galería — en ES y EN.
 *
 * Fuente: CatálogoCongelados2026.pdf (ES) y ProductCatalogColdFood2026.pdf
 * (EN), catálogos oficiales del cliente. Los pesos, presentaciones y
 * unidades por caja son literales del catálogo; las descripciones
 * (`shortDescription`/`longDescription`) son copy redactado a partir de esos
 * mismos datos y de los sellos reales del empaque, no texto del cliente.
 *
 * Cada producto referencia una categoría de `./categories` por `categorySlug`,
 * tal como anticipa el comentario de ese archivo.
 */

import type { Category } from './categories';

// ---------------------------------------------------------------------------
// Configuración de carga (estiba)
// ---------------------------------------------------------------------------

/**
 * Las dos configuraciones de estiba que trae el catálogo (página
 * "CONFIGURACIÓN DE CARGA" / "LOAD CONFIGURATION"), sin indicar qué producto
 * usa cuál.
 *
 * TODO: confirmar con el cliente la asignación de `loadConfigId` por
 * variante. Regla tentativa usada abajo: la caja de mayor huella (12/30/12
 * disp/6 und por caja) va en `palet-100`; la de menor huella (24/50 und por
 * caja) va en `palet-110`.
 */
export type LoadConfigId = 'palet-110' | 'palet-100';

export interface LoadConfig {
	id: LoadConfigId;
	boxesPerLayer: number;
	layers: number;
	totalBoxes: number;
	/** Composición de un piso, tal como la dibuja el catálogo. */
	layout: { verticalBoxes: number; horizontalBoxes: number };
	es: { label: string; topView: string; frontView: string };
	en: { label: string; topView: string; frontView: string };
}

export const LOAD_CONFIGS: Record<LoadConfigId, LoadConfig> = {
	'palet-110': {
		id: 'palet-110',
		boxesPerLayer: 11,
		layers: 10,
		totalBoxes: 110,
		layout: { verticalBoxes: 8, horizontalBoxes: 3 },
		es: {
			label: 'Estiba de 110 cajas (11 cajas por piso × 10 pisos)',
			topView:
				'Vista superior: 8 cajas en posición vertical + 3 cajas en posición horizontal por piso (11 cajas por piso).',
			frontView: 'Vista frontal: 10 pisos de alto, 110 cajas en total.',
		},
		en: {
			label: '110-box pallet (11 boxes per layer × 10 layers)',
			topView:
				'Top view: 8 boxes standing vertically + 3 boxes laid horizontally per layer (11 boxes per layer).',
			frontView: 'Front view: 10 layers high, 110 boxes total.',
		},
	},
	'palet-100': {
		id: 'palet-100',
		boxesPerLayer: 10,
		layers: 10,
		totalBoxes: 100,
		layout: { verticalBoxes: 4, horizontalBoxes: 6 },
		es: {
			label: 'Estiba de 100 cajas (10 cajas por piso × 10 pisos)',
			topView:
				'Vista superior: 4 cajas en posición vertical + 6 cajas en posición horizontal por piso (10 cajas por piso).',
			frontView: 'Vista frontal: 10 pisos de alto, 100 cajas en total.',
		},
		en: {
			label: '100-box pallet (10 boxes per layer × 10 layers)',
			topView:
				'Top view: 4 boxes standing vertically + 6 boxes laid horizontally per layer (10 boxes per layer).',
			frontView: 'Front view: 10 layers high, 100 boxes total.',
		},
	},
};

export function getLoadConfig(id: LoadConfigId): LoadConfig {
	return LOAD_CONFIGS[id];
}

// ---------------------------------------------------------------------------
// Tipos de producto
// ---------------------------------------------------------------------------

export type PackFormat = 'bolsa' | 'doypack' | 'display' | 'garrafa';

export interface ProductVariant {
	/** Único dentro del producto: '500g', 'doypack-250g', 'garrafa-1100g'… */
	id: string;
	format: PackFormat;
	/** Peso neto principal impreso en el catálogo, en gramos. */
	netWeightG: number;
	/** Segundo peso impreso en el catálogo (p. ej. "454 gr"), si aplica. */
	drainedWeightG?: number;
	unitsPerBox: number;
	loadConfigId: LoadConfigId;
	/** Texto literal del catálogo: presentación + empaque, por idioma. */
	es: { presentation: string; packing: string };
	en: { presentation: string; packing: string };
}

export interface ProductImage {
	src: ImageMetadata;
	alt: { es: string; en: string };
}

export interface Product {
	slug: string;
	categorySlug: Category['slug'];
	es: { name: string; shortDescription: string; longDescription: string; features: string[] };
	en: { name: string; shortDescription: string; longDescription: string; features: string[] };
	variants: ProductVariant[];
	gallery: ProductImage[];
}

// ---------------------------------------------------------------------------
// Galería — imágenes extraídas de CatálogoCongelados2026.pdf con
// scripts/extract-catalog-images.mjs (ver comentario en ese script para el
// detalle del triaje). Rutas por convención: src/assets/products/<slug>.webp
// ---------------------------------------------------------------------------

const productImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/products/*.webp', {
	eager: true,
});

/** Basenames disponibles hoy en src/assets/products/ (sin extensión). */
type GalleryFile =
	| 'yuca-trozos-fresca'
	| 'yuca-astillas-fresca'
	| 'yuca-cassava-fresca'
	| 'platano-verde-entero-fresco'
	| 'papa-criolla-precocida'
	| 'yuca-astilla-precocida'
	| 'mix-ajiaco-precocido'
	| 'mix-sancocho-precocido'
	| 'arracacha-precocida'
	| 'mazorca-trozos-precocida'
	| 'tostones-platano-verde'
	| 'tajadas-platano-maduro-prefrita'
	| 'platanos-maduros-enteros'
	| 'yuca-francesa-prefrita'
	| 'yuca-croqueta-prefrita'
	| 'cubitos-platano-maduro-prefrito'
	| 'mora-congelada'
	| 'tomate-arbol-congelado'
	| 'lulo-congelado'
	| 'lulo-chunks-congelado'
	| 'fresas-congeladas'
	| 'pina-congelada'
	| 'guayaba-chunks-congelada'
	| 'pandebonos-prehorneados';

/** Resuelve un archivo de la galería; si falta, no rompe el build (array vacío). */
function gallery(file: GalleryFile, alt: { es: string; en: string }): ProductImage[] {
	const mod = productImages[`/src/assets/products/${file}.webp`];
	if (!mod) return [];
	return [{ src: mod.default, alt }];
}

// ---------------------------------------------------------------------------
// Variantes reutilizables (misma presentación en varios productos)
// ---------------------------------------------------------------------------

const V_500_1000 = (): ProductVariant[] => [
	{
		id: '500g',
		format: 'bolsa',
		netWeightG: 500,
		drainedWeightG: 454,
		unitsPerBox: 24,
		loadConfigId: 'palet-110',
		es: { presentation: '500 g | 454 g', packing: '24 Und x Caja' },
		en: { presentation: '500 g | 454 g', packing: '24 Units/Box' },
	},
	{
		id: '1000g',
		format: 'bolsa',
		netWeightG: 1000,
		drainedWeightG: 908,
		unitsPerBox: 12,
		loadConfigId: 'palet-100',
		es: { presentation: '1000 g | 908 g', packing: '12 Und x Caja' },
		en: { presentation: '1000 g | 908 g', packing: '12 Units/Box' },
	},
];

const V_500_ONLY = (unitsPerBox: number): ProductVariant[] => [
	{
		id: '500g',
		format: 'bolsa',
		netWeightG: 500,
		drainedWeightG: 454,
		unitsPerBox,
		loadConfigId: 'palet-110',
		es: { presentation: '500 g | 454 g', packing: `${unitsPerBox} Und x Caja` },
		en: { presentation: '500 g | 454 g', packing: `${unitsPerBox} Units/Box` },
	},
];

const V_1000_ONLY = (): ProductVariant[] => [
	{
		id: '1000g',
		format: 'bolsa',
		netWeightG: 1000,
		drainedWeightG: 908,
		unitsPerBox: 12,
		loadConfigId: 'palet-100',
		es: { presentation: '1000 g | 908 g', packing: '12 Und x Caja' },
		en: { presentation: '1000 g | 908 g', packing: '12 Units/box' },
	},
];

const V_COSTA_RICA = (): ProductVariant[] => [
	{
		id: '2500g',
		format: 'bolsa',
		netWeightG: 2500,
		unitsPerBox: 30,
		loadConfigId: 'palet-100',
		es: { presentation: '2500 g', packing: '30 Lb x Caja' },
		en: { presentation: '2,500 g (30 lb)', packing: '30 lb/Box' },
	},
];

const V_PULPA = (hasGarrafa: boolean): ProductVariant[] => {
	const base: ProductVariant[] = [
		{
			id: 'doypack-250g',
			format: 'doypack',
			netWeightG: 250,
			drainedWeightG: 397,
			unitsPerBox: 50,
			loadConfigId: 'palet-110',
			es: { presentation: '250 g | 397 g', packing: '50 Und x Caja | 30 Und x Caja' },
			en: { presentation: '250 g | 397 g', packing: '50 Units/box | 30 Units/box' },
		},
		{
			id: 'display-1000g',
			format: 'display',
			netWeightG: 1000,
			drainedWeightG: 900,
			unitsPerBox: 12,
			loadConfigId: 'palet-100',
			es: {
				presentation: '1000 g (10 ud x 100 g) | 900 g (10 ud x 90 g)',
				packing: '12 disp x Caja',
			},
			en: {
				presentation: '1,000 g (10 units x 100 g) | 900 g (10 units x 90 g)',
				packing: '12 packs/box',
			},
		},
	];
	if (hasGarrafa) {
		base.push({
			id: 'garrafa-1100g',
			format: 'garrafa',
			netWeightG: 1100,
			unitsPerBox: 6,
			loadConfigId: 'palet-100',
			es: { presentation: '1.1 kg (946 ml)', packing: '6 Und x Caja' },
			en: { presentation: '1.1 kg (946 ml)', packing: '6 Units/box' },
		});
	}
	return base;
};

const V_MASA = (unitsPerBag: 5 | 6): ProductVariant[] => [
	{
		id: `${unitsPerBag}x200g`,
		format: 'bolsa',
		netWeightG: unitsPerBag * 200,
		unitsPerBox: 24,
		loadConfigId: 'palet-110',
		es: { presentation: `${unitsPerBag} Und x 200 g`, packing: '24 Und x Caja' },
		en: { presentation: `${unitsPerBag} units x 200 g`, packing: '24 Units/box' },
	},
];

// ---------------------------------------------------------------------------
// Características por familia de producto (derivadas de los sellos reales
// del empaque — 100% natural, sin conservantes, lista para consumir, sin
// azúcares añadidos — no inventadas).
// ---------------------------------------------------------------------------

const F_FRESCO = { es: ['100% natural', 'sin conservantes', 'lista para cocinar'], en: ['100% natural', 'no preservatives', 'ready to cook'] };
const F_PRECOCIDO = { es: ['100% natural', 'sin conservantes', 'precocida'], en: ['100% natural', 'no preservatives', 'pre-cooked'] };
const F_COSTA_RICA_SUFFIX_ES = 'presentación de exportación (30 lb)';
const F_COSTA_RICA_SUFFIX_EN = 'export presentation (30 lb)';
const F_CONGELADA = { es: ['100% natural', 'sin conservantes', 'lista para consumir'], en: ['100% natural', 'no preservatives', 'ready-to-eat'] };
const F_PREFRITO = { es: ['pre-frito'], en: ['pre-fried'] };
const F_PULPA = { es: ['100% natural', 'sin azúcares añadidos', 'sin conservantes'], en: ['100% natural', 'no added sugars', 'no preservatives'] };

// ---------------------------------------------------------------------------
// Catálogo de productos, en el orden de CATEGORIES (src/data/categories.ts)
// ---------------------------------------------------------------------------

export const PRODUCTS: Product[] = [
	// --- productos-frescos ---------------------------------------------------
	{
		slug: 'yuca-trozos-fresca',
		categorySlug: 'productos-frescos',
		es: {
			name: 'Yuca en Trozos Fresca',
			shortDescription: 'Yuca fresca pelada y cortada en trozos, lista para cocinar sin mermas ni tiempo de pelado.',
			longDescription:
				'Yuca 100% natural, sin conservantes, pelada y cortada en trozos uniformes listos para ir directo a la olla. Reduce tiempos de preparación en cocina y minimiza desperdicio frente a la yuca sin procesar. Pensada para distribuidores, supermercados y food service que necesitan un insumo estable todo el año.',
			features: F_FRESCO.es,
		},
		en: {
			name: 'Fresh Cassava Pieces',
			shortDescription: 'Peeled fresh cassava cut into pieces, ready to cook straight from the bag.',
			longDescription:
				'100% natural cassava with no preservatives, peeled and cut into even pieces ready to go straight into the pot. It cuts kitchen prep time and reduces waste compared to raw, unpeeled cassava. Built for distributors, supermarkets and food service operators who need a stable supply year-round.',
			features: F_FRESCO.en,
		},
		variants: V_500_1000(),
		gallery: gallery('yuca-trozos-fresca', {
			es: 'Empaque de Yuca en Trozos Fresca Coldfood, 500 g',
			en: 'Coldfood Fresh Cassava Pieces pack, 500 g',
		}),
	},
	{
		slug: 'yuca-astillas-fresca',
		categorySlug: 'productos-frescos',
		es: {
			name: 'Yuca en Astillas Fresca',
			shortDescription: 'Yuca fresca pelada y cortada en astillas finas, ideal para frituras y guarniciones rápidas.',
			longDescription:
				'Yuca 100% natural, sin conservantes, cortada en astillas finas que agilizan la preparación de frituras, purés y guarniciones. Mantiene la textura y el sabor de la yuca recién pelada gracias a la cadena de frío. Ideal para restaurantes y distribuidores que buscan un corte uniforme y listo para usar.',
			features: F_FRESCO.es,
		},
		en: {
			name: 'Fresh Cassava Sticks',
			shortDescription: 'Peeled fresh cassava cut into thin sticks, ideal for frying and quick side dishes.',
			longDescription:
				'100% natural cassava with no preservatives, cut into thin sticks that speed up frying, mashing and side-dish prep. The cold chain keeps the texture and flavor of freshly peeled cassava intact. Ideal for restaurants and distributors that need a consistent, ready-to-use cut.',
			features: F_FRESCO.en,
		},
		variants: V_500_1000(),
		gallery: gallery('yuca-astillas-fresca', {
			es: 'Empaque de Yuca en Astillas Fresca Coldfood, 500 g',
			en: 'Coldfood Fresh Cassava Sticks pack, 500 g',
		}),
	},
	{
		slug: 'yuca-cassava-fresca',
		categorySlug: 'productos-frescos',
		es: {
			name: 'Yuca Cassava Fresca',
			shortDescription: 'Yuca cassava fresca, pelada y lista para cocinar en preparaciones tradicionales.',
			longDescription:
				'Yuca cassava 100% natural, sin conservantes, pelada y lista para cocinar tal como llega de la planta. Conserva la textura firme que exigen el sancocho, la sopa y las preparaciones fritas. Una opción práctica para distribuidores y food service que trabajan con altos volúmenes de yuca fresca.',
			features: F_FRESCO.es,
		},
		en: {
			name: 'Fresh Cassava',
			shortDescription: 'Peeled fresh whole cassava, ready to cook in traditional dishes.',
			longDescription:
				'100% natural cassava with no preservatives, peeled and ready to cook straight out of the bag. It keeps the firm texture that soups, stews and fried dishes need. A practical choice for distributors and food service operations working with high volumes of fresh cassava.',
			features: F_FRESCO.en,
		},
		variants: V_500_1000(),
		gallery: gallery('yuca-cassava-fresca', {
			es: 'Empaque de Yuca Cassava Fresca Coldfood, 500 g',
			en: 'Coldfood Fresh Cassava pack, 500 g',
		}),
	},
	{
		slug: 'platano-verde-entero-fresco',
		categorySlug: 'productos-frescos',
		es: {
			name: 'Plátano Verde Entero Fresco',
			shortDescription: 'Plátano verde entero, fresco y pelado, listo para cocinar, hornear o freír.',
			longDescription:
				'Plátano verde 100% natural, sin conservantes, pelado y entero, listo para cocinar en cualquier preparación tradicional colombiana. Ahorra el tiempo de pelado en cocina y mantiene una maduración estable gracias a la cadena de frío. Ideal para distribuidores y restaurantes que preparan tajadas, patacones o sancocho a diario.',
			features: F_FRESCO.es,
		},
		en: {
			name: 'Fresh Whole Green Plantain',
			shortDescription: 'Whole peeled fresh green plantain, ready to cook, bake or fry.',
			longDescription:
				'100% natural green plantain with no preservatives, peeled and whole, ready to cook in any traditional Colombian dish. It saves peeling time in the kitchen and keeps a stable ripeness thanks to the cold chain. Ideal for distributors and restaurants that prepare plantain slices, patacones or sancocho every day.',
			features: F_FRESCO.en,
		},
		variants: V_500_ONLY(12),
		gallery: gallery('platano-verde-entero-fresco', {
			es: 'Empaque de Plátano Verde Entero Fresco Coldfood, 500 g',
			en: 'Coldfood Fresh Whole Green Plantain pack, 500 g',
		}),
	},

	// --- productos-pre-cocidos -------------------------------------------------
	{
		slug: 'papa-criolla-precocida',
		categorySlug: 'productos-pre-cocidos',
		es: {
			name: 'Papa Criolla Precocida',
			shortDescription: 'Papa criolla precocida, lista para saltear, hornear o terminar de freír en minutos.',
			longDescription:
				'Papa criolla 100% natural, sin conservantes, precocida para reducir el tiempo de cocción en cocina hasta en la mitad. Conserva su sabor y textura característicos, lista para saltear, hornear o dorar como acompañamiento o entrada. Pensada para restaurantes y food service que necesitan servir rápido sin perder calidad.',
			features: F_PRECOCIDO.es,
		},
		en: {
			name: 'Pre-cooked Yellow Potato',
			shortDescription: 'Pre-cooked Colombian yellow potato, ready to sauté, bake or finish frying in minutes.',
			longDescription:
				'100% natural yellow potato (papa criolla) with no preservatives, pre-cooked to cut kitchen time roughly in half. It keeps its signature flavor and texture, ready to sauté, bake or crisp up as a side or starter. Built for restaurants and food service operations that need to plate fast without losing quality.',
			features: F_PRECOCIDO.en,
		},
		variants: V_500_1000(),
		gallery: gallery('papa-criolla-precocida', {
			es: 'Empaque de Papa Criolla Precocida Coldfood, 500 g',
			en: 'Coldfood Pre-cooked Yellow Potato pack, 500 g',
		}),
	},
	{
		slug: 'yuca-astilla-precocida',
		categorySlug: 'productos-pre-cocidos',
		es: {
			name: 'Yuca en Astilla Precocida',
			shortDescription: 'Yuca precocida cortada en astillas, lista para freír o dorar en pocos minutos.',
			longDescription:
				'Yuca 100% natural, sin conservantes, precocida y cortada en astillas para acortar el tiempo de fritura o horneado. Llega lista para terminar la cocción manteniendo una textura suave por dentro y dorada por fuera. Ideal para cocinas de alto volumen que necesitan consistencia plato a plato.',
			features: F_PRECOCIDO.es,
		},
		en: {
			name: 'Pre-cooked Cassava Sticks',
			shortDescription: 'Pre-cooked cassava sticks, ready to fry or crisp up in just a few minutes.',
			longDescription:
				'100% natural cassava with no preservatives, pre-cooked and cut into sticks to shorten frying or baking time. It arrives ready to finish cooking, staying soft inside and golden outside. Ideal for high-volume kitchens that need consistency from plate to plate.',
			features: F_PRECOCIDO.en,
		},
		variants: V_500_1000(),
		gallery: gallery('yuca-astilla-precocida', {
			es: 'Empaque de Yuca en Astilla Precocida Coldfood, 500 g',
			en: 'Coldfood Pre-cooked Cassava Sticks pack, 500 g',
		}),
	},
	{
		slug: 'mix-ajiaco-precocido',
		categorySlug: 'productos-pre-cocidos',
		es: {
			name: 'Mix de Ajiaco Precocido',
			shortDescription: 'Mezcla precocida de papas y mazorca lista para armar un ajiaco en minutos.',
			longDescription:
				'Mix 100% natural, sin conservantes, con la combinación de papas y mazorca que pide el ajiaco santafereño, ya precocida y porcionada. Elimina el trabajo de pelar y cortar varios tubérculos por separado, ideal para cocinas que sirven este plato a diario. Pensado para restaurantes, hoteles y comedores institucionales.',
			features: F_PRECOCIDO.es,
		},
		en: {
			name: 'Pre-cooked Vegetable Mix (Ajiaco)',
			shortDescription: 'Pre-cooked potato and corn mix, ready to build an ajiaco in minutes.',
			longDescription:
				'100% natural mix with no preservatives, combining the potatoes and corn that Colombian ajiaco calls for, already pre-cooked and portioned. It removes the work of peeling and cutting several root vegetables separately, ideal for kitchens that serve this dish daily. Built for restaurants, hotels and institutional dining rooms.',
			features: F_PRECOCIDO.en,
		},
		variants: V_1000_ONLY(),
		gallery: gallery('mix-ajiaco-precocido', {
			es: 'Empaque de Mix de Ajiaco Precocido Coldfood, 1000 g',
			en: 'Coldfood Pre-cooked Vegetable Mix (Ajiaco) pack, 1000 g',
		}),
	},
	{
		slug: 'mix-sancocho-precocido',
		categorySlug: 'productos-pre-cocidos',
		es: {
			name: 'Mix de Sancocho Precocido',
			shortDescription: 'Mezcla precocida de tubérculos y mazorca lista para un sancocho tradicional.',
			longDescription:
				'Mix 100% natural, sin conservantes, con yuca, papa, mazorca y demás tubérculos que lleva el sancocho colombiano, ya precocidos y porcionados. Reduce el tiempo de preparación de un plato que normalmente exige pelar y cortar varios ingredientes por separado. Ideal para restaurantes y comedores que sirven sancocho con frecuencia.',
			features: F_PRECOCIDO.es,
		},
		en: {
			name: 'Pre-cooked Vegetable Mix (Sancocho)',
			shortDescription: 'Pre-cooked root vegetable and corn mix, ready for a traditional sancocho.',
			longDescription:
				'100% natural mix with no preservatives, combining cassava, potato, corn and the other root vegetables that Colombian sancocho calls for, already pre-cooked and portioned. It cuts the prep time of a dish that normally requires peeling and cutting several ingredients separately. Ideal for restaurants and dining rooms that serve sancocho often.',
			features: F_PRECOCIDO.en,
		},
		variants: V_1000_ONLY(),
		gallery: gallery('mix-sancocho-precocido', {
			es: 'Empaque de Mix de Sancocho Precocido Coldfood, 1000 g',
			en: 'Coldfood Pre-cooked Vegetable Mix (Sancocho) pack, 1000 g',
		}),
	},
	{
		slug: 'arracacha-precocida',
		categorySlug: 'productos-pre-cocidos',
		es: {
			name: 'Arracacha Precocida',
			shortDescription: 'Arracacha precocida y cortada, lista para sopas, purés o guarniciones.',
			longDescription:
				'Arracacha 100% natural, sin conservantes, precocida y cortada para ahorrar el tiempo de pelado y cocción de esta raíz andina. Conserva su sabor característico y su textura, lista para sopas, purés o como guarnición salteada. Una opción práctica para distribuidores y cocinas que quieren ofrecer variedad sin complicar la operación.',
			features: F_PRECOCIDO.es,
		},
		en: {
			name: 'Pre-cooked Arracacha',
			shortDescription: 'Pre-cooked, cut arracacha, ready for soups, mash or side dishes.',
			longDescription:
				'100% natural arracacha with no preservatives, pre-cooked and cut to save the peeling and cooking time this Andean root normally takes. It keeps its signature flavor and texture, ready for soups, mash or a sautéed side. A practical option for distributors and kitchens that want to offer variety without complicating the operation.',
			features: F_PRECOCIDO.en,
		},
		variants: V_500_1000(),
		gallery: gallery('arracacha-precocida', {
			es: 'Empaque de Arracacha Precocida Coldfood, 500 g',
			en: 'Coldfood Pre-cooked Arracacha pack, 500 g',
		}),
	},
	{
		slug: 'mazorca-trozos-precocida',
		categorySlug: 'productos-pre-cocidos',
		es: {
			name: 'Mazorca en Trozos Precocida',
			shortDescription: 'Mazorca precocida en trozos, lista para sopas, sancochos o guarniciones.',
			longDescription:
				'Mazorca 100% natural, sin conservantes, precocida y cortada en trozos listos para incorporar directamente a sopas, sancochos o como guarnición. Ahorra el tiempo de desgranado y cocción, manteniendo el dulzor característico del maíz fresco. Ideal para cocinas que preparan grandes volúmenes de sopas tradicionales.',
			features: F_PRECOCIDO.es,
		},
		en: {
			name: 'Pre-cooked Corn Chunks',
			shortDescription: 'Pre-cooked corn chunks, ready for soups, stews or side dishes.',
			longDescription:
				'100% natural corn with no preservatives, pre-cooked and cut into chunks ready to go straight into soups, stews or as a side. It saves the time of husking and cooking whole corn, while keeping the sweetness of fresh corn. Ideal for kitchens preparing large volumes of traditional soups.',
			features: F_PRECOCIDO.en,
		},
		variants: V_500_1000(),
		gallery: gallery('mazorca-trozos-precocida', {
			es: 'Empaque de Mazorca en Trozos Precocida Coldfood, 500 g',
			en: 'Coldfood Pre-cooked Corn Chunks pack, 500 g',
		}),
	},

	// --- productos-costa-rica ----------------------------------------------
	// Mismos productos de "productos-frescos" y "productos-pre-cocidos", en
	// presentación de exportación de 2.500 g / 30 lb por caja. El catálogo EN
	// no actualizó esta sección (mantiene 500g/1000g) — se usa el dato ES.
	// TODO: confirmar con el cliente si el formato de 30 lb aplica a otros
	// destinos de exportación además de Costa Rica.
	{
		slug: 'yuca-trozos-fresca-cr',
		categorySlug: 'productos-costa-rica',
		es: {
			name: 'Yuca en Trozos Fresca (Costa Rica)',
			shortDescription: 'Yuca fresca en trozos, empacada en presentación de exportación de 30 libras para el mercado de Costa Rica.',
			longDescription:
				'La misma yuca en trozos 100% natural y sin conservantes, empacada en el formato de exportación de 2.500 g (30 lb por caja) que usamos para el mercado de Costa Rica. Pensada para distribuidores que reciben pedidos consolidados y necesitan menos cajas por el mismo volumen.',
			features: [...F_FRESCO.es, F_COSTA_RICA_SUFFIX_ES],
		},
		en: {
			name: 'Fresh Cassava Pieces (Costa Rica)',
			shortDescription: 'Fresh cassava pieces packed in a 30 lb export format for the Costa Rican market.',
			longDescription:
				'The same 100% natural cassava pieces with no preservatives, packed in the 2,500 g (30 lb per box) export format we use for the Costa Rican market. Built for distributors handling consolidated orders who need fewer boxes for the same volume.',
			features: [...F_FRESCO.en, F_COSTA_RICA_SUFFIX_EN],
		},
		variants: V_COSTA_RICA(),
		gallery: gallery('yuca-trozos-fresca', {
			es: 'Empaque de Yuca en Trozos Fresca Coldfood, presentación de exportación',
			en: 'Coldfood Fresh Cassava Pieces pack, export format',
		}),
	},
	{
		slug: 'yuca-astillas-fresca-cr',
		categorySlug: 'productos-costa-rica',
		es: {
			name: 'Yuca en Astillas Fresca (Costa Rica)',
			shortDescription: 'Yuca fresca en astillas, empacada en presentación de exportación de 30 libras para el mercado de Costa Rica.',
			longDescription:
				'Las mismas astillas de yuca 100% natural y sin conservantes, empacadas en el formato de exportación de 2.500 g (30 lb por caja) que usamos para el mercado de Costa Rica. Reduce la cantidad de cajas a manejar en pedidos de gran volumen.',
			features: [...F_FRESCO.es, F_COSTA_RICA_SUFFIX_ES],
		},
		en: {
			name: 'Fresh Cassava Sticks (Costa Rica)',
			shortDescription: 'Fresh cassava sticks packed in a 30 lb export format for the Costa Rican market.',
			longDescription:
				'The same 100% natural cassava sticks with no preservatives, packed in the 2,500 g (30 lb per box) export format we use for the Costa Rican market. It reduces the number of boxes to handle on large-volume orders.',
			features: [...F_FRESCO.en, F_COSTA_RICA_SUFFIX_EN],
		},
		variants: V_COSTA_RICA(),
		gallery: gallery('yuca-astillas-fresca', {
			es: 'Empaque de Yuca en Astillas Fresca Coldfood, presentación de exportación',
			en: 'Coldfood Fresh Cassava Sticks pack, export format',
		}),
	},
	{
		slug: 'yuca-cassava-fresca-cr',
		categorySlug: 'productos-costa-rica',
		es: {
			name: 'Yuca Cassava Fresca (Costa Rica)',
			shortDescription: 'Yuca cassava fresca, empacada en presentación de exportación de 30 libras para el mercado de Costa Rica.',
			longDescription:
				'La misma yuca cassava 100% natural y sin conservantes, empacada en el formato de exportación de 2.500 g (30 lb por caja) que usamos para el mercado de Costa Rica. Facilita la logística de pedidos consolidados hacia Centroamérica.',
			features: [...F_FRESCO.es, F_COSTA_RICA_SUFFIX_ES],
		},
		en: {
			name: 'Fresh Cassava (Costa Rica)',
			shortDescription: 'Fresh whole cassava packed in a 30 lb export format for the Costa Rican market.',
			longDescription:
				'The same 100% natural whole cassava with no preservatives, packed in the 2,500 g (30 lb per box) export format we use for the Costa Rican market. It simplifies logistics for consolidated orders into Central America.',
			features: [...F_FRESCO.en, F_COSTA_RICA_SUFFIX_EN],
		},
		variants: V_COSTA_RICA(),
		gallery: gallery('yuca-cassava-fresca', {
			es: 'Empaque de Yuca Cassava Fresca Coldfood, presentación de exportación',
			en: 'Coldfood Fresh Cassava pack, export format',
		}),
	},
	{
		slug: 'yuca-astilla-precocida-cr',
		categorySlug: 'productos-costa-rica',
		es: {
			name: 'Yuca en Astilla Precocida (Costa Rica)',
			shortDescription: 'Yuca precocida en astillas, empacada en presentación de exportación de 30 libras para el mercado de Costa Rica.',
			longDescription:
				'Las mismas astillas de yuca precocida 100% natural y sin conservantes, empacadas en el formato de exportación de 2.500 g (30 lb por caja) que usamos para el mercado de Costa Rica. Llega lista para freír u hornear, ahorrando pasos en cocina.',
			features: [...F_PRECOCIDO.es, F_COSTA_RICA_SUFFIX_ES],
		},
		en: {
			name: 'Pre-cooked Cassava Sticks (Costa Rica)',
			shortDescription: 'Pre-cooked cassava sticks packed in a 30 lb export format for the Costa Rican market.',
			longDescription:
				'The same 100% natural pre-cooked cassava sticks with no preservatives, packed in the 2,500 g (30 lb per box) export format we use for the Costa Rican market. It arrives ready to fry or bake, saving steps in the kitchen.',
			features: [...F_PRECOCIDO.en, F_COSTA_RICA_SUFFIX_EN],
		},
		variants: V_COSTA_RICA(),
		gallery: gallery('yuca-astilla-precocida', {
			es: 'Empaque de Yuca en Astilla Precocida Coldfood, presentación de exportación',
			en: 'Coldfood Pre-cooked Cassava Sticks pack, export format',
		}),
	},

	// --- frutas-congeladas ---------------------------------------------------
	{
		slug: 'mora-congelada',
		categorySlug: 'frutas-congeladas',
		es: {
			name: 'Mora Congelada',
			shortDescription: 'Mora congelada 100% natural, lista para jugos, postres o salsas sin necesidad de lavarla.',
			longDescription:
				'Mora 100% natural, sin conservantes y lista para consumir, congelada en su punto justo de maduración para conservar sabor y color. Se usa directo del congelador en jugos, batidos, postres o salsas, sin lavado previo. Ideal para restaurantes, heladerías y distribuidores que necesitan fruta disponible todo el año.',
			features: F_CONGELADA.es,
		},
		en: {
			name: 'Frozen Blackberry',
			shortDescription: '100% natural frozen blackberries, ready for juices, desserts or sauces with no washing needed.',
			longDescription:
				'100% natural blackberries with no preservatives, ready-to-eat, frozen at peak ripeness to lock in flavor and color. They go straight from the freezer into juices, smoothies, desserts or sauces, no prior washing required. Ideal for restaurants, ice cream shops and distributors that need fruit available year-round.',
			features: F_CONGELADA.en,
		},
		variants: V_500_1000(),
		gallery: gallery('mora-congelada', {
			es: 'Empaque de Mora Congelada Coldfood, 500 g',
			en: 'Coldfood Frozen Blackberry pack, 500 g',
		}),
	},
	{
		slug: 'tomate-arbol-congelado',
		categorySlug: 'frutas-congeladas',
		es: {
			name: 'Tomate de Árbol Congelado',
			shortDescription: 'Tomate de árbol congelado 100% natural, listo para jugos y salsas agridulces.',
			longDescription:
				'Tomate de árbol 100% natural, sin conservantes y listo para consumir, congelado para mantener su acidez y color característicos todo el año. Perfecto para preparar el tradicional jugo de tomate de árbol, ajíes y salsas agridulces sin depender de la cosecha. Pensado para distribuidores y food service que buscan estabilidad de suministro.',
			features: F_CONGELADA.es,
		},
		en: {
			name: 'Frozen Tamarillo',
			shortDescription: '100% natural frozen tamarillo, ready for juices and sweet-and-sour sauces.',
			longDescription:
				"100% natural tamarillo with no preservatives, ready-to-eat, frozen to keep its signature tartness and color year-round. Perfect for the traditional tamarillo juice, hot sauces and sweet-and-sour sauces without depending on the harvest. Built for distributors and food service operators that need supply stability.",
			features: F_CONGELADA.en,
		},
		variants: V_500_1000(),
		gallery: gallery('tomate-arbol-congelado', {
			es: 'Empaque de Tomate de Árbol Congelado Coldfood, 500 g',
			en: 'Coldfood Frozen Tamarillo pack, 500 g',
		}),
	},
	{
		slug: 'lulo-congelado',
		categorySlug: 'frutas-congeladas',
		es: {
			name: 'Lulo Congelado',
			shortDescription: 'Lulo entero congelado 100% natural, listo para jugos y sorbetes con su sabor tradicional.',
			longDescription:
				'Lulo entero 100% natural, sin conservantes y listo para consumir, congelado para conservar su acidez y aroma característicos. Se usa directo del congelador para preparar el tradicional jugo de lulo, sorbetes o coctelería. Ideal para restaurantes, bares y distribuidores que buscan un insumo estable durante todo el año.',
			features: F_CONGELADA.es,
		},
		en: {
			name: 'Frozen Whole Lulo',
			shortDescription: '100% natural frozen whole lulo, ready for juices and sorbets with its traditional flavor.',
			longDescription:
				'100% natural whole lulo with no preservatives, ready-to-eat, frozen to preserve its signature tartness and aroma. It goes straight from the freezer into the traditional lulo juice, sorbets or cocktails. Ideal for restaurants, bars and distributors that need a stable supply year-round.',
			features: F_CONGELADA.en,
		},
		variants: V_500_1000(),
		gallery: gallery('lulo-congelado', {
			es: 'Empaque de Lulo Congelado Coldfood, 500 g',
			en: 'Coldfood Frozen Whole Lulo pack, 500 g',
		}),
	},
	{
		slug: 'lulo-chunks-congelado',
		categorySlug: 'frutas-congeladas',
		es: {
			name: 'Lulo Chunks Congelado',
			shortDescription: 'Lulo troceado y congelado 100% natural, listo para licuar sin pelar ni cortar.',
			longDescription:
				'Lulo 100% natural, sin conservantes y listo para consumir, congelado ya troceado para ahorrar el paso de pelar y cortar la fruta. Se lleva directo del congelador a la licuadora para jugos, sorbetes o mezclas de coctelería. Pensado para cocinas de alto volumen que necesitan agilidad en la preparación.',
			features: F_CONGELADA.es,
		},
		en: {
			name: 'Frozen Lulo Chunks',
			shortDescription: '100% natural frozen lulo chunks, ready to blend with no peeling or cutting needed.',
			longDescription:
				'100% natural lulo with no preservatives, ready-to-eat, frozen already chunked to skip the peeling and cutting step. It goes straight from the freezer into the blender for juices, sorbets or cocktail mixes. Built for high-volume kitchens that need speed in prep.',
			features: F_CONGELADA.en,
		},
		variants: V_500_1000(),
		gallery: gallery('lulo-chunks-congelado', {
			es: 'Empaque de Lulo Chunks Congelado Coldfood, 500 g',
			en: 'Coldfood Frozen Lulo Chunks pack, 500 g',
		}),
	},
	{
		slug: 'fresas-congeladas',
		categorySlug: 'frutas-congeladas',
		es: {
			name: 'Fresas Congeladas',
			shortDescription: 'Fresas congeladas 100% natural, listas para postres, jugos o coberturas sin lavarlas.',
			longDescription:
				'Fresas 100% natural, sin conservantes y listas para consumir, congeladas enteras para conservar su color y dulzor. Se usan directo del congelador en postres, jugos, batidos o coberturas, sin necesidad de lavado previo. Ideal para heladerías, panaderías y distribuidores que necesitan fruta disponible todo el año.',
			features: F_CONGELADA.es,
		},
		en: {
			name: 'Frozen Strawberries',
			shortDescription: '100% natural frozen strawberries, ready for desserts, juices or toppings with no washing needed.',
			longDescription:
				'100% natural strawberries with no preservatives, ready-to-eat, frozen whole to keep their color and sweetness. They go straight from the freezer into desserts, juices, smoothies or toppings, no prior washing required. Ideal for ice cream shops, bakeries and distributors that need fruit available year-round.',
			features: F_CONGELADA.en,
		},
		variants: V_500_1000(),
		gallery: gallery('fresas-congeladas', {
			es: 'Empaque de Fresas Congeladas Coldfood, 500 g',
			en: 'Coldfood Frozen Strawberries pack, 500 g',
		}),
	},
	{
		slug: 'pina-congelada',
		categorySlug: 'frutas-congeladas',
		es: {
			name: 'Piña Congelada',
			shortDescription: 'Piña troceada y congelada 100% natural, lista para jugos, postres o coctelería.',
			longDescription:
				'Piña 100% natural, sin conservantes y lista para consumir, congelada en trozos para ahorrar el pelado y corte de la fruta fresca. Se usa directo del congelador en jugos, postres, coctelería o guarniciones. Ideal para restaurantes, bares y distribuidores que necesitan un insumo estable todo el año.',
			features: F_CONGELADA.es,
		},
		en: {
			name: 'Frozen Pineapple',
			shortDescription: '100% natural frozen pineapple chunks, ready for juices, desserts or cocktails.',
			longDescription:
				'100% natural pineapple with no preservatives, ready-to-eat, frozen in chunks to skip peeling and cutting fresh fruit. It goes straight from the freezer into juices, desserts, cocktails or side dishes. Ideal for restaurants, bars and distributors that need a stable supply year-round.',
			features: F_CONGELADA.en,
		},
		variants: V_500_1000(),
		gallery: gallery('pina-congelada', {
			es: 'Empaque de Piña Congelada Coldfood, 500 g',
			en: 'Coldfood Frozen Pineapple pack, 500 g',
		}),
	},
	{
		slug: 'guayaba-chunks-congelada',
		categorySlug: 'frutas-congeladas',
		es: {
			name: 'Guayaba Congelada Chunks',
			shortDescription: 'Guayaba troceada y congelada 100% natural, lista para jugos, dulces o mermeladas.',
			longDescription:
				'Guayaba 100% natural, sin conservantes y lista para consumir, congelada en trozos para ahorrar el pelado y corte de la fruta fresca. Se usa directo del congelador en jugos, dulces, mermeladas o postres tradicionales. Pensada para distribuidores y food service que buscan disponibilidad todo el año.',
			features: F_CONGELADA.es,
		},
		en: {
			name: 'Frozen Guava Chunks',
			shortDescription: '100% natural frozen guava chunks, ready for juices, sweets or jams.',
			longDescription:
				'100% natural guava with no preservatives, ready-to-eat, frozen in chunks to skip peeling and cutting fresh fruit. It goes straight from the freezer into juices, sweets, jams or traditional desserts. Built for distributors and food service operators that need year-round availability.',
			features: F_CONGELADA.en,
		},
		variants: V_500_1000(),
		gallery: gallery('guayaba-chunks-congelada', {
			es: 'Empaque de Guayaba Congelada Chunks Coldfood, 500 g',
			en: 'Coldfood Frozen Guava Chunks pack, 500 g',
		}),
	},
	{
		slug: 'guayaba-entera-congelada',
		categorySlug: 'frutas-congeladas',
		es: {
			name: 'Guayaba Entera Congelada',
			shortDescription: 'Guayaba entera congelada 100% natural, lista para jugos, dulces o mermeladas.',
			longDescription:
				'Guayaba entera 100% natural, sin conservantes y lista para consumir, congelada para conservar su aroma y textura características. Se usa directo del congelador en jugos, dulces, mermeladas o postres tradicionales, cortándola al gusto de cada preparación. Ideal para distribuidores y food service que buscan disponibilidad todo el año.',
			features: F_CONGELADA.es,
		},
		en: {
			name: 'Frozen Guava',
			shortDescription: '100% natural whole frozen guava, ready for juices, sweets or jams.',
			longDescription:
				"100% natural whole guava with no preservatives, ready-to-eat, frozen to preserve its signature aroma and texture. It goes straight from the freezer into juices, sweets, jams or traditional desserts, cut to fit each recipe. Ideal for distributors and food service operators that need year-round availability.",
			features: F_CONGELADA.en,
		},
		variants: V_500_1000(),
		gallery: [],
	},

	// --- productos-pre-fritos ------------------------------------------------
	{
		slug: 'tostones-platano-verde',
		categorySlug: 'productos-pre-fritos',
		es: {
			name: 'Tostones de Plátano Verde',
			shortDescription: 'Tostones de plátano verde pre-fritos, listos para terminar de dorar en minutos.',
			longDescription:
				'Tostones de plátano verde estilo hawaiano, pre-fritos y listos para terminar de dorar en freidora u horno en pocos minutos. Conservan el crocante característico del tostón recién hecho sin el trabajo de aplastar y freír el plátano desde cero. Ideal para restaurantes y food service que sirven porciones rápidas y consistentes.',
			features: F_PREFRITO.es,
		},
		en: {
			name: 'Fried Green Plantain (Tostones)',
			shortDescription: 'Pre-fried green plantain tostones, ready to crisp up in minutes.',
			longDescription:
				'Hawaiian-style green plantain tostones, pre-fried and ready to finish crisping in a fryer or oven in just a few minutes. They keep the crunch of freshly made tostones without the work of flattening and frying plantain from scratch. Ideal for restaurants and food service operators serving fast, consistent portions.',
			features: F_PREFRITO.en,
		},
		variants: V_500_ONLY(24),
		gallery: gallery('tostones-platano-verde', {
			es: 'Empaque de Tostones de Plátano Verde Coldfood, 500 g',
			en: 'Coldfood Fried Green Plantain (Tostones) pack, 500 g',
		}),
	},
	{
		slug: 'tajadas-platano-maduro-prefrita',
		categorySlug: 'productos-pre-fritos',
		es: {
			name: 'Tajadas de Plátano Maduro Prefritas',
			shortDescription: 'Tajadas de plátano maduro pre-fritas, listas para calentar y servir como guarnición.',
			longDescription:
				'Tajadas de plátano maduro pre-fritas, cortadas y listas para terminar de calentar en freidora u horno. Conservan el dulzor y la textura caramelizada típica de las tajadas recién hechas, con menos tiempo de cocina. Pensadas para restaurantes y comedores que sirven este acompañante a diario.',
			features: F_PREFRITO.es,
		},
		en: {
			name: 'Pre-fried Ripe Plantain Slices',
			shortDescription: 'Pre-fried ripe plantain slices, ready to heat and serve as a side dish.',
			longDescription:
				'Pre-fried ripe plantain slices, cut and ready to finish heating in a fryer or oven. They keep the sweetness and caramelized texture of freshly made slices, with far less kitchen time. Built for restaurants and dining rooms that serve this side dish every day.',
			features: F_PREFRITO.en,
		},
		variants: V_500_ONLY(24),
		gallery: gallery('tajadas-platano-maduro-prefrita', {
			es: 'Empaque de Tajadas de Plátano Maduro Prefritas Coldfood, 500 g',
			en: 'Coldfood Pre-fried Ripe Plantain Slices pack, 500 g',
		}),
	},
	{
		slug: 'platanos-maduros-enteros',
		categorySlug: 'productos-pre-fritos',
		es: {
			name: 'Plátanos Maduros Enteros Prefritos',
			shortDescription: 'Plátanos maduros enteros pre-fritos, listos para terminar de dorar y servir.',
			longDescription:
				'Plátanos maduros enteros, pre-fritos y listos para terminar de dorar en freidora u horno antes de servir. Mantienen el dulzor y el color dorado que caracteriza al plátano maduro bien frito, con menos tiempo de preparación. Ideal para restaurantes y food service que buscan un acompañante clásico listo en minutos.',
			features: F_PREFRITO.es,
		},
		en: {
			name: 'Pre-fried Whole Ripe Plantain',
			shortDescription: 'Pre-fried whole ripe plantains, ready to finish browning and serve.',
			longDescription:
				'Whole ripe plantains, pre-fried and ready to finish browning in a fryer or oven before serving. They keep the sweetness and golden color of well-fried ripe plantain, with much less prep time. Ideal for restaurants and food service operators that want a classic side ready in minutes.',
			features: F_PREFRITO.en,
		},
		variants: V_500_ONLY(24),
		gallery: gallery('platanos-maduros-enteros', {
			es: 'Empaque de Plátanos Maduros Enteros Coldfood, 500 g',
			en: 'Coldfood whole ripe plantains pack, 500 g',
		}),
	},
	{
		slug: 'yuca-francesa-prefrita',
		categorySlug: 'productos-pre-fritos',
		es: {
			name: 'Yuca Francesa Prefrita',
			shortDescription: 'Yuca francesa pre-frita, cortada en bastones, lista para dorar como las papas fritas.',
			longDescription:
				'Yuca cortada en bastones estilo francesa, pre-frita y lista para terminar de dorar en freidora u horno. Ofrece una alternativa crocante a la papa a la francesa, con el sabor característico de la yuca. Ideal para restaurantes y food service que buscan diversificar su carta de acompañamientos fritos.',
			features: F_PREFRITO.es,
		},
		en: {
			name: 'Pre-fried French Cassava',
			shortDescription: 'Pre-fried French-cut cassava, ready to crisp up like French fries.',
			longDescription:
				'Cassava cut into French-fry-style batons, pre-fried and ready to finish crisping in a fryer or oven. It offers a crunchy alternative to French fries, with the distinctive flavor of cassava. Ideal for restaurants and food service operators looking to diversify their fried side-dish menu.',
			features: F_PREFRITO.en,
		},
		variants: V_500_ONLY(24),
		gallery: gallery('yuca-francesa-prefrita', {
			es: 'Empaque de Yuca Francesa Prefrita Coldfood, 500 g',
			en: 'Coldfood Pre-fried French Cassava pack, 500 g',
		}),
	},
	{
		slug: 'yuca-croqueta-prefrita',
		categorySlug: 'productos-pre-fritos',
		es: {
			name: 'Yuca Croqueta Prefrita',
			shortDescription: 'Croquetas de yuca pre-fritas, listas para dorar y servir como pasabocas o guarnición.',
			longDescription:
				'Croquetas de yuca pre-fritas, listas para terminar de dorar en freidora u horno en pocos minutos. Mantienen un centro suave y un exterior crocante, ideales como pasabocas, entrada o guarnición. Pensadas para restaurantes y food service que necesitan una opción práctica y consistente.',
			features: F_PREFRITO.es,
		},
		en: {
			name: 'Pre-fried Cassava Croquettes',
			shortDescription: 'Pre-fried cassava croquettes, ready to crisp up as an appetizer or side.',
			longDescription:
				'Pre-fried cassava croquettes, ready to finish crisping in a fryer or oven in just a few minutes. They keep a soft center and a crunchy outside, great as an appetizer, starter or side dish. Built for restaurants and food service operators that need a practical, consistent option.',
			features: F_PREFRITO.en,
		},
		variants: V_500_ONLY(24),
		gallery: gallery('yuca-croqueta-prefrita', {
			es: 'Empaque de Yuca Croqueta Prefrita Coldfood, 1.000 g',
			en: 'Coldfood prefried cassava croquette pack, 1,000 g',
		}),
	},
	{
		slug: 'cubitos-platano-maduro-prefrito',
		categorySlug: 'productos-pre-fritos',
		es: {
			name: 'Cubitos de Plátano Maduro Prefritos',
			shortDescription: 'Cubitos de plátano maduro pre-fritos, listos para guarniciones, bowls o platos infantiles.',
			longDescription:
				'Plátano maduro cortado en cubitos, pre-frito y listo para terminar de calentar en freidora u horno. Su tamaño lo hace práctico para guarniciones, bowls, platos infantiles o como topping dulce. Ideal para restaurantes y food service que buscan formatos versátiles y de rápida preparación.',
			features: F_PREFRITO.es,
		},
		en: {
			name: 'Pre-fried Ripe Plantain Cubes',
			shortDescription: "Pre-fried ripe plantain cubes, ready for sides, bowls or kids' plates.",
			longDescription:
				"Ripe plantain cut into small cubes, pre-fried and ready to finish heating in a fryer or oven. Its size makes it practical for side dishes, bowls, kids' plates or a sweet topping. Ideal for restaurants and food service operators looking for versatile, fast-prep formats.",
			features: F_PREFRITO.en,
		},
		variants: V_500_ONLY(24),
		gallery: gallery('cubitos-platano-maduro-prefrito', {
			es: 'Empaque de Cubitos de Plátano Maduro Prefritos Coldfood, 500 g',
			en: 'Coldfood Pre-fried Ripe Plantain Cubes pack, 500 g',
		}),
	},

	// --- pulpas-de-frutas ------------------------------------------------------
	{
		slug: 'pulpa-guayaba',
		categorySlug: 'pulpas-de-frutas',
		es: {
			name: 'Pulpa de Guayaba Congelada',
			shortDescription: 'Pulpa de guayaba 100% natural, sin azúcar añadida, lista para licuar en segundos.',
			longDescription:
				'Pulpa de guayaba 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar su sabor y color como fruta recién procesada. Se descongela y licua en segundos para jugos, batidos o postres, sin pelar ni cortar fruta. Disponible en doypack, display de 10 unidades o garrafa, según el volumen que necesite tu negocio.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Guava Pulp',
			shortDescription: '100% natural guava pulp with no added sugar, ready to blend in seconds.',
			longDescription:
				"100% natural guava pulp with no added sugars or preservatives, frozen to keep the flavor and color of freshly processed fruit. It thaws and blends in seconds for juices, smoothies or desserts, with no peeling or cutting needed. Available in doypack, a 10-unit display or a jug, depending on the volume your business needs.",
			features: F_PULPA.en,
		},
		variants: V_PULPA(false),
		gallery: [],
	},
	{
		slug: 'pulpa-maracuya',
		categorySlug: 'pulpas-de-frutas',
		es: {
			name: 'Pulpa de Maracuyá Congelada',
			shortDescription: 'Pulpa de maracuyá 100% natural, sin azúcar añadida, lista para jugos y postres.',
			longDescription:
				'Pulpa de maracuyá 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar la acidez y el aroma característicos de la fruta. Lista para descongelar y usar en jugos, salsas, postres o coctelería sin necesidad de extraer la pulpa a mano. Disponible en doypack, display de 10 unidades o garrafa de 1.1 kg.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Passion Fruit Pulp',
			shortDescription: '100% natural passion fruit pulp with no added sugar, ready for juices and desserts.',
			longDescription:
				"100% natural passion fruit pulp with no added sugars or preservatives, frozen to keep the fruit's signature tartness and aroma. Ready to thaw and use in juices, sauces, desserts or cocktails with no need to extract the pulp by hand. Available in doypack, a 10-unit display or a 1.1 kg jug.",
			features: F_PULPA.en,
		},
		variants: V_PULPA(true),
		gallery: [],
	},
	{
		slug: 'pulpa-papaya',
		categorySlug: 'pulpas-de-frutas',
		es: {
			name: 'Pulpa de Papaya Congelada',
			shortDescription: 'Pulpa de papaya 100% natural, sin azúcar añadida, lista para jugos y batidos.',
			longDescription:
				'Pulpa de papaya 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar su textura y dulzor natural. Lista para descongelar y usar en jugos, batidos o postres sin pelar ni licuar fruta fresca. Disponible en doypack o display de 10 unidades, según el volumen que necesite tu negocio.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Papaya Pulp',
			shortDescription: '100% natural papaya pulp with no added sugar, ready for juices and smoothies.',
			longDescription:
				'100% natural papaya pulp with no added sugars or preservatives, frozen to keep its natural texture and sweetness. Ready to thaw and use in juices, smoothies or desserts with no peeling or blending fresh fruit required. Available in doypack or a 10-unit display, depending on the volume your business needs.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(false),
		gallery: [],
	},
	{
		slug: 'pulpa-guanabana',
		categorySlug: 'pulpas-de-frutas',
		es: {
			name: 'Pulpa de Guanábana Congelada',
			shortDescription: 'Pulpa de guanábana 100% natural, sin azúcar añadida, lista para jugos y postres cremosos.',
			longDescription:
				'Pulpa de guanábana 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar su textura cremosa y su sabor característico. Lista para descongelar y usar en jugos, batidos o postres sin el trabajo de despepitar la fruta fresca. Disponible en doypack, display de 10 unidades o garrafa de 1.1 kg.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Soursop Pulp',
			shortDescription: '100% natural soursop pulp with no added sugar, ready for juices and creamy desserts.',
			longDescription:
				'100% natural soursop pulp with no added sugars or preservatives, frozen to keep its creamy texture and signature flavor. Ready to thaw and use in juices, smoothies or desserts with no need to seed fresh fruit. Available in doypack, a 10-unit display or a 1.1 kg jug.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(true),
		gallery: [],
	},
	{
		slug: 'pulpa-fresa',
		categorySlug: 'pulpas-de-frutas',
		es: {
			name: 'Pulpa de Fresa Congelada',
			shortDescription: 'Pulpa de fresa 100% natural, sin azúcar añadida, lista para jugos, postres y coberturas.',
			longDescription:
				'Pulpa de fresa 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar su color y dulzor natural. Lista para descongelar y usar en jugos, batidos, postres o coberturas sin lavar ni cortar fruta fresca. Disponible en doypack o display de 10 unidades, según el volumen que necesite tu negocio.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Strawberry Pulp',
			shortDescription: '100% natural strawberry pulp with no added sugar, ready for juices, desserts and toppings.',
			longDescription:
				'100% natural strawberry pulp with no added sugars or preservatives, frozen to keep its natural color and sweetness. Ready to thaw and use in juices, smoothies, desserts or toppings with no washing or cutting fresh fruit required. Available in doypack or a 10-unit display, depending on the volume your business needs.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(false),
		gallery: [],
	},
	{
		slug: 'pulpa-lulo',
		categorySlug: 'pulpas-de-frutas',
		es: {
			name: 'Pulpa de Lulo Congelada',
			shortDescription: 'Pulpa de lulo 100% natural, sin azúcar añadida, lista para el tradicional jugo de lulo.',
			longDescription:
				'Pulpa de lulo 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar la acidez y el aroma que hacen único al jugo de lulo. Lista para descongelar y licuar sin pelar ni despepitar la fruta fresca. Disponible en doypack, display de 10 unidades o garrafa de 1.1 kg.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Lulo Pulp',
			shortDescription: '100% natural lulo pulp with no added sugar, ready for the traditional lulo juice.',
			longDescription:
				'100% natural lulo pulp with no added sugars or preservatives, frozen to keep the tartness and aroma that make lulo juice unique. Ready to thaw and blend with no peeling or seeding fresh fruit required. Available in doypack, a 10-unit display or a 1.1 kg jug.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(true),
		gallery: [],
	},
	{
		slug: 'pulpa-tomate-arbol',
		categorySlug: 'pulpas-de-frutas',
		es: {
			name: 'Pulpa de Tomate de Árbol Congelada',
			shortDescription: 'Pulpa de tomate de árbol 100% natural, sin azúcar añadida, lista para jugos y salsas.',
			longDescription:
				'Pulpa de tomate de árbol 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar su acidez característica. Lista para descongelar y usar en jugos, salsas agridulces o ajíes sin pelar fruta fresca. Disponible en doypack o display de 10 unidades, según el volumen que necesite tu negocio.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Tamarillo Pulp',
			shortDescription: '100% natural tamarillo pulp with no added sugar, ready for juices and sauces.',
			longDescription:
				'100% natural tamarillo pulp with no added sugars or preservatives, frozen to keep its signature tartness. Ready to thaw and use in juices, sweet-and-sour sauces or hot sauces with no peeling fresh fruit required. Available in doypack or a 10-unit display, depending on the volume your business needs.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(false),
		gallery: [],
	},
	{
		slug: 'pulpa-mora',
		categorySlug: 'pulpas-de-frutas',
		es: {
			name: 'Pulpa de Mora Congelada',
			shortDescription: 'Pulpa de mora 100% natural, sin azúcar añadida, lista para jugos, postres y salsas.',
			longDescription:
				'Pulpa de mora 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar su color intenso y su sabor característico. Lista para descongelar y usar en jugos, postres, salsas o coctelería sin lavar ni licuar fruta fresca. Disponible en doypack, display de 10 unidades o garrafa de 1.1 kg.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Blackberry Pulp',
			shortDescription: '100% natural blackberry pulp with no added sugar, ready for juices, desserts and sauces.',
			longDescription:
				'100% natural blackberry pulp with no added sugars or preservatives, frozen to keep its deep color and signature flavor. Ready to thaw and use in juices, desserts, sauces or cocktails with no washing or blending fresh fruit required. Available in doypack, a 10-unit display or a 1.1 kg jug.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(true),
		gallery: [],
	},
	{
		slug: 'pulpa-mango',
		categorySlug: 'pulpas-de-frutas',
		es: {
			name: 'Pulpa de Mango Congelada',
			shortDescription: 'Pulpa de mango 100% natural, sin azúcar añadida, lista para jugos, batidos y postres.',
			longDescription:
				'Pulpa de mango 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar su dulzor y aroma tropical. Lista para descongelar y usar en jugos, batidos, postres o coctelería sin pelar ni cortar fruta fresca. Disponible en doypack, display de 10 unidades o garrafa de 1.1 kg.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Mango Pulp',
			shortDescription: '100% natural mango pulp with no added sugar, ready for juices, smoothies and desserts.',
			longDescription:
				'100% natural mango pulp with no added sugars or preservatives, frozen to keep its sweetness and tropical aroma. Ready to thaw and use in juices, smoothies, desserts or cocktails with no peeling or cutting fresh fruit required. Available in doypack, a 10-unit display or a 1.1 kg jug.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(true),
		gallery: [],
	},
	{
		slug: 'pulpa-pina',
		categorySlug: 'pulpas-de-frutas',
		es: {
			name: 'Pulpa de Piña Congelada',
			shortDescription: 'Pulpa de piña 100% natural, sin azúcar añadida, lista para jugos, batidos y coctelería.',
			longDescription:
				'Pulpa de piña 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar su acidez y dulzor característicos. Lista para descongelar y usar en jugos, batidos o coctelería sin pelar ni cortar fruta fresca. Disponible en doypack o display de 10 unidades, según el volumen que necesite tu negocio.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Pineapple Pulp',
			shortDescription: '100% natural pineapple pulp with no added sugar, ready for juices, smoothies and cocktails.',
			longDescription:
				'100% natural pineapple pulp with no added sugars or preservatives, frozen to keep its signature tartness and sweetness. Ready to thaw and use in juices, smoothies or cocktails with no peeling or cutting fresh fruit required. Available in doypack or a 10-unit display, depending on the volume your business needs.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(false),
		gallery: [],
	},

	// --- pulpas-mix-de-frutas ---------------------------------------------------
	{
		slug: 'pulpa-mix-frutos-rojos',
		categorySlug: 'pulpas-mix-de-frutas',
		es: {
			name: 'Pulpa Mixta de Frutos Rojos Congelada',
			shortDescription: 'Mezcla de pulpas de frutos rojos 100% natural, sin azúcar añadida, lista para licuar.',
			longDescription:
				'Mezcla de pulpas de frutos rojos 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar su color intenso y su sabor equilibrado. Lista para descongelar y usar en jugos, batidos o postres sin combinar frutas por separado. Disponible en doypack, display de 10 unidades o garrafa de 1.1 kg.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Mixed Red Fruit Pulp',
			shortDescription: '100% natural mixed red fruit pulp with no added sugar, ready to blend.',
			longDescription:
				'A blend of 100% natural red fruit pulps with no added sugars or preservatives, frozen to keep its deep color and balanced flavor. Ready to thaw and use in juices, smoothies or desserts with no need to combine fruits separately. Available in doypack, a 10-unit display or a 1.1 kg jug.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(true),
		gallery: [],
	},
	{
		slug: 'pulpa-mix-frutos-amarillos',
		categorySlug: 'pulpas-mix-de-frutas',
		es: {
			name: 'Pulpa Mixta de Frutos Amarillos Congelada',
			shortDescription: 'Mezcla de pulpas de frutos amarillos 100% natural, sin azúcar añadida, lista para licuar.',
			longDescription:
				'Mezcla de pulpas de frutos amarillos 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar su sabor tropical y su color vibrante. Lista para descongelar y usar en jugos, batidos o postres sin combinar frutas por separado. Disponible en doypack, display de 10 unidades o garrafa de 1.1 kg.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Mixed Yellow Fruit Pulp',
			shortDescription: '100% natural mixed yellow fruit pulp with no added sugar, ready to blend.',
			longDescription:
				'A blend of 100% natural yellow fruit pulps with no added sugars or preservatives, frozen to keep its tropical flavor and vibrant color. Ready to thaw and use in juices, smoothies or desserts with no need to combine fruits separately. Available in doypack, a 10-unit display or a 1.1 kg jug.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(true),
		gallery: [],
	},
	{
		slug: 'pulpa-mix-pina-mango',
		categorySlug: 'pulpas-mix-de-frutas',
		es: {
			name: 'Pulpa Mixta de Piña-Mango Congelada',
			shortDescription: 'Mezcla de pulpa de piña y mango 100% natural, sin azúcar añadida, lista para licuar.',
			longDescription:
				'Mezcla de pulpas de piña y mango 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar el equilibrio entre la acidez de la piña y el dulzor del mango. Lista para descongelar y usar en jugos, batidos o coctelería sin combinar frutas por separado. Disponible en doypack, display de 10 unidades o garrafa de 1.1 kg.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Mixed Pineapple-Mango Pulp',
			shortDescription: '100% natural pineapple-mango pulp blend with no added sugar, ready to blend.',
			longDescription:
				"A blend of 100% natural pineapple and mango pulps with no added sugars or preservatives, frozen to keep the balance between pineapple's tartness and mango's sweetness. Ready to thaw and use in juices, smoothies or cocktails with no need to combine fruits separately. Available in doypack, a 10-unit display or a 1.1 kg jug.",
			features: F_PULPA.en,
		},
		variants: V_PULPA(true),
		gallery: [],
	},
	{
		slug: 'pulpa-mix-maracuya-mango',
		categorySlug: 'pulpas-mix-de-frutas',
		es: {
			name: 'Pulpa Mixta de Maracuyá-Mango Congelada',
			shortDescription: 'Mezcla de pulpa de maracuyá y mango 100% natural, sin azúcar añadida, lista para licuar.',
			longDescription:
				'Mezcla de pulpas de maracuyá y mango 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar el contraste entre la acidez de la maracuyá y el dulzor del mango. Lista para descongelar y usar en jugos, batidos o coctelería sin combinar frutas por separado. Disponible en doypack, display de 10 unidades o garrafa de 1.1 kg.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Passion Fruit-Mango Pulp',
			shortDescription: '100% natural passion fruit-mango pulp blend with no added sugar, ready to blend.',
			longDescription:
				"A blend of 100% natural passion fruit and mango pulps with no added sugars or preservatives, frozen to keep the contrast between passion fruit's tartness and mango's sweetness. Ready to thaw and use in juices, smoothies or cocktails with no need to combine fruits separately. Available in doypack, a 10-unit display or a 1.1 kg jug.",
			features: F_PULPA.en,
		},
		variants: V_PULPA(true),
		gallery: [],
	},
	{
		slug: 'pulpa-mix-mango-banano',
		categorySlug: 'pulpas-mix-de-frutas',
		es: {
			name: 'Pulpa Mixta de Mango-Banano Congelada',
			shortDescription: 'Mezcla de pulpa de mango y banano 100% natural, sin azúcar añadida, lista para licuar.',
			longDescription:
				'Mezcla de pulpas de mango y banano 100% natural, sin azúcares añadidos ni conservantes, congelada para conservar una textura suave y un sabor dulce equilibrado. Lista para descongelar y usar en jugos, batidos o postres sin combinar frutas por separado. Disponible en doypack, display de 10 unidades o garrafa de 1.1 kg.',
			features: F_PULPA.es,
		},
		en: {
			name: 'Frozen Mixed Mango-Banana Pulp',
			shortDescription: '100% natural mango-banana pulp blend with no added sugar, ready to blend.',
			longDescription:
				'A blend of 100% natural mango and banana pulps with no added sugars or preservatives, frozen to keep a smooth texture and balanced sweetness. Ready to thaw and use in juices, smoothies or desserts with no need to combine fruits separately. Available in doypack, a 10-unit display or a 1.1 kg jug.',
			features: F_PULPA.en,
		},
		variants: V_PULPA(true),
		gallery: [],
	},

	// --- masas-listas ----------------------------------------------------------
	{
		slug: 'pandebonos-prehorneados',
		categorySlug: 'masas-listas',
		es: {
			name: 'Pandebonos Pre-horneados',
			shortDescription: 'Pandebonos pre-horneados, listos para terminar en el horno en pocos minutos.',
			longDescription:
				'Pandebonos pre-horneados, listos para terminar de hornear y servir calientes en pocos minutos. Conservan la textura suave por dentro y la costra dorada característica del pandebono recién hecho. Ideal para panaderías, cafeterías y food service que buscan ofrecer producto fresco sin amasar desde cero.',
			features: ['pre-horneado'],
		},
		en: {
			name: 'Pre-Baked Pandebonos',
			shortDescription: 'Pre-baked pandebonos, ready to finish in the oven in just a few minutes.',
			longDescription:
				'Pre-baked pandebonos, ready to finish baking and serve warm in just a few minutes. They keep the soft inside and the golden crust that define a freshly made pandebono. Ideal for bakeries, cafés and food service operators that want fresh product without mixing dough from scratch.',
			features: ['pre-baked'],
		},
		variants: V_MASA(5),
		gallery: gallery('pandebonos-prehorneados', {
			es: 'Empaque de Pandebonos Pre-horneados Coldfood, 5 und x 200 g',
			en: 'Coldfood Pre-Baked Pandebonos pack, 5 units x 200 g',
		}),
	},
	{
		slug: 'almojabanas-tradicionales-prehorneadas',
		categorySlug: 'masas-listas',
		es: {
			name: 'Almojábanas Tradicionales Pre-horneadas',
			shortDescription: 'Almojábanas tradicionales pre-horneadas, listas para terminar en el horno en minutos.',
			longDescription:
				'Almojábanas tradicionales pre-horneadas, listas para terminar de hornear y servir calientes en pocos minutos. Mantienen la textura característica de queso y el dorado de la almojábana recién hecha. Ideal para panaderías, cafeterías y food service que buscan un producto de panadería tradicional sin amasar desde cero.',
			features: ['pre-horneada'],
		},
		en: {
			name: 'Traditional Pre-Baked Almojábanas',
			shortDescription: 'Traditional pre-baked almojábanas, ready to finish in the oven in minutes.',
			longDescription:
				'Traditional pre-baked almojábanas, ready to finish baking and serve warm in just a few minutes. They keep the signature cheesy texture and golden finish of a freshly made almojábana. Ideal for bakeries, cafés and food service operators that want a traditional bakery product without mixing dough from scratch.',
			features: ['pre-baked'],
		},
		variants: V_MASA(5),
		gallery: [],
	},
	{
		slug: 'bunuelos-para-freir',
		categorySlug: 'masas-listas',
		es: {
			name: 'Buñuelos para Freír',
			shortDescription: 'Buñuelos listos para freír, con la textura esponjosa tradicional en minutos.',
			longDescription:
				'Buñuelos listos para freír directo del congelador, sin necesidad de preparar la masa. Al freírlos desarrollan la textura esponjosa y dorada característica del buñuelo colombiano. Ideal para panaderías, cafeterías y food service que sirven este producto de temporada durante todo el año.',
			features: ['para freír'],
		},
		en: {
			name: 'Buñuelos – Ready to Fry',
			shortDescription: 'Ready-to-fry buñuelos, with the traditional fluffy texture in minutes.',
			longDescription:
				'Buñuelos ready to fry straight from the freezer, with no need to prepare the dough. Frying develops the fluffy, golden texture that defines a Colombian buñuelo. Ideal for bakeries, cafés and food service operators that serve this seasonal product year-round.',
			features: ['ready to fry'],
		},
		variants: V_MASA(6),
		gallery: [],
	},
	{
		slug: 'pandebonos-para-hornear',
		categorySlug: 'masas-listas',
		es: {
			name: 'Pandebonos para Hornear',
			shortDescription: 'Pandebonos crudos listos para hornear directo del congelador.',
			longDescription:
				'Pandebonos crudos, listos para hornear directo del congelador sin necesidad de preparar la masa. Desarrollan la textura suave y la costra dorada del pandebono recién horneado en tu propio punto de venta. Ideal para panaderías y cafeterías que quieren ofrecer producto horneado en el momento.',
			features: ['para hornear'],
		},
		en: {
			name: 'Pandebonos – Ready to Bake',
			shortDescription: 'Raw pandebonos, ready to bake straight from the freezer.',
			longDescription:
				'Raw pandebonos, ready to bake straight from the freezer with no need to prepare the dough. They develop the soft texture and golden crust of a freshly baked pandebono right at your point of sale. Ideal for bakeries and cafés that want to offer bake-at-the-moment product.',
			features: ['ready to bake'],
		},
		variants: V_MASA(6),
		gallery: [],
	},
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Productos de una categoría, en el orden en que aparecen en PRODUCTS. */
export function getProductsByCategory(categorySlug: Category['slug']): Product[] {
	return PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}

/** Ficha individual por slug, o `undefined` si no existe. */
export function getProductBySlug(slug: string): Product | undefined {
	return PRODUCTS.find((p) => p.slug === slug);
}
