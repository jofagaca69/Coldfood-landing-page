/**
 * Datos de contacto de la empresa. Fuente única: cualquier componente o
 * página que necesite teléfono, WhatsApp, correo, dirección o redes debe
 * importar desde aquí, nunca hardcodear el dato de nuevo.
 *
 * El nombre legal de la empresa NO vive aquí: es `SITE.legalName` en
 * `src/consts.ts` (fuente única de marca), reutilizado por `JsonLd.astro`.
 *
 * Todos los valores son dummies fácilmente reconocibles (marcados con
 * `// TODO`) mientras el cliente entrega los datos reales. Cuando lleguen:
 * reemplazar solo los valores de este archivo, nada más depende de ellos
 * salvo a través de estas exportaciones.
 *
 * Consumidores previstos: `Header.astro` (CTA de WhatsApp), la futura página
 * `/contacto/` y el futuro `LocalBusiness` de `JsonLd.astro`.
 */

export const CONTACT = {
	/** Solo dígitos con indicativo de país, formato E.164 sin "+", para wa.me. */
	// TODO: reemplazar con el número real de WhatsApp de Coldfood.
	whatsapp: '570000000000',
	/** Versión legible para mostrar en pantalla. */
	// TODO: mantener sincronizado con `whatsapp` de arriba.
	whatsappDisplay: '+57 000 000 0000',

	// TODO: reemplazar con el teléfono fijo/celular real.
	phone: '+57 000 000 0000',

	// TODO: reemplazar con el correo real de contacto comercial.
	email: 'contacto@ejemplo.com',

	address: {
		// TODO: dirección real de la planta u oficina.
		street: 'Calle 00 # 00-00',
		city: 'Ciudad Ejemplo',
		region: 'Departamento Ejemplo',
		country: 'CO',
		postalCode: '000000',
	},

	// TODO: horario real de atención.
	hours: 'Lunes a viernes, 8:00 a 17:00',

	social: {
		// TODO: perfiles reales; dejar cadena vacía si no aplica.
		instagram: '',
		facebook: '',
		linkedin: '',
	},
} as const;

/**
 * Arma un enlace de WhatsApp Click to Chat con mensaje precargado.
 * `message` debe venir ya traducido (ver `ui.ts` -> `whatsapp.message`).
 */
export function getWhatsAppUrl(message?: string): string {
	const base = `https://wa.me/${CONTACT.whatsapp}`;
	return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
