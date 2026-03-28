const { Fragment, useCallback } = wp.element;
const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody, TextControl, SelectControl } = wp.components;
const { __ } = wp.i18n;
const { createBlock } = wp.blocks;
const { useDispatch, useSelect } = wp.data;

const VARIANT_OPTIONS = [
	{ label: '1 Column', value: 'one-col' },
	{ label: '2 Columns', value: 'two-col' },
];

const RATIO_OPTIONS = [
	{ label: '65% / 35%', value: '65-35' },
	{ label: '50% / 50%', value: '50-50' },
	{ label: '70% / 30%', value: '70-30' },
];

const ONE_COL_TEMPLATE = [
	['core/group', { className: 'fk-isi-col' }, [
		['core/heading', { level: 4, placeholder: 'Important Safety Information', className: 'fk-isi-col__head' }],
		['core/paragraph', { placeholder: 'Enter safety information content here…' }],
	]],
];

const TWO_COL_TEMPLATE = [
	['core/group', { className: 'fk-isi-col fk-isi-col--left' }, [
		['core/heading', { level: 4, placeholder: 'Important Safety Information', className: 'fk-isi-col__head' }],
		['core/paragraph', { placeholder: 'Enter safety information content here…' }],
	]],
	['core/group', { className: 'fk-isi-col fk-isi-col--right' }, [
		['core/heading', { level: 4, placeholder: 'Indication', className: 'fk-isi-col__head' }],
		['core/paragraph', { placeholder: 'Enter indication content here…' }],
	]],
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		variant,
		collapsedHeight,
		expandedHeight,
		trayTitle,
		colRatio,
		piLink,
		piLinkText,
		fullIsiSelector,
	} = attributes;

	const blockProps = useBlockProps({
		className: `fk-isi-tray--editor fk-isi-tray--${variant}`,
	});

	const { replaceInnerBlocks } = useDispatch('core/block-editor');

	const changeVariant = useCallback((newVariant) => {
		setAttributes({ variant: newVariant });

		const template = newVariant === 'two-col' ? TWO_COL_TEMPLATE : ONE_COL_TEMPLATE;
		const newBlocks = template.map(([name, attrs, children]) => {
			const innerChildren = (children || []).map(([cn, ca]) => createBlock(cn, ca));
			return createBlock(name, attrs, innerChildren);
		});

		replaceInnerBlocks(clientId, newBlocks, false);
	}, [clientId, setAttributes, replaceInnerBlocks]);

	const template = variant === 'two-col' ? TWO_COL_TEMPLATE : ONE_COL_TEMPLATE;

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('ISI Settings', 'wp-figmakit')} initialOpen={true}>
					<SelectControl
						label={__('Layout', 'wp-figmakit')}
						value={variant}
						options={VARIANT_OPTIONS}
						onChange={changeVariant}
						__nextHasNoMarginBottom
					/>
					{variant === 'two-col' && (
						<SelectControl
							label={__('Column Ratio', 'wp-figmakit')}
							value={colRatio}
							options={RATIO_OPTIONS}
							onChange={(val) => setAttributes({ colRatio: val })}
							__nextHasNoMarginBottom
						/>
					)}
					<TextControl
						label={__('Tray Title', 'wp-figmakit')}
						value={trayTitle}
						onChange={(val) => setAttributes({ trayTitle: val })}
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={__('Collapsed Height (px)', 'wp-figmakit')}
						type="number"
						min={60}
						value={String(collapsedHeight)}
						onChange={(val) => setAttributes({ collapsedHeight: parseInt(val, 10) || 116 })}
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={__('Expanded Height (px)', 'wp-figmakit')}
						type="number"
						min={150}
						value={String(expandedHeight)}
						onChange={(val) => setAttributes({ expandedHeight: parseInt(val, 10) || 300 })}
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={__('Full ISI Selector', 'wp-figmakit')}
						help={__('CSS selector of the full ISI section on the page. Tray hides when this element is in view.', 'wp-figmakit')}
						value={fullIsiSelector}
						onChange={(val) => setAttributes({ fullIsiSelector: val })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__('Prescribing Info Link', 'wp-figmakit')} initialOpen={false}>
					<TextControl
						label={__('Link URL', 'wp-figmakit')}
						value={piLink}
						onChange={(val) => setAttributes({ piLink: val })}
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={__('Link Text', 'wp-figmakit')}
						value={piLinkText}
						onChange={(val) => setAttributes({ piLinkText: val })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="fk-isi-tray__editor-label">
					{`ISI Tray — ${variant === 'two-col' ? '2 Columns' : '1 Column'}`}
				</div>
				<div className={`fk-isi-tray__editor-content fk-isi-tray__editor-content--${variant}`}>
					<InnerBlocks
						template={template}
						templateLock={false}
					/>
				</div>
				{piLink && (
					<div className="fk-isi-tray__editor-pi">
						{piLinkText} &rarr;
					</div>
				)}
			</div>
		</Fragment>
	);
}
