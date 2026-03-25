const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, ButtonGroup, Button } = wp.components;
const { __ } = wp.i18n;

const VARIANTS = [
	{ value: 'primary', label: __('Primary', 'wp-figmakit') },
	{ value: 'secondary', label: __('Secondary', 'wp-figmakit') },
	{ value: 'tertiary', label: __('Tertiary', 'wp-figmakit') },
	{ value: 'link', label: __('Link', 'wp-figmakit') },
];

/**
 * Add variant attribute to core/button.
 */
addFilter('blocks.registerBlockType', 'wp-figmakit/button-variant', (settings, name) => {
	if (name !== 'core/button') return settings;

	settings.attributes = {
		...settings.attributes,
		fkButtonVariant: { type: 'string', default: 'primary' },
	};
	return settings;
});

/**
 * Variant selector inspector panel.
 */
const withButtonVariantPanel = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		if (props.name !== 'core/button') {
			return <BlockEdit {...props} />;
		}

		const { attributes, setAttributes } = props;
		const variant = attributes.fkButtonVariant || 'primary';

		return (
			<Fragment>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						title={__('Variant', 'wp-figmakit')}
						initialOpen={false}
						className="fk-button-variant-panel"
					>
						<ButtonGroup className="fk-button-variant-panel__group">
							{VARIANTS.map((v) => (
								<Button
									key={v.value}
									variant={variant === v.value ? 'primary' : 'secondary'}
									size="small"
									onClick={() => setAttributes({ fkButtonVariant: v.value })}
								>
									{v.label}
								</Button>
							))}
						</ButtonGroup>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withButtonVariantPanel');

addFilter('editor.BlockEdit', 'wp-figmakit/button-variant-panel', withButtonVariantPanel);

/**
 * Add variant class to block wrapper in editor so styles are visible.
 */
const withVariantEditorClass = createHigherOrderComponent((BlockListBlock) => {
	return (props) => {
		if (props.name !== 'core/button') {
			return <BlockListBlock {...props} />;
		}

		const variant = props.attributes.fkButtonVariant || 'primary';

		if (variant === 'primary') {
			return <BlockListBlock {...props} />;
		}

		const className = props.className
			? `${props.className} fk-btn--${variant}`
			: `fk-btn--${variant}`;

		return <BlockListBlock {...props} className={className} />;
	};
}, 'withVariantEditorClass');

addFilter('editor.BlockListBlock', 'wp-figmakit/button-variant-class', withVariantEditorClass);
