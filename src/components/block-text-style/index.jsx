const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useCallback } = wp.element;
const { BlockControls, InspectorControls } = wp.blockEditor;
const {
	ToolbarGroup,
	ToolbarDropdownMenu,
	MenuGroup,
	MenuItem,
	PanelBody,
	SelectControl,
} = wp.components;
const { __ } = wp.i18n;

const TEXT_BLOCKS = [
	'core/paragraph',
	'core/heading',
	'core/list',
	'core/quote',
	'core/pullquote',
	'core/verse',
	'core/preformatted',
];

const TEXT_STYLES = [
	{ label: 'Title', value: 'fk-text-title', icon: 'heading' },
	{ label: 'Subtitle', value: 'fk-text-subtitle', icon: 'heading' },
	{ label: 'Eyebrow', value: 'fk-text-eyebrow', icon: 'tag' },
	{ label: 'Body LG', value: 'fk-text-body-lg', icon: 'editor-paragraph' },
	{ label: 'Body MD', value: 'fk-text-body-md', icon: 'editor-paragraph' },
	{ label: 'Body SM', value: 'fk-text-body-sm', icon: 'editor-paragraph' },
	{ label: 'Caption', value: 'fk-text-caption', icon: 'editor-textcolor' },
	{ label: 'Footnote', value: 'fk-text-footnote', icon: 'editor-textcolor' },
	{ label: 'Link', value: 'fk-text-link', icon: 'admin-links' },
];

const FONT_WEIGHT_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Light (300)', value: 'fk-fw-light' },
	{ label: 'Normal (400)', value: 'fk-fw-normal' },
	{ label: 'Medium (500)', value: 'fk-fw-medium' },
	{ label: 'Semibold (600)', value: 'fk-fw-semibold' },
	{ label: 'Bold (700)', value: 'fk-fw-bold' },
	{ label: 'Black (900)', value: 'fk-fw-black' },
];

const FONT_FAMILY_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Sans', value: 'fk-ff-sans' },
	{ label: 'Mono', value: 'fk-ff-mono' },
];

const TEXT_COLOR_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Primary', value: 'fk-tc-primary' },
	{ label: 'Secondary', value: 'fk-tc-secondary' },
	{ label: 'Accent', value: 'fk-tc-accent' },
	{ label: 'Highlight', value: 'fk-tc-highlight' },
	{ label: 'Text', value: 'fk-tc-text' },
	{ label: 'Text Light', value: 'fk-tc-text-light' },
	{ label: 'White', value: 'fk-tc-white' },
];

/**
 * Add fkTextStyle attribute to all blocks.
 */
addFilter('blocks.registerBlockType', 'wp-figmakit/block-text-style', (settings) => {
	settings.attributes = {
		...settings.attributes,
		fkTextStyle: {
			type: 'object',
			default: {
				style: '',
				weight: '',
				family: '',
				color: '',
			},
		},
	};
	return settings;
});

/**
 * Build class list from text style selections.
 */
function getTextStyleClasses(textStyle) {
	if (!textStyle) return [];
	return Object.values(textStyle).filter(Boolean);
}

/**
 * Text style toolbar dropdown + inspector panel for weight/family.
 */
const withTextStylePanel = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		if (!TEXT_BLOCKS.includes(props.name)) {
			return <BlockEdit {...props} />;
		}

		const { attributes, setAttributes } = props;
		const textStyle = attributes.fkTextStyle || {};
		const currentStyle = TEXT_STYLES.find((s) => s.value === textStyle.style);

		const updateTextStyle = useCallback((key, value) => {
			setAttributes({ fkTextStyle: { ...textStyle, [key]: value } });
		}, [textStyle, setAttributes]);

		return (
			<Fragment>
				<BlockControls>
					<ToolbarGroup>
						<ToolbarDropdownMenu
							icon="editor-textcolor"
							label={__('Text Style', 'wp-figmakit')}
							text={currentStyle ? currentStyle.label : 'Aa'}
							className="fk-text-style-toolbar"
						>
							{({ onClose }) => (
								<MenuGroup label={__('Text Style', 'wp-figmakit')}>
									{textStyle.style && (
										<MenuItem
											onClick={() => {
												updateTextStyle('style', '');
												onClose();
											}}
											className="fk-text-style-toolbar__clear"
										>
											{__('Clear Style', 'wp-figmakit')}
										</MenuItem>
									)}
									{TEXT_STYLES.map((style) => (
										<MenuItem
											key={style.value}
											icon={style.icon}
											isSelected={textStyle.style === style.value}
											onClick={() => {
												updateTextStyle('style', style.value);
												onClose();
											}}
											className={textStyle.style === style.value ? 'is-active' : ''}
										>
											{style.label}
										</MenuItem>
									))}
								</MenuGroup>
							)}
						</ToolbarDropdownMenu>
					</ToolbarGroup>
				</BlockControls>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						title={__('Text Style', 'wp-figmakit')}
						initialOpen={false}
						className="fk-text-style-panel"
					>
						<SelectControl
							label={__('Weight', 'wp-figmakit')}
							value={textStyle.weight || ''}
							options={FONT_WEIGHT_OPTIONS}
							onChange={(val) => updateTextStyle('weight', val)}
							__nextHasNoMarginBottom
						/>
						<SelectControl
							label={__('Font', 'wp-figmakit')}
							value={textStyle.family || ''}
							options={FONT_FAMILY_OPTIONS}
							onChange={(val) => updateTextStyle('family', val)}
							__nextHasNoMarginBottom
						/>
						<SelectControl
							label={__('Color', 'wp-figmakit')}
							value={textStyle.color || ''}
							options={TEXT_COLOR_OPTIONS}
							onChange={(val) => updateTextStyle('color', val)}
							__nextHasNoMarginBottom
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withTextStylePanel');

addFilter('editor.BlockEdit', 'wp-figmakit/block-text-style-panel', withTextStylePanel);

/**
 * Apply text style classes to block wrapper in the editor.
 */
const withTextStyleClasses = createHigherOrderComponent((BlockListBlock) => {
	return (props) => {
		if (!TEXT_BLOCKS.includes(props.name)) {
			return <BlockListBlock {...props} />;
		}

		const textStyle = props.attributes.fkTextStyle || {};
		const classes = getTextStyleClasses(textStyle);

		if (classes.length === 0) {
			return <BlockListBlock {...props} />;
		}

		const existing = props.className || '';
		const newClassName = [existing, ...classes].filter(Boolean).join(' ');

		return <BlockListBlock {...props} className={newClassName} />;
	};
}, 'withTextStyleClasses');

addFilter('editor.BlockListBlock', 'wp-figmakit/block-text-style-classes', withTextStyleClasses);
