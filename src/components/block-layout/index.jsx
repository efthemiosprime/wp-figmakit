const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useCallback } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl, RangeControl, Button } = wp.components;
const { useSelect, useDispatch } = wp.data;
const { createBlock } = wp.blocks;
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

const COLUMN_PRESETS = [1, 2, 3, 4, 5, 6, 12];

/**
 * Add fkLayout and fkColumns attributes.
 */
addFilter('blocks.registerBlockType', 'wp-figmakit/block-layout', (settings, name) => {
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

	// Responsive layout overrides
	settings.attributes.fkLayoutTablet = {
		type: 'object',
		default: { display: '', direction: '' },
	};
	settings.attributes.fkLayoutMobile = {
		type: 'object',
		default: { display: '', direction: '' },
	};

	// Add fkColumns only to core/group
	if (name === 'core/group') {
		settings.attributes.fkColumns = {
			type: 'number',
			default: 0,
		};
	}

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
 * Layout panel with columns support for Group blocks.
 */
const TABLET_DISPLAY_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Block', value: 'fk-t-d-block' },
	{ label: 'Flex', value: 'fk-t-d-flex' },
	{ label: 'None', value: 'fk-t-d-none' },
];

const TABLET_DIRECTION_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Row', value: 'fk-t-dir-row' },
	{ label: 'Column', value: 'fk-t-dir-col' },
];

const MOBILE_DISPLAY_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Block', value: 'fk-m-d-block' },
	{ label: 'Flex', value: 'fk-m-d-flex' },
	{ label: 'None', value: 'fk-m-d-none' },
];

const MOBILE_DIRECTION_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Row', value: 'fk-m-dir-row' },
	{ label: 'Column', value: 'fk-m-dir-col' },
];

const COL_SIZE_OPTIONS = [
	{ label: '—', value: '' },
	{ label: '1 col', value: 'fk-col-1' },
	{ label: '2 col', value: 'fk-col-2' },
	{ label: '3 col', value: 'fk-col-3' },
	{ label: '4 col', value: 'fk-col-4' },
	{ label: '5 col', value: 'fk-col-5' },
	{ label: '6 col', value: 'fk-col-6' },
	{ label: '7 col', value: 'fk-col-7' },
	{ label: '8 col', value: 'fk-col-8' },
	{ label: '9 col', value: 'fk-col-9' },
	{ label: '10 col', value: 'fk-col-10' },
	{ label: '11 col', value: 'fk-col-11' },
	{ label: '12 col (full)', value: 'fk-col-12' },
];

const OFFSET_LEFT_OPTIONS = [
	{ label: '—', value: '' },
	{ label: '1 col', value: 'fk-offset-1' },
	{ label: '2 col', value: 'fk-offset-2' },
	{ label: '3 col', value: 'fk-offset-3' },
	{ label: '4 col', value: 'fk-offset-4' },
	{ label: '5 col', value: 'fk-offset-5' },
	{ label: '6 col', value: 'fk-offset-6' },
];

const OFFSET_RIGHT_OPTIONS = [
	{ label: '—', value: '' },
	{ label: '1 col', value: 'fk-offset-r-1' },
	{ label: '2 col', value: 'fk-offset-r-2' },
	{ label: '3 col', value: 'fk-offset-r-3' },
	{ label: '4 col', value: 'fk-offset-r-4' },
	{ label: '5 col', value: 'fk-offset-r-5' },
	{ label: '6 col', value: 'fk-offset-r-6' },
];

/**
 * Helper: extract fk-col-* class from className string.
 */
function getColClass(className) {
	const match = (className || '').match(/\bfk-col-(\d+)\b/);
	return match ? match[0] : '';
}

function getOffsetClass(className, direction) {
	const prefix = direction === 'right' ? 'fk-offset-r-' : 'fk-offset-';
	const regex = direction === 'right'
		? /\bfk-offset-r-(\d+)\b/
		: /\bfk-offset-(\d+)\b/;
	const match = (className || '').match(regex);
	return match ? match[0] : '';
}

function replaceClassByPrefix(className, prefix, newClass) {
	// Remove old class with this prefix, add new one
	const regex = new RegExp(`\\b${prefix}\\d+\\b`, 'g');
	let cleaned = (className || '').replace(regex, '').replace(/\s+/g, ' ').trim();
	if (newClass) {
		cleaned = cleaned ? cleaned + ' ' + newClass : newClass;
	}
	return cleaned;
}

const withLayoutPanel = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { attributes, setAttributes, clientId } = props;
		const layout = attributes.fkLayout || {};
		const isGroup = props.name === 'core/group';
		const fkColumns = attributes.fkColumns || 0;
		const className = attributes.className || '';

		// Detect if this block is a column (has fk-col-* class)
		const isColumn = /\bfk-col-\d+\b/.test(className);
		const currentColSize = getColClass(className);
		const currentOffsetLeft = getOffsetClass(className, 'left');
		const currentOffsetRight = getOffsetClass(className, 'right');

		const isFlex = layout.display === 'fk-d-flex' || layout.display === 'fk-d-iflex';

		const updateLayout = useCallback((key, value) => {
			const updated = { ...layout, [key]: value };

			if (key === 'display' && value !== 'fk-d-flex' && value !== 'fk-d-iflex') {
				updated.direction = '';
				updated.justify = '';
				updated.align = '';
				updated.wrap = '';
				updated.gap = '';
			}

			setAttributes({ fkLayout: updated });
		}, [layout, setAttributes]);

		// Column management — only for Group blocks
		const { replaceInnerBlocks } = useDispatch('core/block-editor');
		const innerBlocks = useSelect((select) => {
			if (!isGroup) return [];
			return select('core/block-editor').getBlocks(clientId);
		}, [clientId, isGroup]);

		const applyColumns = useCallback((count) => {
			if (!isGroup) return;

			const colSpan = Math.floor(12 / count);
			const colBlocks = [];

			// Check if there's already a row block with columns
			const existingRow = innerBlocks.find(
				(b) => b.name === 'core/group' && (b.attributes.className || '').includes('fk-row')
			);
			const existingCols = existingRow ? existingRow.innerBlocks : [];

			for (let i = 0; i < count; i++) {
				const existingCol = existingCols[i] || null;
				let colBlock;

				if (existingCol && existingCol.name === 'core/group') {
					colBlock = createBlock(
						'core/group',
						{ ...existingCol.attributes, className: `fk-col-${colSpan}` },
						existingCol.innerBlocks
					);
				} else {
					colBlock = createBlock(
						'core/group',
						{ className: `fk-col-${colSpan}` },
						[]
					);
				}

				colBlocks.push(colBlock);
			}

			// Create the row Group containing the columns
			const rowBlock = createBlock(
				'core/group',
				{
					className: 'fk-row',
					layout: { type: 'flex', flexWrap: 'nowrap' },
				},
				colBlocks
			);

			setAttributes({
				fkColumns: count,
				// Parent section uses default constrained layout
				tagName: 'section',
			});

			replaceInnerBlocks(clientId, [rowBlock], false);
		}, [isGroup, innerBlocks, clientId, attributes.className, setAttributes, replaceInnerBlocks]);

		const clearColumns = useCallback(() => {
			setAttributes({ fkColumns: 0 });
		}, [setAttributes]);

		// Column size/offset handlers
		const updateColSize = useCallback((newClass) => {
			let updated = replaceClassByPrefix(className, 'fk-col-', newClass);
			setAttributes({ className: updated });
		}, [className, setAttributes]);

		const updateOffsetLeft = useCallback((newClass) => {
			// Remove old fk-offset-N (but not fk-offset-r-N)
			let updated = className.replace(/\bfk-offset-(?!r-)\d+\b/g, '').replace(/\s+/g, ' ').trim();
			if (newClass) {
				updated = updated ? updated + ' ' + newClass : newClass;
			}
			setAttributes({ className: updated });
		}, [className, setAttributes]);

		const updateOffsetRight = useCallback((newClass) => {
			let updated = replaceClassByPrefix(className, 'fk-offset-r-', newClass);
			setAttributes({ className: updated });
		}, [className, setAttributes]);

		return (
			<Fragment>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						title={__('Layout', 'wp-figmakit')}
						initialOpen={false}
						className="fk-layout-panel"
					>
						{isGroup && (
							<div className="fk-layout-panel__columns">
								<div className="fk-layout-panel__columns-label">
									{__('Columns', 'wp-figmakit')}
								</div>
								<div className="fk-layout-panel__columns-presets">
									{COLUMN_PRESETS.map((cols) => (
										<Button
											key={cols}
											variant={fkColumns === cols ? 'primary' : 'secondary'}
											size="small"
											onClick={() => applyColumns(cols)}
											className="fk-layout-panel__col-btn"
										>
											{cols}
										</Button>
									))}
									{fkColumns > 0 && (
										<Button
											icon="no-alt"
											size="small"
											isDestructive
											onClick={clearColumns}
											label={__('Clear', 'wp-figmakit')}
										/>
									)}
								</div>
								{fkColumns > 0 && (
									<RangeControl
										value={fkColumns}
										onChange={(val) => applyColumns(val)}
										min={1}
										max={12}
										__nextHasNoMarginBottom
									/>
								)}
							</div>
						)}

						{isColumn && (
							<div className="fk-layout-panel__col-settings">
								<div className="fk-layout-panel__columns-label">
									{__('Column Size & Offset', 'wp-figmakit')}
								</div>
								<SelectControl
									label={__('Size', 'wp-figmakit')}
									value={currentColSize}
									options={COL_SIZE_OPTIONS}
									onChange={updateColSize}
									__nextHasNoMarginBottom
								/>
								<div className="fk-layout-panel__offset-row">
									<SelectControl
										label={__('Offset Left', 'wp-figmakit')}
										value={currentOffsetLeft}
										options={OFFSET_LEFT_OPTIONS}
										onChange={updateOffsetLeft}
										__nextHasNoMarginBottom
									/>
									<SelectControl
										label={__('Offset Right', 'wp-figmakit')}
										value={currentOffsetRight}
										options={OFFSET_RIGHT_OPTIONS}
										onChange={updateOffsetRight}
										__nextHasNoMarginBottom
									/>
								</div>
							</div>
						)}

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
						<div className="fk-layout-panel__responsive">
							<div className="fk-layout-panel__columns-label">
								{__('Tablet Override', 'wp-figmakit')}
							</div>
							<div className="fk-layout-panel__responsive-row">
								<SelectControl
									label={__('Display', 'wp-figmakit')}
									value={(attributes.fkLayoutTablet || {}).display || ''}
									options={TABLET_DISPLAY_OPTIONS}
									onChange={(val) => setAttributes({
										fkLayoutTablet: { ...(attributes.fkLayoutTablet || {}), display: val }
									})}
									__nextHasNoMarginBottom
								/>
								<SelectControl
									label={__('Direction', 'wp-figmakit')}
									value={(attributes.fkLayoutTablet || {}).direction || ''}
									options={TABLET_DIRECTION_OPTIONS}
									onChange={(val) => setAttributes({
										fkLayoutTablet: { ...(attributes.fkLayoutTablet || {}), direction: val }
									})}
									__nextHasNoMarginBottom
								/>
							</div>
						</div>

						<div className="fk-layout-panel__responsive">
							<div className="fk-layout-panel__columns-label">
								{__('Mobile Override', 'wp-figmakit')}
							</div>
							<div className="fk-layout-panel__responsive-row">
								<SelectControl
									label={__('Display', 'wp-figmakit')}
									value={(attributes.fkLayoutMobile || {}).display || ''}
									options={MOBILE_DISPLAY_OPTIONS}
									onChange={(val) => setAttributes({
										fkLayoutMobile: { ...(attributes.fkLayoutMobile || {}), display: val }
									})}
									__nextHasNoMarginBottom
								/>
								<SelectControl
									label={__('Direction', 'wp-figmakit')}
									value={(attributes.fkLayoutMobile || {}).direction || ''}
									options={MOBILE_DIRECTION_OPTIONS}
									onChange={(val) => setAttributes({
										fkLayoutMobile: { ...(attributes.fkLayoutMobile || {}), direction: val }
									})}
									__nextHasNoMarginBottom
								/>
							</div>
						</div>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withLayoutPanel');

addFilter('editor.BlockEdit', 'wp-figmakit/block-layout-panel', withLayoutPanel);
