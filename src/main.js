import './styles/main.scss';

document.addEventListener('DOMContentLoaded', () => {
	// Header mobile menu toggle
	const toggles = document.querySelectorAll('.fk-header__toggle');

	toggles.forEach((toggle) => {
		toggle.addEventListener('click', () => {
			const header = toggle.closest('.fk-header');
			const expanded = toggle.getAttribute('aria-expanded') === 'true';

			toggle.setAttribute('aria-expanded', String(!expanded));
			header.classList.toggle('fk-header--menu-open', !expanded);
		});
	});

	// Close mobile menu on Escape
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			const openHeader = document.querySelector('.fk-header--menu-open');
			if (openHeader) {
				const toggle = openHeader.querySelector('.fk-header__toggle');
				toggle.setAttribute('aria-expanded', 'false');
				openHeader.classList.remove('fk-header--menu-open');
				toggle.focus();
			}
		}
	});

	// Dropdown keyboard handling
	document.querySelectorAll('.fk-header [aria-expanded]').forEach((link) => {
		if (link.classList.contains('fk-header__toggle')) return;

		link.addEventListener('click', (e) => {
			if (link.getAttribute('href') === '#') {
				e.preventDefault();
			}
			const expanded = link.getAttribute('aria-expanded') === 'true';
			link.setAttribute('aria-expanded', String(!expanded));
		});

		link.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				link.setAttribute('aria-expanded', 'false');
				link.focus();
			}
		});
	});
});
