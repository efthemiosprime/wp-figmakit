const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useCallback } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, RangeControl, Button } = wp.components;
const { useSelect, useDispatch } = wp.data;
const { createBlock, registerBlockVariation } = wp.blocks;
const { __ } = wp.i18n;

// ==========================================================================
// Block Variations — appear in the Group placeholder picker
// ==========================================================================

function makeColumnIcon(cols) {
	const rects = [];
	const gap = 2;
	const totalGaps = (cols - 1) * gap;
	const colWidth = (24 - totalGaps) / cols;

	for (let i = 0; i < cols; i++) {
		rects.push(
			<rect
				key={i}
				x={i * (colWidth + gap)}
				y="4"
				width={colWidth}
				height="16"
				rx="1"
				fill="currentColor"
			/>
		);
	}

	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
			{rects}
		</svg>
	);
}

function buildColumnInnerBlocks(count) {
	const colSpan = Math.floor(12 / count);
	const blocks = [];
	for (let i = 0; i < count; i++) {
		blocks.push(createBlock('core/group', { className: `fk-col-${colSpan}` }, []));
	}
	return blocks;
}

const COLUMN_VARIATIONS = [
	{ cols: 2, title: '2 Columns', scope: ['block'] },
	{ cols: 3, title: '3 Columns', scope: ['block'] },
	{ cols: 4, title: '4 Columns', scope: ['block'] },
	{ cols: 6, title: '6 Columns', scope: ['block'] },
];

wp.domReady(() => {
	COLUMN_VARIATIONS.forEach(({ cols, title, scope }) => {
		registerBlockVariation('core/group', {
			name: `fk-${cols}-cols`,
			title: title,
			icon: makeColumnIcon(cols),
			scope: scope,
			attributes: {
				className: 'fk-row',
				fkColumns: cols,
			},
			innerBlocks: buildColumnInnerBlocks(cols),
			isActive: (blockAttributes) =>
				blockAttributes.fkColumns === cols,
		});
	});
});

// ==========================================================================
// Attribute registration
// ==========================================================================

addFilter('blocks.registerBlockType', 'wp-figmakit/block-columns', (settings, name) => {
	if (name !== 'core/group') return settings;

	settings.attributes = {
		...settings.attributes,
		fkColumns: {
			type: 'number',
			default: 0,
		},
	};
	return settings;
});

// ==========================================================================
// Sidebar panel — change column count after creation
// ==========================================================================

const COLUMN_PRESETS = [
	{ cols: 1, label: '1' },
	{ cols: 2, label: '2' },
	{ cols: 3, label: '3' },
	{ cols: 4, label: '4' },
	{ cols: 5, label: '5' },
	{ cols: 6, label: '6' },
	{ cols: 12, label: '12' },
];

const withColumnsPanel = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		if (props.name !== 'core/group') {
			return <BlockEdit {...props} />;
		}

		const { attributes, setAttributes, clientId } = props;
		const { fkColumns } = attributes;

		const { replaceInnerBlocks } = useDispatch('core/block-editor');
		const innerBlocks = useSelect((select) => {
			return select('core/block-editor').getBlocks(clientId);
		}, [clientId]);

		const applyColumns = useCallback((count) => {
			const colSpan = Math.floor(12 / count);
			const newInnerBlocks = [];

			for (let i = 0; i < count; i++) {
				const existingBlock = innerBlocks[i] || null;
				let colBlock;

				if (existingBlock && existingBlock.name === 'core/group') {
					colBlock = createBlock(
						'core/group',
						{
							...existingBlock.attributes,
							className: `fk-col-${colSpan}`,
						},
						existingBlock.innerBlocks
					);
				} else if (existingBlock) {
					colBlock = createBlock(
						'core/group',
						{ className: `fk-col-${colSpan}` },
						[existingBlock]
					);
				} else {
					colBlock = createBlock(
						'core/group',
						{ className: `fk-col-${colSpan}` },
						[]
					);
				}

				newInnerBlocks.push(colBlock);
			}

			setAttributes({
				fkColumns: count,
				className: [
					(attributes.className || '').replace(/\bfk-row\b/g, '').trim(),
					'fk-row',
				].filter(Boolean).join(' '),
			});

			replaceInnerBlocks(clientId, newInnerBlocks, false);
		}, [innerBlocks, clientId, attributes.className, setAttributes, replaceInnerBlocks]);

		const clearColumns = useCallback(() => {
			setAttributes({
				fkColumns: 0,
				className: (attributes.className || '').replace(/\bfk-row\b/g, '').trim(),
			});
		}, [attributes.className, setAttributes]);

		return (
			<Fragment>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						title={__('Columns', 'wp-figmakit')}
						initialOpen={false}
						className="fk-columns-panel"
					>
						<p className="fk-columns-panel__desc">
							{__('Select column count. Child Group blocks with grid classes are created automatically.', 'wp-figmakit')}
						</p>

						<div className="fk-columns-panel__presets">
							{COLUMN_PRESETS.map((preset) => (
								<Button
									key={preset.cols}
									variant={fkColumns === preset.cols ? 'primary' : 'secondary'}
									size="small"
									onClick={() => applyColumns(preset.cols)}
									className="fk-columns-panel__preset-btn"
								>
									{preset.label}
								</Button>
							))}
						</div>

						{fkColumns > 0 && (
							<Fragment>
								<RangeControl
									label={__('Column Count', 'wp-figmakit')}
									value={fkColumns}
									onChange={(val) => applyColumns(val)}
									min={1}
									max={12}
									__nextHasNoMarginBottom
								/>
								<Button
									variant="tertiary"
									isDestructive
									size="small"
									onClick={clearColumns}
									className="fk-columns-panel__clear"
								>
									{__('Remove Column Layout', 'wp-figmakit')}
								</Button>
							</Fragment>
						)}
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withColumnsPanel');

addFilter('editor.BlockEdit', 'wp-figmakit/block-columns-panel', withColumnsPanel);
