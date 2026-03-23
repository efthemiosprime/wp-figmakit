const { Fragment, useState, useEffect, useCallback } = wp.element;
const { useBlockProps, useInnerBlocksProps, InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl, Button, ButtonGroup, TextControl } = wp.components;
const { useSelect, useDispatch } = wp.data;
const { createBlock } = wp.blocks;
const { __ } = wp.i18n;
const { store: blockEditorStore } = wp.blockEditor;

const ALLOWED_BLOCKS = ['wp-figmakit/fk-tab-item'];

const DEFAULT_TEMPLATE = [
	['wp-figmakit/fk-tab-item', { label: 'Tab 1' }],
	['wp-figmakit/fk-tab-item', { label: 'Tab 2' }],
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { variant, activeTab } = attributes;
	const [visibleTab, setVisibleTab] = useState(activeTab || 0);

	const blockProps = useBlockProps({
		className: `fk-tabs fk-tabs--${variant} fk-tabs--editor`,
		'data-active-tab': visibleTab,
	});

	const innerBlocks = useSelect(
		(select) => select('core/block-editor').getBlocks(clientId),
		[clientId]
	);

	const { insertBlock, selectBlock, removeBlock, moveBlockToPosition } = useDispatch(blockEditorStore);

	// Clamp visible tab.
	useEffect(() => {
		if (visibleTab >= innerBlocks.length && innerBlocks.length > 0) {
			setVisibleTab(innerBlocks.length - 1);
		}
	}, [innerBlocks.length]);

	// Apply visibility to inner block DOM nodes.
	useEffect(() => {
		const wrapper = document.querySelector(`[data-active-tab="${visibleTab}"]`);
		if (!wrapper) return;

		const panels = wrapper.querySelectorAll(':scope > .fk-tabs__panels > .block-editor-inner-blocks > .block-editor-block-list__layout > [data-type="wp-figmakit/fk-tab-item"]');
		panels.forEach((panel, i) => {
			panel.style.display = i === visibleTab ? '' : 'none';
		});
	}, [visibleTab, innerBlocks.length]);

	const addTab = useCallback(() => {
		const newBlock = createBlock('wp-figmakit/fk-tab-item', {
			label: __('Tab', 'wp-figmakit') + ' ' + (innerBlocks.length + 1),
		});
		insertBlock(newBlock, innerBlocks.length, clientId);
		setVisibleTab(innerBlocks.length);
	}, [innerBlocks.length, clientId]);

	const deleteTab = useCallback((index) => {
		if (innerBlocks.length <= 1) return;
		const block = innerBlocks[index];
		if (block) {
			removeBlock(block.clientId);
			if (visibleTab >= innerBlocks.length - 1) {
				setVisibleTab(Math.max(0, innerBlocks.length - 2));
			}
		}
	}, [innerBlocks, visibleTab]);

	const moveTab = useCallback((fromIndex, toIndex) => {
		if (toIndex < 0 || toIndex >= innerBlocks.length) return;
		const block = innerBlocks[fromIndex];
		if (block) {
			moveBlockToPosition(block.clientId, clientId, clientId, toIndex);
			setVisibleTab(toIndex);
		}
	}, [innerBlocks, clientId]);

	const switchToTab = useCallback((i) => {
		setVisibleTab(i);
		setAttributes({ activeTab: i });
		if (innerBlocks[i]) {
			selectBlock(innerBlocks[i].clientId);
		}
	}, [innerBlocks, setAttributes]);

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'fk-tabs__panels' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: DEFAULT_TEMPLATE,
			templateLock: false,
			renderAppender: false,
		}
	);

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Tabs Settings', 'wp-figmakit')}>
					<SelectControl
						label={__('Layout', 'wp-figmakit')}
						value={variant}
						options={[
							{ label: __('Horizontal', 'wp-figmakit'), value: 'horizontal' },
							{ label: __('Vertical', 'wp-figmakit'), value: 'vertical' },
						]}
						onChange={(val) => setAttributes({ variant: val })}
					/>
				</PanelBody>

				<PanelBody title={__('Manage Tabs', 'wp-figmakit')} initialOpen={true}>
					<div className="fk-tabs-manager">
						{innerBlocks.map((block, i) => {
							const label = block.attributes.label || __('Tab', 'wp-figmakit') + ' ' + (i + 1);
							const isActive = i === visibleTab;

							return (
								<div
									key={block.clientId}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 4,
										padding: '6px 0',
										borderBottom: '1px solid #e0e0e0',
										background: isActive ? '#f0f0f0' : 'transparent',
										borderRadius: 2,
										marginBottom: 2,
										paddingLeft: 4,
										paddingRight: 4,
									}}
								>
									{/* Tab label — click to select */}
									<button
										type="button"
										onClick={() => switchToTab(i)}
										style={{
											flex: 1,
											background: 'none',
											border: 'none',
											cursor: 'pointer',
											textAlign: 'left',
											padding: '2px 4px',
											fontWeight: isActive ? 600 : 400,
											fontSize: 13,
											color: '#1e1e1e',
										}}
										title={__('Select this tab', 'wp-figmakit')}
									>
										{label}
									</button>

									{/* Move up */}
									<Button
										icon="arrow-up-alt2"
										label={__('Move up', 'wp-figmakit')}
										onClick={() => moveTab(i, i - 1)}
										disabled={i === 0}
										isSmall
										size="small"
									/>

									{/* Move down */}
									<Button
										icon="arrow-down-alt2"
										label={__('Move down', 'wp-figmakit')}
										onClick={() => moveTab(i, i + 1)}
										disabled={i === innerBlocks.length - 1}
										isSmall
										size="small"
									/>

									{/* Delete */}
									<Button
										icon="trash"
										label={__('Delete tab', 'wp-figmakit')}
										onClick={() => deleteTab(i)}
										disabled={innerBlocks.length <= 1}
										isSmall
										isDestructive
										size="small"
									/>
								</div>
							);
						})}

						<Button
							icon="plus"
							onClick={addTab}
							variant="secondary"
							isSmall
							style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
						>
							{__('Add Tab', 'wp-figmakit')}
						</Button>
					</div>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{/* Tab navigation */}
				<div className="fk-tabs__nav">
					{innerBlocks.map((block, i) => {
						const label = block.attributes.label || __('Tab', 'wp-figmakit');
						const sup = block.attributes.superscript || '';
						const isActive = i === visibleTab;
						return (
							<button
								key={block.clientId}
								type="button"
								className={`fk-tabs__tab${isActive ? ' fk-tabs__tab--active' : ''}`}
								onClick={() => switchToTab(i)}
							>
								<span className="fk-tabs__tab-label">{label}</span>
								{sup && <sup className="fk-tabs__tab-sup">{sup}</sup>}
							</button>
						);
					})}
					<Button
						icon="plus"
						label={__('Add Tab', 'wp-figmakit')}
						className="fk-tabs__add-tab"
						onClick={addTab}
						isSmall
					/>
				</div>

				{/* Tab panels */}
				<div {...innerBlocksProps} />
			</div>
		</Fragment>
	);
}
