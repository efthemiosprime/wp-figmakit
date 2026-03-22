const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useCallback } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl } = wp.components;
const { __ } = wp.i18n;

const WIDTH_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Auto', value: 'fk-w-auto' },
	{ label: '25%', value: 'fk-w-25' },
	{ label: '33%', value: 'fk-w-33' },
	{ label: '50%', value: 'fk-w-50' },
	{ label: '66%', value: 'fk-w-66' },
	{ label: '75%', value: 'fk-w-75' },
	{ label: '100%', value: 'fk-w-full' },
	{ label: '100vw', value: 'fk-w-screen' },
];

const MAX_WIDTH_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'None', value: 'fk-mw-none' },
	{ label: '320px (XS)', value: 'fk-mw-xs' },
	{ label: '480px (SM)', value: 'fk-mw-sm' },
	{ label: '640px (MD)', value: 'fk-mw-md' },
	{ label: '768px (LG)', value: 'fk-mw-lg' },
	{ label: '960px (XL)', value: 'fk-mw-xl' },
	{ label: '1200px (2XL)', value: 'fk-mw-2xl' },
	{ label: '1440px (3XL)', value: 'fk-mw-3xl' },
	{ label: '100%', value: 'fk-mw-full' },
];

const HEIGHT_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Auto', value: 'fk-h-auto' },
	{ label: '25%', value: 'fk-h-25' },
	{ label: '50%', value: 'fk-h-50' },
	{ label: '75%', value: 'fk-h-75' },
	{ label: '100%', value: 'fk-h-full' },
	{ label: '100vh', value: 'fk-h-screen' },
];

const MIN_HEIGHT_OPTIONS = [
	{ label: '—', value: '' },
	{ label: '0', value: 'fk-mnh-0' },
	{ label: '200px (XS)', value: 'fk-mnh-xs' },
	{ label: '300px (SM)', value: 'fk-mnh-sm' },
	{ label: '400px (MD)', value: 'fk-mnh-md' },
	{ label: '500px (LG)', value: 'fk-mnh-lg' },
	{ label: '600px (XL)', value: 'fk-mnh-xl' },
	{ label: '800px (2XL)', value: 'fk-mnh-2xl' },
	{ label: '100%', value: 'fk-mnh-full' },
	{ label: '100vh', value: 'fk-mnh-screen' },
];

const MAX_HEIGHT_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'None', value: 'fk-mxh-none' },
	{ label: '100%', value: 'fk-mxh-full' },
	{ label: '100vh', value: 'fk-mxh-screen' },
];

const OVERFLOW_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Hidden', value: 'fk-of-hidden' },
	{ label: 'Auto', value: 'fk-of-auto' },
	{ label: 'Visible', value: 'fk-of-visible' },
	{ label: 'Scroll', value: 'fk-of-scroll' },
];

/**
 * Add fkSizing attribute to all blocks.
 */
addFilter('blocks.registerBlockType', 'wp-figmakit/block-sizing', (settings) => {
	settings.attributes = {
		...settings.attributes,
		fkSizing: {
			type: 'object',
			default: {
				width: '',
				maxWidth: '',
				height: '',
				minHeight: '',
				maxHeight: '',
				overflow: '',
			},
		},
	};
	return settings;
});

/**
 * Build class list from sizing selections.
 */
function getSizingClasses(sizing) {
	if (!sizing) return [];
	return Object.values(sizing).filter(Boolean);
}

/**
 * Sizing panel in the block inspector.
 */
const withSizingPanel = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { attributes, setAttributes } = props;
		const sizing = attributes.fkSizing || {};

		const updateSizing = useCallback((key, value) => {
			setAttributes({ fkSizing: { ...sizing, [key]: value } });
		}, [sizing, setAttributes]);

		return (
			<Fragment>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						title={__('Sizing', 'wp-figmakit')}
						initialOpen={false}
						className="fk-sizing-panel"
					>
						<div className="fk-sizing-panel__section">
							<div className="fk-sizing-panel__heading">
								{__('Width', 'wp-figmakit')}
							</div>
							<SelectControl
								label={__('Width', 'wp-figmakit')}
								value={sizing.width || ''}
								options={WIDTH_OPTIONS}
								onChange={(val) => updateSizing('width', val)}
								__nextHasNoMarginBottom
							/>
							<SelectControl
								label={__('Max Width', 'wp-figmakit')}
								value={sizing.maxWidth || ''}
								options={MAX_WIDTH_OPTIONS}
								onChange={(val) => updateSizing('maxWidth', val)}
								__nextHasNoMarginBottom
							/>
						</div>

						<div className="fk-sizing-panel__section">
							<div className="fk-sizing-panel__heading">
								{__('Height', 'wp-figmakit')}
							</div>
							<SelectControl
								label={__('Height', 'wp-figmakit')}
								value={sizing.height || ''}
								options={HEIGHT_OPTIONS}
								onChange={(val) => updateSizing('height', val)}
								__nextHasNoMarginBottom
							/>
							<SelectControl
								label={__('Min Height', 'wp-figmakit')}
								value={sizing.minHeight || ''}
								options={MIN_HEIGHT_OPTIONS}
								onChange={(val) => updateSizing('minHeight', val)}
								__nextHasNoMarginBottom
							/>
							<SelectControl
								label={__('Max Height', 'wp-figmakit')}
								value={sizing.maxHeight || ''}
								options={MAX_HEIGHT_OPTIONS}
								onChange={(val) => updateSizing('maxHeight', val)}
								__nextHasNoMarginBottom
							/>
						</div>

						<div className="fk-sizing-panel__section">
							<SelectControl
								label={__('Overflow', 'wp-figmakit')}
								value={sizing.overflow || ''}
								options={OVERFLOW_OPTIONS}
								onChange={(val) => updateSizing('overflow', val)}
								__nextHasNoMarginBottom
							/>
						</div>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withSizingPanel');

addFilter('editor.BlockEdit', 'wp-figmakit/block-sizing-panel', withSizingPanel);
