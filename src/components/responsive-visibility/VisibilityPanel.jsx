const { PanelBody, ToggleControl } = wp.components;
const { __ } = wp.i18n;

export default function VisibilityPanel({ attributes, setAttributes }) {
	const vis = attributes.fkVisibility || { desktop: true, tablet: true, mobile: true };
	const isRestricted = !vis.desktop || !vis.tablet || !vis.mobile;

	const update = (breakpoint, value) => {
		setAttributes({ fkVisibility: { ...vis, [breakpoint]: value } });
	};

	return (
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
				onChange={(val) => update('desktop', val)}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Tablet', 'wp-figmakit')}
				help={__('Show on screens 768px – 1024px', 'wp-figmakit')}
				checked={vis.tablet}
				onChange={(val) => update('tablet', val)}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Mobile', 'wp-figmakit')}
				help={__('Show on screens smaller than 768px', 'wp-figmakit')}
				checked={vis.mobile}
				onChange={(val) => update('mobile', val)}
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);
}
