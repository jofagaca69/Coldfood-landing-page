import { gsap } from 'gsap';

function initHeroAnimation() {
	const titleLines = gsap.utils.toArray<HTMLElement>('.hero-title-inner');
	const reveals = gsap.utils.toArray<HTMLElement>('.hero-reveal');

	if (!titleLines.length && !reveals.length) return;

	try {
		const mm = gsap.matchMedia();

		mm.add('(prefers-reduced-motion: no-preference)', () => {
			gsap.set(titleLines, { yPercent: 100, opacity: 0 });
			gsap.set(reveals, { y: 16, opacity: 0 });

			const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

			tl.to(titleLines, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.09 }, 0).to(
				reveals,
				{ y: 0, opacity: 1, duration: 0.6, stagger: 0.07 },
				0.2,
			);

			return () => {
				tl.kill();
			};
		});

		mm.add('(prefers-reduced-motion: reduce)', () => {
			gsap.set([...titleLines, ...reveals], { clearProps: 'all' });
		});
	} catch {
		document.documentElement.removeAttribute('data-hero-anim');
	}
}

initHeroAnimation();
