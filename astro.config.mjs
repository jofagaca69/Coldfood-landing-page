// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.precocidoscoldfood.com',
	// URLs con slash final (p. ej. /en/) para que canónicas y sitemap sean consistentes
	build: { format: 'directory' },
	// Auto-hospedadas (variable fonts locales en src/assets/fonts/, ver licencias
	// en esas mismas carpetas). Cambiar la marca tipográfica = editar solo este
	// bloque + global.css.
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Montserrat',
			cssVariable: '--font-montserrat',
			fallbacks: ['system-ui', 'sans-serif'],
			options: {
				variants: [
					{
						weight: '100 900',
						style: 'normal',
						src: ['./src/assets/fonts/montserrat/Montserrat-Variable.woff2'],
					},
					{
						weight: '100 900',
						style: 'italic',
						src: ['./src/assets/fonts/montserrat/Montserrat-VariableItalic.woff2'],
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Satoshi',
			cssVariable: '--font-satoshi',
			fallbacks: ['system-ui', 'sans-serif'],
			options: {
				variants: [
					{
						weight: '300 900',
						style: 'normal',
						src: ['./src/assets/fonts/satoshi/Satoshi-Variable.woff2'],
					},
					{
						weight: '300 900',
						style: 'italic',
						src: ['./src/assets/fonts/satoshi/Satoshi-VariableItalic.woff2'],
					},
				],
			},
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
