function initHeroCarousel() {
	const root = document.querySelector<HTMLElement>('[data-hero-carousel]');
	if (!root) return;

	const track = root.querySelector<HTMLElement>('[data-carousel-track]');
	const slides = root.querySelectorAll<HTMLElement>('[data-carousel-slide]');
	const dots = root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]');
	const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
	const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
	if (!track || slides.length < 2 || !prev || !next) return;

	let index = 0;

	const go = (nextIndex: number) => {
		index = (nextIndex + slides.length) % slides.length;
		track.style.transform = `translateX(-${index * 100}%)`;
		slides.forEach((slide, i) => {
			slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
		});
		dots.forEach((dot, i) => {
			if (i === index) dot.setAttribute('aria-current', 'true');
			else dot.removeAttribute('aria-current');
		});
	};

	prev.addEventListener('click', () => go(index - 1));
	next.addEventListener('click', () => go(index + 1));
	dots.forEach((dot, i) => {
		dot.addEventListener('click', () => go(i));
	});

	root.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			go(index - 1);
		}
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			go(index + 1);
		}
	});
}

initHeroCarousel();
