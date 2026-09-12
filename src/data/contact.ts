/**
 * Datos de contacto de la empresa. Fuente única: cualquier componente o
 * página que necesite teléfono, WhatsApp, correo, dirección o redes debe
 * importar desde aquí, nunca hardcodear el dato de nuevo.
 *
 * El nombre legal de la empresa NO vive aquí: es `SITE.legalName` en
 * `src/consts.ts` (fuente única de marca), reutilizado por `JsonLd.astro`.
 *
 * Consumidores previstos: `Header.astro` (CTA de WhatsApp), `Footer.astro`,
 * la página `/contacto/` y el futuro `LocalBusiness` de `JsonLd.astro`.
 */

/** Líneas de contacto del footer: etiqueta + WhatsApp + correo. */
export const CONTACT_LINES = [
	{
		labelKey: 'footer.line.comercial',
		number: '573508852633',
		display: '+57 350 885 2633',
		email: 'administracion@precocidoscoldfood.com',
	},
	{
		labelKey: 'footer.line.export',
		number: '573007974993',
		display: '+57 300 797 4993',
		email: 'comercioexterior@precocidoscoldfood.com',
	},
] as const;

export const CONTACT = {
	/** Solo dígitos con indicativo de país, formato E.164 sin "+", para wa.me. */
	whatsapp: CONTACT_LINES[0].number,
	/** Versión legible para mostrar en pantalla. */
	whatsappDisplay: CONTACT_LINES[0].display,

	phone: CONTACT_LINES[0].display,

	email: CONTACT_LINES[0].email,
	pqrsEmail: CONTACT_LINES[1].email,

	address: {
		// TODO: dirección real de la planta u oficina.
		street: 'Carrera 104b #18-59',
		city: 'Bogotá',
		region: 'Departamento Ejemplo',
		country: 'CO',
		postalCode: '000000',
	},

	// TODO: horario real de atención.
	hours: 'Lunes a viernes, 8:00 a 17:00',

	social: {
		instagram: 'https://www.instagram.com/coldfood_precocidos/',
		linkedin: 'https://www.linkedin.com/company/coldfood/',
	},
} as const;

/**
 * Arma un enlace de WhatsApp Click to Chat con mensaje precargado.
 * `message` debe venir ya traducido (ver `ui.ts` -> `whatsapp.message`).
 * `number` permite apuntar a una línea concreta del footer; por defecto
 * usa el WhatsApp principal (`CONTACT.whatsapp`).
 */
export function getWhatsAppUrl(message?: string, number: string = CONTACT.whatsapp): string {
	const base = `https://wa.me/${number}`;
	return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
