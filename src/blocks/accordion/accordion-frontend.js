/**
 * fk-accordion — Frontend runtime.
 *
 * WCAG 2.1 AA compliant:
 * - <button> triggers with aria-expanded
 * - aria-controls linking to panel IDs
 * - role="region" on panels with aria-labelledby
 * - Keyboard: Enter/Space (native button), arrow keys between items, Home/End
 * - Focus visible indicators via CSS
 * - prefers-reduced-motion respected via CSS
 * - 44px minimum touch targets
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 */
(function () {
	'use strict';

	function initAccordion(container) {
		var allowMultiple = container.dataset.allowMultiple === 'true';
		var defaultOpen = parseInt(container.dataset.defaultOpen, 10);
		var items = container.querySelectorAll('[data-fk-accordion-item]');
		var headers = container.querySelectorAll('.fk-accordion-item__header');

		function openItem(item) {
			var header = item.querySelector('.fk-accordion-item__header');
			var panel = item.querySelector('.fk-accordion-item__panel');
			if (!header || !panel) return;

			item.classList.add('is-open');
			header.setAttribute('aria-expanded', 'true');
			panel.removeAttribute('hidden');
		}

		function closeItem(item) {
			var header = item.querySelector('.fk-accordion-item__header');
			var panel = item.querySelector('.fk-accordion-item__panel');
			if (!header || !panel) return;

			item.classList.remove('is-open');
			header.setAttribute('aria-expanded', 'false');
			panel.setAttribute('hidden', '');
		}

		function toggleItem(item) {
			var isOpen = item.classList.contains('is-open');

			if (!allowMultiple) {
				items.forEach(function (other) {
					if (other !== item) closeItem(other);
				});
			}

			if (isOpen) {
				closeItem(item);
			} else {
				openItem(item);
			}
		}

		headers.forEach(function (header) {
			header.addEventListener('click', function () {
				var item = header.closest('[data-fk-accordion-item]');
				if (item) toggleItem(item);
			});
		});

		container.addEventListener('keydown', function (e) {
			var target = e.target;
			if (!target.classList.contains('fk-accordion-item__header')) return;

			var headerArray = Array.from(headers);
			var index = headerArray.indexOf(target);
			if (index === -1) return;

			var newIndex = -1;

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					newIndex = (index + 1) % headerArray.length;
					break;

				case 'ArrowUp':
					e.preventDefault();
					newIndex = (index - 1 + headerArray.length) % headerArray.length;
					break;

				case 'Home':
					e.preventDefault();
					newIndex = 0;
					break;

				case 'End':
					e.preventDefault();
					newIndex = headerArray.length - 1;
					break;
			}

			if (newIndex >= 0) {
				headerArray[newIndex].focus();
			}
		});

		if (defaultOpen >= 0 && defaultOpen < items.length) {
			openItem(items[defaultOpen]);
		}

		items.forEach(function (item) {
			if (item.classList.contains('is-open')) {
				var panel = item.querySelector('.fk-accordion-item__panel');
				if (panel) panel.removeAttribute('hidden');
			}
		});
	}

	function init() {
		var accordions = document.querySelectorAll('[data-fk-accordion]');
		accordions.forEach(initAccordion);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
