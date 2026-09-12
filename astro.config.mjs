// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.precocidoscoldfood.com',
	// URLs con slash final (p. ej. /en/) para que canónicas y sitemap sean consistentes
	build: { format: 'directory' },
	// Auto-hospedadas por Astro (subset, preload, fallback con métricas ajustadas).
	// Cambiar la marca tipográfica = editar solo este bloque + global.css.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Young Serif',
			cssVariable: '--font-young-serif',
			weights: [400],
			subsets: ['latin'],
			fallbacks: ['Georgia', 'serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Figtree',
			cssVariable: '--font-figtree',
			weights: ['400 700'],
			subsets: ['latin'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
	],
	i18n: {
		defaultLocale: 'es',
		locales: ['es', 'en'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	integrations: [
		sitemap({
			i18n: {
				defaultLocale: 'es',
				locales: {
					es: 'es',
					en: 'en',
				},
			},
			changefreq: 'weekly',
			priority: 0.7,
			lastmod: new Date(),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
