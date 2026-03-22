const { Fragment } = wp.element;
const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl } = wp.components;
const { __ } = wp.i18n;

const VARIANT_OPTIONS = [
	{ label: 'Vertical Stack', value: 'vstack' },
	{ label: 'Horizontal Stack', value: 'hstack' },
];

const ICON_POSITION_OPTIONS = [
	{ label: 'Top', value: 'top' },
	{ label: 'Left', value: 'left' },
	{ label: 'Right', value: 'right' },
];

function getTemplate(variant) {
	const template = [];

	template.push(['core/image', {
		className: 'fk-feature__icon',
	}]);

	template.push(['core/heading', {
		level: 3,
		placeholder: 'Feature Title',
		className: 'fk-feature__title',
	}]);

	template.push(['core/paragraph', {
		placeholder: 'Feature description goes here...',
		className: 'fk-feature__description',
	}]);

	return template;
}

export default function Edit({ attributes, setAttributes }) {
	const { variant, iconPosition } = attributes;

	const blockProps = useBlockProps({
		className: `fk-feature fk-feature--${variant} fk-feature--icon-${iconPosition}`,
	});

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Feature Settings', 'wp-figmakit')} initialOpen={true}>
					<SelectControl
						label={__('Variant', 'wp-figmakit')}
						value={variant}
						options={VARIANT_OPTIONS}
						onChange={(val) => setAttributes({ variant: val })}
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={__('Icon Position', 'wp-figmakit')}
						value={iconPosition}
						options={ICON_POSITION_OPTIONS}
						onChange={(val) => setAttributes({ iconPosition: val })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<InnerBlocks
					template={getTemplate(variant)}
					templateLock={false}
				/>
			</div>
		</Fragment>
	);
}
