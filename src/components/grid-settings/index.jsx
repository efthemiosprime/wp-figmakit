const { registerPlugin } = wp.plugins;
const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
const { Fragment, useState, useEffect, useCallback } = wp.element;
const { PanelBody, TextControl, Button, Notice } = wp.components;
const { __ } = wp.i18n;

const GRID_FIELDS = [
	{ key: 'grid_container_max', label: 'Container Max Width', default: '1440px', desc: 'Max width of .fk-row' },
	{ key: 'grid_container_padding', label: 'Padding (Desktop)', default: '160px', desc: 'Side padding on desktop' },
	{ key: 'grid_container_padding_tablet', label: 'Padding (Tablet)', default: '32px', desc: 'Side padding on tablet' },
	{ key: 'grid_container_padding_mobile', label: 'Padding (Mobile)', default: '24px', desc: 'Side padding on mobile' },
	{ key: 'grid_gutter', label: 'Gutter (Desktop)', default: '24px', desc: 'Column gap' },
	{ key: 'grid_gutter_mobile', label: 'Gutter (Mobile)', default: '16px', desc: 'Column gap on mobile' },
];

function GridSettingsPanel() {
	const [values, setValues] = useState({});
	const [saved, setSaved] = useState(false);
	const [loading, setLoading] = useState(true);

	// Load current settings from REST API
	useEffect(() => {
		wp.apiFetch({ path: '/wp/v2/settings' }).then((settings) => {
			const opts = settings.wp_figmakit_options || {};
			const loaded = {};
			GRID_FIELDS.forEach((f) => {
				loaded[f.key] = opts[f.key] || f.default;
			});
			setValues(loaded);
			setLoading(false);
		}).catch(() => {
			// Fallback: load defaults
			const defaults = {};
			GRID_FIELDS.forEach((f) => { defaults[f.key] = f.default; });
			setValues(defaults);
			setLoading(false);
		});
	}, []);

	const updateValue = useCallback((key, val) => {
		setValues((prev) => ({ ...prev, [key]: val }));
		setSaved(false);
	}, []);

	const saveSettings = useCallback(() => {
		// Save via REST API
		wp.apiFetch({
			path: '/wp-figmakit/v1/grid-settings',
			method: 'POST',
			data: values,
		}).then(() => {
			setSaved(true);
			// Update CSS custom properties live in the editor
			const root = document.querySelector('.editor-styles-wrapper') ||
				document.querySelector('.block-editor-block-list__layout');
			if (root) {
				root.style.setProperty('--fk-container-max', values.grid_container_max);
				root.style.setProperty('--fk-container-padding', values.grid_container_padding);
				root.style.setProperty('--fk-gutter', values.grid_gutter);
			}
			setTimeout(() => setSaved(false), 3000);
		});
	}, [values]);

	if (loading) {
		return <div style={{ padding: '16px' }}>{__('Loading…', 'wp-figmakit')}</div>;
	}

	return (
		<div className="fk-grid-settings">
			{saved && (
				<Notice status="success" isDismissible={false}>
					{__('Grid settings saved.', 'wp-figmakit')}
				</Notice>
			)}
			<PanelBody title={__('Grid Settings', 'wp-figmakit')} initialOpen={true}>
				{GRID_FIELDS.map((field) => (
					<TextControl
						key={field.key}
						label={field.label}
						help={field.desc + ' — Default: ' + field.default}
						value={values[field.key] || ''}
						onChange={(val) => updateValue(field.key, val)}
						placeholder={field.default}
						__nextHasNoMarginBottom
					/>
				))}
				<Button
					variant="primary"
					onClick={saveSettings}
					style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
				>
					{__('Save Grid Settings', 'wp-figmakit')}
				</Button>
			</PanelBody>
		</div>
	);
}

registerPlugin('wp-figmakit-grid-settings', {
	icon: 'grid-view',
	render: () => (
		<Fragment>
			<PluginSidebarMoreMenuItem target="wp-figmakit-grid-settings">
				{__('Grid Settings', 'wp-figmakit')}
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name="wp-figmakit-grid-settings"
				title={__('Grid Settings', 'wp-figmakit')}
				icon="grid-view"
			>
				<GridSettingsPanel />
			</PluginSidebar>
		</Fragment>
	),
});
