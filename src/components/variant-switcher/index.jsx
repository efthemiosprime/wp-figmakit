/**
 * Block Variant Switcher
 *
 * Adds a toolbar dropdown to switch FigmaKit variants. Works on:
 * - wp-figmakit/* blocks (reads `variant` attribute)
 * - Core Gutenberg blocks with fk-* BEM variant classes (e.g. fk-btn--primary on core/button)
 */

const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, createElement } = wp.element;
const { __ } = wp.i18n;

/**
 * Map block names to BEM prefix keys for variant lookup.
 * Covers both wp-figmakit custom blocks AND core Gutenberg blocks.
 */
const BLOCK_TO_PREFIX = {
	// FigmaKit custom blocks.
	'wp-figmakit/fk-card': 'fk-card',
	'wp-figmakit/fk-hero': 'fk-hero',
	'wp-figmakit/fk-feature': 'fk-feature',
	'wp-figmakit/fk-cta': 'fk-cta',
	'wp-figmakit/fk-testimonial': 'fk-testimonial',
	'wp-figmakit/fk-accordion': 'fk-accordion',
	'wp-figmakit/fk-tabs': 'fk-tabs',
	'wp-figmakit/fk-modal': 'fk-modal',
	'wp-figmakit/fk-isi-tray': 'fk-isi-tray',
	'wp-figmakit/fk-header': 'fk-header',
	// Core Gutenberg blocks that receive FigmaKit variant classes.
	'core/button': 'fk-btn',
	'core/buttons': 'fk-btn',
	'core/group': 'fk-group',
	'core/columns': 'fk-row',
	'core/heading': 'fk-heading',
	'core/paragraph': 'fk-text',
};

/**
 * Get variant options for a BEM prefix from localized data or defaults.
 */
function getVariantOptions(prefix) {
	const data = window.fkEditorData?.themeVariants || {};
	if (data[prefix]) {
		return data[prefix].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
	}

	// Fallback defaults.
	const defaults = {
		'fk-btn': ['primary', 'secondary', 'tertiary', 'link'],
		'fk-card': ['vstack', 'hstack'],
		'fk-hero': ['centered', 'split', 'image-left', 'overlay'],
		'fk-feature': ['vstack', 'hstack', 'icon-left', 'icon-right'],
		'fk-cta': ['centered', 'split'],
		'fk-testimonial': ['default', 'centered'],
		'fk-accordion': ['default'],
		'fk-tabs': ['horizontal', 'vertical'],
	};
	const list = defaults[prefix] || [];
	return list.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
}

/**
 * Detect current variant from block attributes.
 * For wp-figmakit blocks: reads `variant` attribute.
 * For core blocks: reads `fkButtonVariant` or parses BEM class from `className`.
 */
function getCurrentVariant(blockName, attributes, prefix) {
	// FigmaKit blocks store variant directly.
	if (blockName.startsWith('wp-figmakit/') && attributes.variant) {
		return attributes.variant;
	}

	// Button variant extension attribute.
	if (attributes.fkButtonVariant) {
		return attributes.fkButtonVariant;
	}

	// Parse from className: find fk-{prefix}--{value}.
	const className = attributes.className || '';
	const regex = new RegExp(prefix + '--([a-z0-9_-]+)', 'i');
	const match = className.match(regex);
	return match ? match[1] : '';
}

/**
 * Set variant on a block.
 * For wp-figmakit blocks: sets `variant` attribute.
 * For core blocks: updates BEM class in `className` + button variant attribute.
 */
function setVariant(blockName, attributes, setAttributes, prefix, newVariant) {
	if (blockName.startsWith('wp-figmakit/')) {
		setAttributes({ variant: newVariant });
		return;
	}

	// Update className: remove old BEM variant class, add new one.
	let className = attributes.className || '';
	// Remove any existing variant class for this prefix.
	className = className.replace(new RegExp('\\b' + prefix + '--[a-z0-9_-]+\\b', 'gi'), '').trim();
	// Add new variant class.
	className = (className + ' ' + prefix + '--' + newVariant).trim();
	const updates = { className };

	// Also update the button variant extension attribute.
	if (prefix === 'fk-btn') {
		updates.fkButtonVariant = newVariant;
	}

	setAttributes(updates);
}

const variantIcon = wp.element.createElement('svg', {
	xmlns: 'http://www.w3.org/2000/svg',
	viewBox: '0 0 24 24',
	width: 24,
	height: 24,
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 2,
}, [
	wp.element.createElement('rect', { key: '1', x: 3, y: 3, width: 7, height: 7, rx: 1 }),
	wp.element.createElement('rect', { key: '2', x: 14, y: 3, width: 7, height: 7, rx: 1 }),
	wp.element.createElement('rect', { key: '3', x: 3, y: 14, width: 18, height: 7, rx: 1 }),
]);

const withVariantSwitcher = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const prefix = BLOCK_TO_PREFIX[props.name];
		if (!prefix) {
			return createElement(BlockEdit, props);
		}

		const options = getVariantOptions(prefix);
		if (options.length < 2) {
			return createElement(BlockEdit, props);
		}

		// Access BlockControls and toolbar components at render time (not module scope)
		// to avoid issues with wp globals not being ready during Vite bundle init.
		const { BlockControls } = wp.blockEditor;
		const { ToolbarDropdownMenu, ToolbarGroup } = wp.components;

		const current = getCurrentVariant(props.name, props.attributes, prefix);

		const controls = options.map((opt) => ({
			title: opt.label + (current === opt.value ? ' \u2713' : ''),
			isActive: current === opt.value,
			onClick: () => setVariant(props.name, props.attributes, props.setAttributes, prefix, opt.value),
		}));

		return createElement(
			Fragment,
			null,
			createElement(
				BlockControls,
				{ group: 'other' },
				createElement(
					ToolbarGroup,
					null,
					createElement(ToolbarDropdownMenu, {
						icon: variantIcon,
						label: __('Switch variant', 'wp-figmakit') + (current ? ': ' + current : ''),
						controls: controls,
					})
				)
			),
			createElement(BlockEdit, props)
		);
	};
}, 'withVariantSwitcher');

addFilter('editor.BlockEdit', 'wp-figmakit/variant-switcher', withVariantSwitcher);
