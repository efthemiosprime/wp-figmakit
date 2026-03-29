/**
 * Unsupported Variant Resolver
 *
 * Shows an inline warning on any block (FigmaKit or core Gutenberg) when
 * its variant isn't defined in the theme. Works by checking:
 * - `variant` attribute on wp-figmakit/* blocks
 * - BEM variant classes (fk-btn--*, fk-card--*, etc.) in className on core blocks
 */

const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useState, createElement } = wp.element;
const { __ } = wp.i18n;

const BLOCK_TO_PREFIX = {
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
	'core/button': 'fk-btn',
	'core/buttons': 'fk-btn',
	'core/group': 'fk-group',
	'core/columns': 'fk-row',
	'core/heading': 'fk-heading',
	'core/paragraph': 'fk-text',
};

function getKnownVariants(prefix) {
	const data = window.fkEditorData?.themeVariants || {};
	return data[prefix] || [];
}

/**
 * Detect current variant from attributes.
 */
function detectVariant(blockName, attributes, prefix) {
	if (blockName.startsWith('wp-figmakit/') && attributes.variant) {
		return attributes.variant;
	}
	if (attributes.fkButtonVariant) {
		return attributes.fkButtonVariant;
	}
	const className = attributes.className || '';
	const regex = new RegExp(prefix + '--([a-z0-9_-]+)', 'i');
	const match = className.match(regex);
	return match ? match[1] : '';
}

function VariantWarning({ blockName, attributes, setAttributes }) {
	const [resolved, setResolved] = useState(false);
	const [mapTo, setMapTo] = useState('');

	const prefix = BLOCK_TO_PREFIX[blockName];
	if (!prefix) return null;

	const variant = detectVariant(blockName, attributes, prefix);
	const known = getKnownVariants(prefix);

	if (resolved || !variant || known.includes(variant)) {
		return null;
	}

	const options = [
		{ label: __('— Select variant —', 'wp-figmakit'), value: '' },
		...known.map((v) => ({ label: v, value: v })),
	];

	const handleMap = () => {
		if (!mapTo) return;
		if (blockName.startsWith('wp-figmakit/')) {
			setAttributes({ variant: mapTo });
		} else {
			let className = attributes.className || '';
			className = className.replace(new RegExp('\\b' + prefix + '--[a-z0-9_-]+\\b', 'gi'), '').trim();
			className = (className + ' ' + prefix + '--' + mapTo).trim();
			const updates = { className };
			if (prefix === 'fk-btn') updates.fkButtonVariant = mapTo;
			setAttributes(updates);
		}
		setResolved(true);
	};

	const pluginActive = window.fkEditorData?.pluginActive === true;

	const handleGenerate = () => {
		if (!pluginActive) {
			wp.data.dispatch('core/notices').createWarningNotice(
				__('FigmaKit plugin is not active. Install it to auto-generate variant CSS.', 'wp-figmakit'),
				{ type: 'snackbar' }
			);
			return;
		}

		const apiUrl = window.fkEditorData.apiUrl || '/wp-json/figmakit/v1/';
		const bemClass = prefix + '--' + variant;

		wp.apiFetch({
			path: apiUrl + 'resolve-variant',
			method: 'POST',
			data: { variant: bemClass, map_to: '__generate__' },
		}).then(() => {
			setResolved(true);
			wp.data.dispatch('core/notices').createSuccessNotice(
				__('Fallback CSS will be generated for: ', 'wp-figmakit') + bemClass,
				{ type: 'snackbar' }
			);
		}).catch(() => {
			wp.data.dispatch('core/notices').createErrorNotice(
				__('Failed to generate variant CSS.', 'wp-figmakit'),
				{ type: 'snackbar' }
			);
		});
	};

	// Access wp.components at render time.
	const { Notice, SelectControl, Button: WPButton, Flex, FlexItem } = wp.components;

	return createElement(
		Notice,
		{ status: 'warning', isDismissible: false, className: 'fk-variant-resolver-notice' },
		createElement(
			Flex,
			{ align: 'center', gap: 2, wrap: true },
			createElement(FlexItem, null,
				createElement('strong', null,
					prefix + '--' + variant + __(' is not defined in the theme.', 'wp-figmakit')
				)
			),
			createElement(FlexItem, null,
				createElement(SelectControl, {
					value: mapTo,
					options: options,
					onChange: setMapTo,
					__nextHasNoMarginBottom: true,
					size: '__unstable-large',
				})
			),
			createElement(FlexItem, null,
				createElement(WPButton, {
					variant: 'primary', size: 'small', onClick: handleMap, disabled: !mapTo,
				}, __('Map', 'wp-figmakit'))
			),
			createElement(FlexItem, null,
				createElement(WPButton, {
					variant: 'secondary', size: 'small', onClick: handleGenerate,
				}, __('Auto-generate CSS', 'wp-figmakit'))
			)
		)
	);
}

const withVariantResolver = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const prefix = BLOCK_TO_PREFIX[props.name];
		if (!prefix) {
			return createElement(BlockEdit, props);
		}

		return createElement(
			Fragment,
			null,
			createElement(VariantWarning, {
				blockName: props.name,
				attributes: props.attributes,
				setAttributes: props.setAttributes,
			}),
			createElement(BlockEdit, props)
		);
	};
}, 'withVariantResolver');

addFilter('editor.BlockEdit', 'wp-figmakit/variant-resolver', withVariantResolver, 5);
