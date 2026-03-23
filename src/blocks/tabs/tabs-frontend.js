/**
 * fk-tabs — frontend tab switching.
 *
 * WCAG 2.1 AA compliant:
 * - Follows WAI-ARIA Authoring Practices Tabs Pattern
 * - Keyboard: Arrow keys (orientation-aware), Home, End, Enter/Space
 * - Focus management: roving tabindex
 * - Screen reader: aria-selected, aria-controls, aria-labelledby, role
 * - Respects prefers-reduced-motion
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
(function () {
	'use strict';

	var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function initTabs(container) {
		var tabs = Array.from(container.querySelectorAll('[role="tab"]'));
		var panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));
		var tablist = container.querySelector('[role="tablist"]');

		if (!tabs.length || !panels.length || !tablist) return;

		var isVertical = tablist.getAttribute('aria-orientation') === 'vertical';

		function activate(index) {
			tabs.forEach(function (tab, i) {
				var active = i === index;
				tab.classList.toggle('fk-tabs__tab--active', active);
				tab.setAttribute('aria-selected', active ? 'true' : 'false');
				tab.setAttribute('tabindex', active ? '0' : '-1');
			});
			panels.forEach(function (panel, i) {
				var active = i === index;
				panel.classList.toggle('fk-tabs__panel--active', active);
				panel.hidden = !active;
			});
		}

		// Click activation.
		tabs.forEach(function (tab, i) {
			tab.addEventListener('click', function () {
				activate(i);
			});
		});

		// Keyboard navigation (orientation-aware per WAI-ARIA spec).
		tablist.addEventListener('keydown', function (e) {
			var target = e.target;
			if (target.getAttribute('role') !== 'tab') return;

			var current = tabs.indexOf(target);
			var next = -1;
			var len = tabs.length;

			// Horizontal: Left/Right. Vertical: Up/Down.
			var prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
			var nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

			switch (e.key) {
				case nextKey:
					next = (current + 1) % len;
					break;
				case prevKey:
					next = (current - 1 + len) % len;
					break;
				case 'Home':
					next = 0;
					break;
				case 'End':
					next = len - 1;
					break;
				case 'Enter':
				case ' ':
					// Activate current tab (for manual activation pattern).
					e.preventDefault();
					activate(current);
					return;
				default:
					return; // Don't prevent default for unhandled keys.
			}

			if (next >= 0) {
				e.preventDefault();
				activate(next);
				tabs[next].focus();
			}
		});

		// Allow Tab key to move from tablist into active panel.
		// (Default browser behavior handles this via tabindex="0" on panels.)
	}

	function init() {
		document.querySelectorAll('.fk-tabs').forEach(initTabs);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
