/**
 * Block Variant Switcher
 *
 * Adds a toolbar dropdown to FigmaKit blocks (card, hero, feature, cta,
 * testimonial) for switching between layout/style variants without
 * editing block JSON attributes manually.
 */

const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment } = wp.element;
const { BlockControls } = wp.blockEditor;
const { ToolbarDropdownMenu, ToolbarGroup } = wp.components;
const { __ } = wp.i18n;

const FK_BLOCKS = [
	'wp-figmakit/fk-card',
	'wp-figmakit/fk-hero',
	'wp-figmakit/fk-feature',
	'wp-figmakit/fk-cta',
	'wp-figmakit/fk-testimonial',
	'wp-figmakit/fk-accordion',
	'wp-figmakit/fk-tabs',
];

/**
 * Get variant options for a block type from localized data or defaults.
 */
function getVariantOptions(blockName) {
	// Try localized data from plugin.
	const data = window.fkEditorData?.themeVariants || {};
	// Map block name to BEM prefix key.
	const prefixMap = {
		'wp-figmakit/fk-card': 'fk-card',
		'wp-figmakit/fk-hero': 'fk-hero',
		'wp-figmakit/fk-feature': 'fk-feature',
		'wp-figmakit/fk-cta': 'fk-cta',
		'wp-figmakit/fk-testimonial': 'fk-testimonial',
		'wp-figmakit/fk-accordion': 'fk-accordion',
		'wp-figmakit/fk-tabs': 'fk-tabs',
	};
	const prefix = prefixMap[blockName];
	if (prefix && data[prefix]) {
		return data[prefix].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
	}

	// Fallback defaults.
	const defaults = {
		'wp-figmakit/fk-card': ['vstack', 'hstack'],
		'wp-figmakit/fk-hero': ['centered', 'split', 'image-left', 'overlay'],
		'wp-figmakit/fk-feature': ['vstack', 'hstack', 'icon-left', 'icon-right'],
		'wp-figmakit/fk-cta': ['centered', 'split'],
		'wp-figmakit/fk-testimonial': ['default', 'centered'],
		'wp-figmakit/fk-accordion': ['default'],
		'wp-figmakit/fk-tabs': ['horizontal', 'vertical'],
	};
	const list = defaults[blockName] || [];
	return list.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
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
		if (!FK_BLOCKS.includes(props.name)) {
			return wp.element.createElement(BlockEdit, props);
		}

		const variant = props.attributes.variant || '';
		const options = getVariantOptions(props.name);

		if (options.length < 2) {
			return wp.element.createElement(BlockEdit, props);
		}

		const controls = options.map((opt) => ({
			title: opt.label,
			isActive: variant === opt.value,
			onClick: () => props.setAttributes({ variant: opt.value }),
		}));

		return wp.element.createElement(
			Fragment,
			null,
			wp.element.createElement(
				BlockControls,
				{ group: 'other' },
				wp.element.createElement(
					ToolbarGroup,
					null,
					wp.element.createElement(ToolbarDropdownMenu, {
						icon: variantIcon,
						label: __('Switch variant', 'wp-figmakit'),
						controls: controls,
					})
				)
			),
			wp.element.createElement(BlockEdit, props)
		);
	};
}, 'withVariantSwitcher');

addFilter('editor.BlockEdit', 'wp-figmakit/variant-switcher', withVariantSwitcher);
