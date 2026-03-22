const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useCallback } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl } = wp.components;
const { __ } = wp.i18n;

const DISPLAY_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Block', value: 'fk-d-block' },
	{ label: 'Flex', value: 'fk-d-flex' },
	{ label: 'Inline Flex', value: 'fk-d-iflex' },
	{ label: 'Grid', value: 'fk-d-grid' },
	{ label: 'None', value: 'fk-d-none' },
];

const DIRECTION_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Row', value: 'fk-dir-row' },
	{ label: 'Row Reverse', value: 'fk-dir-row-r' },
	{ label: 'Column', value: 'fk-dir-col' },
	{ label: 'Column Reverse', value: 'fk-dir-col-r' },
];

const JUSTIFY_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Start', value: 'fk-jc-start' },
	{ label: 'Center', value: 'fk-jc-center' },
	{ label: 'End', value: 'fk-jc-end' },
	{ label: 'Space Between', value: 'fk-jc-between' },
	{ label: 'Space Around', value: 'fk-jc-around' },
	{ label: 'Space Evenly', value: 'fk-jc-evenly' },
];

const ALIGN_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Start', value: 'fk-ai-start' },
	{ label: 'Center', value: 'fk-ai-center' },
	{ label: 'End', value: 'fk-ai-end' },
	{ label: 'Stretch', value: 'fk-ai-stretch' },
	{ label: 'Baseline', value: 'fk-ai-baseline' },
];

const WRAP_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Wrap', value: 'fk-wrap' },
	{ label: 'No Wrap', value: 'fk-nowrap' },
];

const GAP_OPTIONS = [
	{ label: '—', value: '' },
	{ label: '3XL (96px)', value: 'gap-3xl' },
	{ label: '2XL (80px)', value: 'gap-2xl' },
	{ label: 'XL (48px)', value: 'gap-xl' },
	{ label: 'LG (32px)', value: 'gap-lg' },
	{ label: 'MD (24px)', value: 'gap-md' },
	{ label: 'SM (20px)', value: 'gap-sm' },
	{ label: 'XS (16px)', value: 'gap-xs' },
	{ label: '2XS (12px)', value: 'gap-2xs' },
	{ label: '3XS (8px)', value: 'gap-3xs' },
	{ label: '4XS (4px)', value: 'gap-4xs' },
	{ label: '0', value: 'gap-0' },
];

/**
 * Add fkLayout attribute to all blocks.
 */
addFilter('blocks.registerBlockType', 'wp-figmakit/block-layout', (settings) => {
	settings.attributes = {
		...settings.attributes,
		fkLayout: {
			type: 'object',
			default: {
				display: '',
				direction: '',
				justify: '',
				align: '',
				wrap: '',
				gap: '',
			},
		},
	};
	return settings;
});

/**
 * Build class list from layout selections.
 */
function getLayoutClasses(layout) {
	if (!layout) return [];
	return Object.values(layout).filter(Boolean);
}

/**
 * Layout panel in the block inspector.
 */
const withLayoutPanel = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { attributes, setAttributes } = props;
		const layout = attributes.fkLayout || {};

		const isFlex = layout.display === 'fk-d-flex' || layout.display === 'fk-d-iflex';

		const updateLayout = useCallback((key, value) => {
			const updated = { ...layout, [key]: value };

			// Clear flex properties when display is not flex
			if (key === 'display' && value !== 'fk-d-flex' && value !== 'fk-d-iflex') {
				updated.direction = '';
				updated.justify = '';
				updated.align = '';
				updated.wrap = '';
				updated.gap = '';
			}

			setAttributes({ fkLayout: updated });
		}, [layout, setAttributes]);

		return (
			<Fragment>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						title={__('Layout', 'wp-figmakit')}
						initialOpen={false}
						className="fk-layout-panel"
					>
						<SelectControl
							label={__('Display', 'wp-figmakit')}
							value={layout.display || ''}
							options={DISPLAY_OPTIONS}
							onChange={(val) => updateLayout('display', val)}
							__nextHasNoMarginBottom
						/>

						{isFlex && (
							<Fragment>
								<SelectControl
									label={__('Direction', 'wp-figmakit')}
									value={layout.direction || ''}
									options={DIRECTION_OPTIONS}
									onChange={(val) => updateLayout('direction', val)}
									__nextHasNoMarginBottom
								/>
								<SelectControl
									label={__('Justify Content', 'wp-figmakit')}
									value={layout.justify || ''}
									options={JUSTIFY_OPTIONS}
									onChange={(val) => updateLayout('justify', val)}
									__nextHasNoMarginBottom
								/>
								<SelectControl
									label={__('Align Items', 'wp-figmakit')}
									value={layout.align || ''}
									options={ALIGN_OPTIONS}
									onChange={(val) => updateLayout('align', val)}
									__nextHasNoMarginBottom
								/>
								<SelectControl
									label={__('Wrap', 'wp-figmakit')}
									value={layout.wrap || ''}
									options={WRAP_OPTIONS}
									onChange={(val) => updateLayout('wrap', val)}
									__nextHasNoMarginBottom
								/>
								<SelectControl
									label={__('Gap', 'wp-figmakit')}
									value={layout.gap || ''}
									options={GAP_OPTIONS}
									onChange={(val) => updateLayout('gap', val)}
									__nextHasNoMarginBottom
								/>
							</Fragment>
						)}
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withLayoutPanel');

addFilter('editor.BlockEdit', 'wp-figmakit/block-layout-panel', withLayoutPanel);

/**
 * Apply layout classes to saved block markup.
 */
addFilter('blocks.getSaveContent.extraProps', 'wp-figmakit/apply-layout', (extraProps, blockType, attributes) => {
	const classes = getLayoutClasses(attributes.fkLayout);
	if (classes.length === 0) return extraProps;

	extraProps.className = extraProps.className
		? extraProps.className + ' ' + classes.join(' ')
		: classes.join(' ');

	return extraProps;
});
