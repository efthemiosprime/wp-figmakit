const { useCallback } = wp.element;
const { PanelBody, SelectControl, RangeControl, Button } = wp.components;
const { useSelect, useDispatch } = wp.data;
const { createBlock } = wp.blocks;
const { __ } = wp.i18n;
const { GAP_SIZES } = require('../../lib/spacing-options');

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

const COLUMN_PRESETS = [1, 2, 3, 4, 5, 6, 12];

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

function getColClass(className) {
	const match = (className || '').match(/\bfk-col-(\d+)\b/);
	return match ? match[0] : '';
}

function getOffsetClass(className, direction) {
	const regex = direction === 'right'
		? /\bfk-offset-r-(\d+)\b/
		: /\bfk-offset-(\d+)\b/;
	const match = (className || '').match(regex);
	return match ? match[0] : '';
}

function replaceClassByPrefix(className, prefix, newClass) {
	const regex = new RegExp(`\\b${prefix}\\d+\\b`, 'g');
	let cleaned = (className || '').replace(regex, '').replace(/\s+/g, ' ').trim();
	if (newClass) {
		cleaned = cleaned ? cleaned + ' ' + newClass : newClass;
	}
	return cleaned;
}

const { Fragment } = wp.element;

export default function LayoutPanel({ attributes, setAttributes, name, clientId }) {
	const layout = attributes.fkLayout || {};
	const isGroup = name === 'core/group';
	const fkColumns = attributes.fkColumns || 0;
	const className = attributes.className || '';

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

	const { replaceInnerBlocks } = useDispatch('core/block-editor');
	const innerBlocks = useSelect((select) => {
		if (!isGroup) return [];
		return select('core/block-editor').getBlocks(clientId);
	}, [clientId, isGroup]);

	const applyColumns = useCallback((count) => {
		if (!isGroup) return;

		const colSpan = Math.floor(12 / count);
		const colBlocks = [];

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
			tagName: 'section',
		});

		replaceInnerBlocks(clientId, [rowBlock], false);
	}, [isGroup, innerBlocks, clientId, setAttributes, replaceInnerBlocks]);

	const clearColumns = useCallback(() => {
		setAttributes({ fkColumns: 0 });
	}, [setAttributes]);

	const updateColSize = useCallback((newClass) => {
		setAttributes({ className: replaceClassByPrefix(className, 'fk-col-', newClass) });
	}, [className, setAttributes]);

	const updateOffsetLeft = useCallback((newClass) => {
		let updated = className.replace(/\bfk-offset-(?!r-)\d+\b/g, '').replace(/\s+/g, ' ').trim();
		if (newClass) {
			updated = updated ? updated + ' ' + newClass : newClass;
		}
		setAttributes({ className: updated });
	}, [className, setAttributes]);

	const updateOffsetRight = useCallback((newClass) => {
		setAttributes({ className: replaceClassByPrefix(className, 'fk-offset-r-', newClass) });
	}, [className, setAttributes]);

	return (
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
						options={GAP_SIZES}
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
	);
}
