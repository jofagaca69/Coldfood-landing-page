import { gsap } from 'gsap';

function initHeroAnimation() {
	const titleLines = gsap.utils.toArray<HTMLElement>('.hero-title-inner');
	const reveals = gsap.utils.toArray<HTMLElement>('.hero-reveal');
	const packs = gsap.utils.toArray<HTMLElement>('.hero-pack');
	// Orden de caída: la pieza que queda al fondo (B) primero, la que queda
	// al frente (C) al final, para que el aterrizaje se lea de atrás hacia adelante.
	const fallOrder = [...packs].sort(
		(a, b) => Number(a.dataset.fallDelay ?? 0) - Number(b.dataset.fallDelay ?? 0),
	);
	const floats = gsap.utils.toArray<HTMLElement>('.hero-pack-float');

	if (!titleLines.length && !packs.length) return;

	try {
		const mm = gsap.matchMedia();

		mm.add('(prefers-reduced-motion: no-preference)', () => {
			// El CSS ya arranca estos elementos en opacity:0 para evitar el flash
			// antes de que este script corra. gsap.set() fija el resto del estado
			// de partida como estilos inline: así el timeline anima hacia un valor
			// explícito (opacity:1, yPercent:0…) en vez de depender del valor
			// "actual" que ya está en 0 por la regla CSS, que es lo que pasaría
			// con .from() y dejaría todo invisible para siempre.
			gsap.set(titleLines, { yPercent: 100, opacity: 0 });
			gsap.set(fallOrder, { yPercent: -140, opacity: 0, rotation: (i: number) => (i % 2 === 0 ? -10 : 10) });
			gsap.set(reveals, { y: 16, opacity: 0 });

			const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

			tl.to(titleLines, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.09 }, 0)
				.to(
					fallOrder,
					{
						yPercent: 0,
						opacity: 1,
						rotation: 0,
						duration: 1,
						ease: 'back.out(1.15)',
						stagger: 0.13,
					},
					0.15,
				)
				.to(reveals, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07 }, 0.75);

			tl.eventCallback('onComplete', () => {
				floats.forEach((el, i) => {
					gsap.to(el, {
						y: -(14 + i * 3),
						rotation: i % 2 === 0 ? 0.8 : -0.8,
						duration: 3.4 + i * 0.5,
						ease: 'sine.inOut',
						yoyo: true,
						repeat: -1,
						delay: i * 0.35,
					});
				});
			});

			return () => {
				tl.kill();
			};
		});

		// Si el usuario cambia su preferencia de movimiento en vivo mientras la
		// página está abierta, deja todo en su posición final visible en vez de
		// a mitad de una animación cancelada.
		mm.add('(prefers-reduced-motion: reduce)', () => {
			gsap.set([...titleLines, ...reveals, ...packs, ...floats], { clearProps: 'all' });
		});
	} catch {
		// Si GSAP falla por cualquier razón, no dejamos nada invisible.
		document.documentElement.removeAttribute('data-hero-anim');
	}
}

initHeroAnimation();
