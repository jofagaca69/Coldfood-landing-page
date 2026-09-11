import { getRelativeLocaleUrl, getAbsoluteLocaleUrl } from 'astro:i18n';
import { SITE, type Locale } from '@/consts';
import { ui } from './ui';

/** Idioma activo con fallback seguro al idioma por defecto del sitio. */
export function resolveLocale(currentLocale: string | undefined): Locale {
	if (currentLocale && (SITE.locales as readonly string[]).includes(currentLocale)) {
		return currentLocale as Locale;
	}
	return SITE.defaultLocale;
}

/** Devuelve una función `t(key)` para traducir textos de interfaz. */
export function useTranslations(locale: Locale) {
	return function t(key: keyof (typeof ui)['es']): string {
		return ui[locale][key] ?? ui[SITE.defaultLocale][key];
	};
}

/** Ruta relativa localizada (p. ej. "/en/algo/"), apoyada en el helper de Astro. */
export function getLocalizedPath(path: string, locale: Locale): string {
	return getRelativeLocaleUrl(locale, path);
}

/** URL absoluta localizada, útil para hreflang y Open Graph. */
export function getLocalizedAbsoluteUrl(path: string, locale: Locale): string {
	return getAbsoluteLocaleUrl(locale, path);
}

/**
 * Quita el prefijo de locale de una pathname (p. ej. "/en/algo/" -> "/algo/").
 * El idioma por defecto no lleva prefijo (routing.prefixDefaultLocale: false),
 * así que solo hay que despojar el prefijo en locales no-default.
 * Necesario para reconstruir alternates hreflang a partir de Astro.url.pathname,
 * que ya viene con el prefijo del idioma activo incluido.
 */
export function getPathWithoutLocale(pathname: string, locale: Locale): string {
	if (locale === SITE.defaultLocale) return pathname;

	const prefix = `/${locale}`;
	if (pathname === prefix || pathname === `${prefix}/`) return '/';
	if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
	return pathname;
}
