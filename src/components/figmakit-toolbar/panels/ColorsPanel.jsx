const { useState, useEffect, useCallback, useRef } = wp.element;
const { ColorPicker, Button, TextControl, Notice } = wp.components;
const { __ } = wp.i18n;

const DEFAULT_COLORS = [
	{ key: 'color_primary', label: 'Primary', cssVar: '--fk-color-primary', default: '#1a1a2e' },
	{ key: 'color_secondary', label: 'Secondary', cssVar: '--fk-color-secondary', default: '#16213e' },
	{ key: 'color_accent', label: 'Accent', cssVar: '--fk-color-accent', default: '#0f3460' },
	{ key: 'color_highlight', label: 'Highlight', cssVar: '--fk-color-highlight', default: '#e94560' },
	{ key: 'color_text', label: 'Text', cssVar: '--fk-color-text', default: '#333333' },
	{ key: 'color_text_light', label: 'Text Light', cssVar: '--fk-color-text-light', default: '#666666' },
	{ key: 'color_bg', label: 'Background', cssVar: '--fk-color-bg', default: '#ffffff' },
];

function ColorField({ field, value, onChange, onRemove, isCustom }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="fk-color-field">
			<div className="fk-color-field__row" onClick={() => setIsOpen(!isOpen)}>
				<span
					className="fk-color-field__swatch"
					style={{ backgroundColor: value }}
				/>
				<span className="fk-color-field__label">{field.label}</span>
				<span className="fk-color-field__value">{value}</span>
				{isCustom && (
					<button
						className="fk-color-field__remove"
						onClick={(e) => { e.stopPropagation(); onRemove(field.key); }}
						title={__('Remove', 'wp-figmakit')}
						type="button"
					>
						<span className="dashicons dashicons-no-alt" />
					</button>
				)}
			</div>
			{isOpen && (
				<div className="fk-color-field__picker">
					<ColorPicker
						color={value}
						onChange={(color) => onChange(field.key, color)}
						enableAlpha={false}
					/>
				</div>
			)}
		</div>
	);
}

function slugify(name) {
	return 'color_custom_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function cssVarFromKey(key) {
	return '--fk-' + key.replace(/_/g, '-');
}

export default function ColorsPanel() {
	const [values, setValues] = useState({});
	const [customColors, setCustomColors] = useState([]);
	const [saved, setSaved] = useState(false);
	const [loading, setLoading] = useState(true);
	const timerRef = useRef();

	useEffect(() => () => clearTimeout(timerRef.current), []);
	const [newName, setNewName] = useState('');

	useEffect(() => {
		wp.apiFetch({ path: '/wp-figmakit/v1/color-settings' }).then((data) => {
			const { _custom_colors, ...colorValues } = data;
			setValues(colorValues);
			if (_custom_colors) {
				setCustomColors(_custom_colors);
			}
			setLoading(false);
		}).catch(() => {
			const defaults = {};
			DEFAULT_COLORS.forEach((f) => { defaults[f.key] = f.default; });
			setValues(defaults);
			setLoading(false);
		});
	}, []);

	const updateColor = useCallback((key, color) => {
		setValues((prev) => ({ ...prev, [key]: color }));
		setSaved(false);

		// Live preview
		const cssVar = cssVarFromKey(key);
		const iframe = document.querySelector('iframe[name="editor-canvas"]');
		if (iframe && iframe.contentDocument) {
			iframe.contentDocument.documentElement.style.setProperty(cssVar, color);
		}
		document.documentElement.style.setProperty(cssVar, color);
	}, []);

	const addColor = useCallback(() => {
		if (!newName.trim()) return;
		const key = slugify(newName);

		// Don't add duplicates
		if (values[key] || customColors.find((c) => c.key === key)) return;

		const newField = {
			key: key,
			label: newName.trim(),
			cssVar: cssVarFromKey(key),
		};

		setCustomColors((prev) => [...prev, newField]);
		setValues((prev) => ({ ...prev, [key]: '#000000' }));
		setNewName('');
		setSaved(false);
	}, [newName, values, customColors]);

	const removeColor = useCallback((key) => {
		setCustomColors((prev) => prev.filter((c) => c.key !== key));
		setValues((prev) => {
			const next = { ...prev };
			delete next[key];
			return next;
		});
		setSaved(false);

		// Remove CSS var
		const cssVar = cssVarFromKey(key);
		const iframe = document.querySelector('iframe[name="editor-canvas"]');
		if (iframe && iframe.contentDocument) {
			iframe.contentDocument.documentElement.style.removeProperty(cssVar);
		}
		document.documentElement.style.removeProperty(cssVar);
	}, []);

	const saveColors = useCallback(() => {
		wp.apiFetch({
			path: '/wp-figmakit/v1/color-settings',
			method: 'POST',
			data: {
				...values,
				_custom_colors: customColors,
			},
		}).then(() => {
			setSaved(true);
			clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => setSaved(false), 3000);
		});
	}, [values, customColors]);

	if (loading) return <p>{__('Loading…', 'wp-figmakit')}</p>;

	return (
		<div className="fk-panel-colors">
			{saved && (
				<Notice status="success" isDismissible={false}>
					{__('Colors saved.', 'wp-figmakit')}
				</Notice>
			)}

			<div className="fk-panel-colors__section-label">
				{__('Theme Colors', 'wp-figmakit')}
			</div>
			{DEFAULT_COLORS.map((field) => (
				<ColorField
					key={field.key}
					field={field}
					value={values[field.key] || field.default}
					onChange={updateColor}
					isCustom={false}
				/>
			))}

			{customColors.length > 0 && (
				<div className="fk-panel-colors__section-label" style={{ marginTop: '16px' }}>
					{__('Custom Colors', 'wp-figmakit')}
				</div>
			)}
			{customColors.map((field) => (
				<ColorField
					key={field.key}
					field={field}
					value={values[field.key] || '#000000'}
					onChange={updateColor}
					onRemove={removeColor}
					isCustom={true}
				/>
			))}

			<div className="fk-panel-colors__add">
				<TextControl
					placeholder={__('New color name…', 'wp-figmakit')}
					value={newName}
					onChange={setNewName}
					onKeyDown={(e) => { if (e.key === 'Enter') addColor(); }}
					__nextHasNoMarginBottom
				/>
				<Button
					variant="secondary"
					size="small"
					onClick={addColor}
					disabled={!newName.trim()}
				>
					{__('+ Add', 'wp-figmakit')}
				</Button>
			</div>

			<Button variant="primary" onClick={saveColors} className="fk-panel-colors__save">
				{__('Save Colors', 'wp-figmakit')}
			</Button>
		</div>
	);
}
