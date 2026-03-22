const { useState, useEffect, useCallback, useRef } = wp.element;
const { TextControl, Button, Notice } = wp.components;
const { __ } = wp.i18n;

const GRID_FIELDS = [
	{ key: 'grid_container_max', label: 'Container Max Width', default: '1440px' },
	{ key: 'grid_container_padding', label: 'Padding (Desktop)', default: '160px' },
	{ key: 'grid_container_padding_tablet', label: 'Padding (Tablet)', default: '32px' },
	{ key: 'grid_container_padding_mobile', label: 'Padding (Mobile)', default: '24px' },
	{ key: 'grid_gutter', label: 'Gutter (Desktop)', default: '24px' },
	{ key: 'grid_gutter_mobile', label: 'Gutter (Mobile)', default: '16px' },
];

export default function GridPanel() {
	const [values, setValues] = useState({});
	const [saved, setSaved] = useState(false);
	const [loading, setLoading] = useState(true);
	const timerRef = useRef();

	useEffect(() => () => clearTimeout(timerRef.current), []);

	useEffect(() => {
		wp.apiFetch({ path: '/wp-figmakit/v1/grid-settings' }).then((data) => {
			setValues(data);
			setLoading(false);
		}).catch(() => {
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
		wp.apiFetch({
			path: '/wp-figmakit/v1/grid-settings',
			method: 'POST',
			data: values,
		}).then(() => {
			setSaved(true);
			// Update CSS vars live in editor
			const iframe = document.querySelector('iframe[name="editor-canvas"]');
			const root = iframe ? iframe.contentDocument.documentElement : document.documentElement;
			root.style.setProperty('--fk-container-max', values.grid_container_max);
			root.style.setProperty('--fk-container-padding', values.grid_container_padding);
			root.style.setProperty('--fk-gutter', values.grid_gutter);
			clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => setSaved(false), 3000);
		});
	}, [values]);

	if (loading) return <p>{__('Loading…', 'wp-figmakit')}</p>;

	return (
		<div className="fk-panel-grid">
			{saved && (
				<Notice status="success" isDismissible={false}>
					{__('Saved.', 'wp-figmakit')}
				</Notice>
			)}
			{GRID_FIELDS.map((field) => (
				<TextControl
					key={field.key}
					label={field.label}
					value={values[field.key] || ''}
					onChange={(val) => updateValue(field.key, val)}
					placeholder={field.default}
					__nextHasNoMarginBottom
				/>
			))}
			<Button variant="primary" onClick={saveSettings} className="fk-panel-grid__save">
				{__('Save', 'wp-figmakit')}
			</Button>
		</div>
	);
}
