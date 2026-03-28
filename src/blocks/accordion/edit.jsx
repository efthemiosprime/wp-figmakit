const { Fragment } = wp.element;
const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody, ToggleControl, TextControl } = wp.components;
const { __ } = wp.i18n;

const ALLOWED_BLOCKS = ['wp-figmakit/fk-accordion-item'];

const TEMPLATE = [
	['wp-figmakit/fk-accordion-item', { title: 'Accordion Item 1' }],
	['wp-figmakit/fk-accordion-item', { title: 'Accordion Item 2' }],
];

export default function Edit({ attributes, setAttributes }) {
	const { allowMultiple, defaultOpen } = attributes;

	const blockProps = useBlockProps({
		className: 'fk-accordion fk-accordion--editor',
	});

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Accordion Settings', 'wp-figmakit')} initialOpen={true}>
					<ToggleControl
						label={__('Allow Multiple Open', 'wp-figmakit')}
						help={__('Allow more than one item to be expanded at the same time', 'wp-figmakit')}
						checked={allowMultiple}
						onChange={(val) => setAttributes({ allowMultiple: val })}
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={__('Default Open Item', 'wp-figmakit')}
						help={__('Index of item to open by default (0 = first, -1 = none)', 'wp-figmakit')}
						type="number"
						min={-1}
						value={String(defaultOpen)}
						onChange={(val) => setAttributes({ defaultOpen: parseInt(val, 10) })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<InnerBlocks
					allowedBlocks={ALLOWED_BLOCKS}
					template={TEMPLATE}
					templateLock={false}
					renderAppender={InnerBlocks.ButtonBlockAppender}
				/>
			</div>
		</Fragment>
	);
}
