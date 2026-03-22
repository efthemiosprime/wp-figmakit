const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, ToggleControl } = wp.components;
const { __ } = wp.i18n;

/**
 * Add fkVisibility attribute to all blocks.
 */
addFilter('blocks.registerBlockType', 'wp-figmakit/responsive-visibility', (settings) => {
	settings.attributes = {
		...settings.attributes,
		fkVisibility: {
			type: 'object',
			default: { desktop: true, tablet: true, mobile: true },
		},
	};
	return settings;
});

/**
 * Visibility panel in the block inspector.
 */
const withVisibilityPanel = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { attributes, setAttributes } = props;
		const vis = attributes.fkVisibility || { desktop: true, tablet: true, mobile: true };

		const isRestricted = !vis.desktop || !vis.tablet || !vis.mobile;

		const updateVisibility = (breakpoint, value) => {
			setAttributes({
				fkVisibility: { ...vis, [breakpoint]: value },
			});
		};

		return (
			<Fragment>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						title={__('Visibility', 'wp-figmakit')}
						initialOpen={false}
						className="fk-visibility-panel"
					>
						{isRestricted && (
							<div className="fk-visibility-panel__notice">
								{__('This block is hidden on some devices.', 'wp-figmakit')}
							</div>
						)}
						<ToggleControl
							label={__('Desktop', 'wp-figmakit')}
							help={__('Show on screens wider than 1024px', 'wp-figmakit')}
							checked={vis.desktop}
							onChange={(val) => updateVisibility('desktop', val)}
							__nextHasNoMarginBottom
						/>
						<ToggleControl
							label={__('Tablet', 'wp-figmakit')}
							help={__('Show on screens 768px – 1024px', 'wp-figmakit')}
							checked={vis.tablet}
							onChange={(val) => updateVisibility('tablet', val)}
							__nextHasNoMarginBottom
						/>
						<ToggleControl
							label={__('Mobile', 'wp-figmakit')}
							help={__('Show on screens smaller than 768px', 'wp-figmakit')}
							checked={vis.mobile}
							onChange={(val) => updateVisibility('mobile', val)}
							__nextHasNoMarginBottom
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withVisibilityPanel');

addFilter('editor.BlockEdit', 'wp-figmakit/responsive-visibility-panel', withVisibilityPanel);
