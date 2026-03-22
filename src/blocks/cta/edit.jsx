const { Fragment } = wp.element;
const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl } = wp.components;
const { __ } = wp.i18n;

const VARIANT_OPTIONS = [
	{ label: 'Centered', value: 'centered' },
	{ label: 'Left Aligned', value: 'left' },
	{ label: 'Split', value: 'split' },
];

const ALIGNMENT_OPTIONS = [
	{ label: 'Left', value: 'left' },
	{ label: 'Center', value: 'center' },
	{ label: 'Right', value: 'right' },
];

const TEMPLATE = [
	['core/heading', {
		level: 2,
		placeholder: 'Call to Action Title',
		className: 'fk-cta__title',
	}],
	['core/paragraph', {
		placeholder: 'Compelling description to drive action...',
		className: 'fk-cta__description',
	}],
	['core/buttons', { className: 'fk-cta__buttons', layout: { type: 'flex', justifyContent: 'center' } }, [
		['core/button', { placeholder: 'Get Started' }],
	]],
];

export default function Edit({ attributes, setAttributes }) {
	const { variant, alignment } = attributes;

	const blockProps = useBlockProps({
		className: `fk-cta fk-cta--${variant} has-text-align-${alignment}`,
	});

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('CTA Settings', 'wp-figmakit')} initialOpen={true}>
					<SelectControl
						label={__('Variant', 'wp-figmakit')}
						value={variant}
						options={VARIANT_OPTIONS}
						onChange={(val) => setAttributes({ variant: val })}
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={__('Alignment', 'wp-figmakit')}
						value={alignment}
						options={ALIGNMENT_OPTIONS}
						onChange={(val) => setAttributes({ alignment: val })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="fk-cta__inner">
					<InnerBlocks
						template={TEMPLATE}
						templateLock={false}
					/>
				</div>
			</div>
		</Fragment>
	);
}
