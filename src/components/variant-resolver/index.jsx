/**
 * Unsupported Variant Resolver
 *
 * Shows an inline warning on FigmaKit blocks when their variant attribute
 * doesn't match any known theme class. Offers to map to an existing
 * variant or auto-generate fallback CSS.
 */

const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useState } = wp.element;
const { Notice, SelectControl, Button, Flex, FlexItem } = wp.components;
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

const BLOCK_PREFIX_MAP = {
	'wp-figmakit/fk-card': 'fk-card',
	'wp-figmakit/fk-hero': 'fk-hero',
	'wp-figmakit/fk-feature': 'fk-feature',
	'wp-figmakit/fk-cta': 'fk-cta',
	'wp-figmakit/fk-testimonial': 'fk-testimonial',
	'wp-figmakit/fk-accordion': 'fk-accordion',
	'wp-figmakit/fk-tabs': 'fk-tabs',
};

function getKnownVariants(blockName) {
	const data = window.fkEditorData?.themeVariants || {};
	const prefix = BLOCK_PREFIX_MAP[blockName];
	return (prefix && data[prefix]) ? data[prefix] : [];
}

function VariantWarning({ blockName, variant, setAttributes }) {
	const [resolved, setResolved] = useState(false);
	const [mapTo, setMapTo] = useState('');
	const known = getKnownVariants(blockName);

	if (resolved || !variant || known.includes(variant)) {
		return null;
	}

	const options = [
		{ label: __('— Select variant —', 'wp-figmakit'), value: '' },
		...known.map((v) => ({ label: v, value: v })),
	];

	const handleMap = () => {
		if (!mapTo) return;
		setAttributes({ variant: mapTo });
		setResolved(true);
	};

	const pluginActive = !!window.fkEditorData;

	const handleGenerate = () => {
		if (!pluginActive) {
			wp.data.dispatch('core/notices').createWarningNotice(
				__('FigmaKit plugin is not active. Install it to auto-generate variant CSS.', 'wp-figmakit'),
				{ type: 'snackbar' }
			);
			return;
		}

		const apiUrl = window.fkEditorData.apiUrl || '/wp-json/figmakit/v1/';
		const bemClass = (BLOCK_PREFIX_MAP[blockName] || 'fk-block') + '--' + variant;

		wp.apiFetch({
			path: apiUrl + 'resolve-variant',
			method: 'POST',
			data: { variant: bemClass, map_to: '__generate__' },
		}).then(() => {
			setResolved(true);
			wp.data.dispatch('core/notices').createSuccessNotice(
				__('Fallback CSS will be generated for variant: ', 'wp-figmakit') + variant,
				{ type: 'snackbar' }
			);
		}).catch(() => {
			wp.data.dispatch('core/notices').createErrorNotice(
				__('Failed to generate variant CSS. Check FigmaKit plugin status.', 'wp-figmakit'),
				{ type: 'snackbar' }
			);
		});
	};

	return wp.element.createElement(
		Notice,
		{
			status: 'warning',
			isDismissible: false,
			className: 'fk-variant-resolver-notice',
		},
		wp.element.createElement(
			Flex,
			{ align: 'center', gap: 2, wrap: true },
			wp.element.createElement(
				FlexItem,
				null,
				wp.element.createElement('strong', null,
					__('Variant "', 'wp-figmakit') + variant + __('" is not defined in the theme.', 'wp-figmakit')
				)
			),
			wp.element.createElement(
				FlexItem,
				null,
				wp.element.createElement(SelectControl, {
					value: mapTo,
					options: options,
					onChange: setMapTo,
					__nextHasNoMarginBottom: true,
					size: '__unstable-large',
				})
			),
			wp.element.createElement(
				FlexItem,
				null,
				wp.element.createElement(Button, { variant: 'primary', size: 'small', onClick: handleMap, disabled: !mapTo },
					__('Map', 'wp-figmakit')
				)
			),
			wp.element.createElement(
				FlexItem,
				null,
				wp.element.createElement(Button, { variant: 'secondary', size: 'small', onClick: handleGenerate },
					__('Auto-generate CSS', 'wp-figmakit')
				)
			)
		)
	);
}

const withVariantResolver = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		if (!FK_BLOCKS.includes(props.name)) {
			return wp.element.createElement(BlockEdit, props);
		}

		return wp.element.createElement(
			Fragment,
			null,
			wp.element.createElement(VariantWarning, {
				blockName: props.name,
				variant: props.attributes.variant || '',
				setAttributes: props.setAttributes,
			}),
			wp.element.createElement(BlockEdit, props)
		);
	};
}, 'withVariantResolver');

addFilter('editor.BlockEdit', 'wp-figmakit/variant-resolver', withVariantResolver, 5);
