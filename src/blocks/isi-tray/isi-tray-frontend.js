/**
 * fk-isi-tray — Frontend runtime.
 *
 * WCAG 2.1 AA compliant:
 * - role="complementary" landmark with aria-label
 * - aria-expanded on expand/collapse buttons
 * - aria-controls linking button to body region
 * - Keyboard: Escape to collapse
 * - Focus management: body region focusable when expanded
 * - prefers-reduced-motion: disables transitions via CSS
 * - 44px minimum touch targets
 *
 * Handles:
 * - Expand/collapse tray
 * - IntersectionObserver to auto-hide when full ISI is in viewport
 * - Auto-collapse on scroll when expanded
 * - Dynamic body padding to prevent content behind tray
 */
(function () {
	'use strict';

	var tray = null;
	var isi = null;
	var body = null;
	var expandBtn = null;
	var collapseBtn = null;
	var isExpanded = false;

	function getCollapsedHeight() {
		return parseInt(tray.dataset.collapsedHeight, 10) || 116;
	}

	function getExpandedHeight() {
		return parseInt(tray.dataset.expandedHeight, 10) || 300;
	}

	function getTrayHeight() {
		if (tray.classList.contains('tray-hidden')) return 0;
		return isExpanded ? getExpandedHeight() + 2 : getCollapsedHeight() + 2;
	}

	function syncPadding() {
		document.body.style.paddingBottom = getTrayHeight() + 'px';
	}

	function expand() {
		isExpanded = true;
		isi.className = 'fk-isi expanded';
		isi.style.height = getExpandedHeight() + 'px';
		expandBtn.style.display = 'none';
		expandBtn.setAttribute('aria-expanded', 'true');
		collapseBtn.style.display = '';
		collapseBtn.setAttribute('aria-expanded', 'true');
		collapseBtn.focus();

		if (body) {
			body.setAttribute('tabindex', '0');
		}

		syncPadding();
	}

	function collapse() {
		isExpanded = false;
		isi.className = 'fk-isi collapsed';
		isi.style.height = getCollapsedHeight() + 'px';
		expandBtn.style.display = '';
		expandBtn.setAttribute('aria-expanded', 'false');
		collapseBtn.style.display = 'none';
		collapseBtn.setAttribute('aria-expanded', 'false');

		if (body) {
			body.setAttribute('tabindex', '-1');
		}

		syncPadding();
	}

	function handleKeydown(e) {
		if (e.key === 'Escape' && isExpanded) {
			e.preventDefault();
			collapse();
			expandBtn.focus();
		}
	}

	function init() {
		tray = document.querySelector('[data-fk-isi-tray]');
		if (!tray) return;

		isi = tray.querySelector('.fk-isi');
		body = tray.querySelector('.fk-isi__body');
		expandBtn = tray.querySelector('.fk-isi__btn--expand');
		collapseBtn = tray.querySelector('.fk-isi__btn--collapse');

		if (expandBtn) expandBtn.addEventListener('click', expand);
		if (collapseBtn) collapseBtn.addEventListener('click', collapse);

		tray.addEventListener('keydown', handleKeydown);

		if (isi) isi.style.height = getCollapsedHeight() + 'px';

		// Auto-collapse on scroll when expanded
		var scrollTimer = null;
		window.addEventListener('scroll', function () {
			if (!isExpanded) return;
			if (scrollTimer) clearTimeout(scrollTimer);
			scrollTimer = setTimeout(function () {
				if (isExpanded) collapse();
			}, 150);
		}, { passive: true });

		// Watch the full ISI element — hide tray when it's in view
		var selector = tray.dataset.fullIsiSelector || '#full-isi';
		var fullIsi = null;

		try {
			fullIsi = document.querySelector(selector);
		} catch (e) {
			// Invalid selector
		}

		if (fullIsi) {
			var observer = new IntersectionObserver(function (entries) {
				var inView = entries[0].isIntersecting;

				if (inView) {
					tray.className = 'fk-isi-wrap tray-hidden';
					tray.setAttribute('aria-hidden', 'true');
					if (isExpanded) collapse();
				} else {
					tray.className = 'fk-isi-wrap tray-visible';
					tray.removeAttribute('aria-hidden');
				}

				syncPadding();
			}, { threshold: 0.1 });

			observer.observe(fullIsi);
		}

		syncPadding();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
