/**
 * fk-modal — Frontend runtime for modal block.
 *
 * Variants: hash, exit-intent, hcp-gate
 * WCAG 2.1 AA compliant: focus trap, escape, ARIA, 44px targets
 *
 * Public API: window.fkModal.open(id), window.fkModal.close()
 */
(function () {
	'use strict';

	const FOCUSABLE = [
		'a[href]',
		'button:not([disabled])',
		'input:not([disabled]):not([type="hidden"])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])',
	].join(', ');

	let activeModal = null;
	let triggerElement = null;

	// ----- Cookie helpers -----

	function getCookie(name) {
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return match ? match[2] : null;
	}

	function setCookie(name, value, days) {
		const d = new Date();
		d.setTime(d.getTime() + days * 86400000);
		document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
	}

	// ----- Focus management -----

	function trapFocus(e) {
		if (!activeModal) return;
		const focusable = Array.from(activeModal.querySelectorAll(FOCUSABLE));
		if (!focusable.length) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') {
			const canClose = activeModal && activeModal.dataset.closeEscape !== 'false';
			if (canClose) {
				e.preventDefault();
				closeModal();
			}
			return;
		}
		if (e.key === 'Tab') {
			trapFocus(e);
		}
	}

	// ----- Open / Close -----

	function openModal(modal) {
		if (activeModal) closeModal();

		activeModal = modal;
		modal.classList.add('fk-modal--open');
		document.body.classList.add('fk-modal-active');

		// Focus close button or first focusable
		const closeBtn = modal.querySelector('.fk-modal__close');
		const firstFocusable = modal.querySelector(FOCUSABLE);
		if (closeBtn) {
			closeBtn.focus();
		} else if (firstFocusable) {
			firstFocusable.focus();
		}

		modal.addEventListener('keydown', handleKeydown);
	}

	function closeModal() {
		if (!activeModal) return;

		activeModal.classList.remove('fk-modal--open');
		activeModal.removeEventListener('keydown', handleKeydown);
		document.body.classList.remove('fk-modal-active');

		// Clear hash without scrolling
		if (window.location.hash) {
			history.replaceState(null, '', window.location.pathname + window.location.search);
		}

		activeModal = null;

		if (triggerElement) {
			triggerElement.focus();
			triggerElement = null;
		}
	}

	// ----- Public API -----

	window.fkModal = {
		open: function (id) {
			const modal = document.getElementById(id);
			if (modal && modal.hasAttribute('data-fk-modal')) {
				openModal(modal);
			}
		},
		close: function () {
			closeModal();
		},
	};

	// ----- Init -----

	function init() {
		const modals = document.querySelectorAll('[data-fk-modal]');
		if (!modals.length) return;

		// Setup each modal
		modals.forEach(function (modal) {
			// Backdrop click
			const backdrop = modal.querySelector('.fk-modal__backdrop');
			if (backdrop) {
				backdrop.addEventListener('click', function () {
					if (modal.dataset.closeBackdrop !== 'false') {
						closeModal();
					}
				});
			}

			// Close button
			const closeBtn = modal.querySelector('.fk-modal__close');
			if (closeBtn) {
				closeBtn.addEventListener('click', closeModal);
			}

			// Auto-link aria-labelledby to first heading
			const heading = modal.querySelector('h1, h2, h3, h4, h5, h6');
			if (heading && !heading.id) {
				heading.id = modal.id + '-title';
				modal.setAttribute('aria-labelledby', heading.id);
			}
		});

		// ----- Hash variant -----

		// Intercept hash link clicks
		document.addEventListener('click', function (e) {
			var link = e.target.closest('a[href*="#"]');
			if (!link) return;

			var href = link.getAttribute('href');
			var hashIndex = href.indexOf('#');
			if (hashIndex === -1) return;

			var hash = href.substring(hashIndex);
			var target;
			try {
				target = document.querySelector(hash);
			} catch (err) {
				return;
			}

			if (target && target.hasAttribute('data-fk-modal') && target.dataset.variant === 'hash') {
				e.preventDefault();
				triggerElement = link;
				history.pushState(null, '', hash);
				openModal(target);
			}
		});

		// Handle hashchange (back/forward)
		window.addEventListener('hashchange', function () {
			var hash = window.location.hash;
			if (!hash) {
				closeModal();
				return;
			}
			var target;
			try {
				target = document.querySelector(hash);
			} catch (err) {
				return;
			}
			if (target && target.hasAttribute('data-fk-modal') && target.dataset.variant === 'hash') {
				openModal(target);
			}
		});

		// Page load with hash
		if (window.location.hash) {
			var target;
			try {
				target = document.querySelector(window.location.hash);
			} catch (err) {
				// invalid selector
			}
			if (target && target.hasAttribute('data-fk-modal') && target.dataset.variant === 'hash') {
				requestAnimationFrame(function () {
					window.scrollTo(0, 0);
					openModal(target);
				});
			}
		}

		// ----- Exit Intent variant -----

		var exitIntentModals = document.querySelectorAll('[data-fk-modal][data-variant="exit-intent"]');
		if (exitIntentModals.length) {
			document.addEventListener('click', function (e) {
				var link = e.target.closest('a[href]');
				if (!link) return;

				var href = link.getAttribute('href');
				if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

				// Check if external
				try {
					var url = new URL(href, window.location.origin);
					if (url.origin === window.location.origin) return;
				} catch (err) {
					return;
				}

				// Use the first exit-intent modal
				var modal = exitIntentModals[0];
				var whitelist = [];
				try {
					whitelist = JSON.parse(modal.dataset.whitelistUrls || '[]');
				} catch (err) {
					whitelist = [];
				}

				// Check whitelist
				var isWhitelisted = whitelist.some(function (w) {
					return href.indexOf(w) !== -1;
				});

				if (!isWhitelisted) {
					e.preventDefault();
					triggerElement = link;

					// Store the intended URL for "Continue" buttons
					modal.dataset.pendingUrl = href;

					openModal(modal);
				}
			});
		}

		// ----- HCP Gate variant -----

		var hcpModals = document.querySelectorAll('[data-fk-modal][data-variant="hcp-gate"]');
		hcpModals.forEach(function (modal) {
			if (getCookie('fk_hcp_verified')) return;

			requestAnimationFrame(function () {
				openModal(modal);
			});

			// Listen for button clicks inside HCP gate modal
			modal.addEventListener('click', function (e) {
				var btn = e.target.closest('a, button');
				if (!btn) return;

				var href = btn.getAttribute('href') || '';
				var denyUrl = modal.dataset.hcpDenyUrl || '';

				// Check if it's the deny button (links to deny URL)
				if (denyUrl && href && href.indexOf(denyUrl) !== -1) {
					// Let the deny link navigate normally
					return;
				}

				// Any other button/link click = confirm HCP
				var expiry = parseInt(modal.dataset.hcpCookieExpiry, 10) || 30;
				setCookie('fk_hcp_verified', '1', expiry);
				closeModal();
				e.preventDefault();
			});
		});
	}

	// Run on DOMContentLoaded or immediately
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
