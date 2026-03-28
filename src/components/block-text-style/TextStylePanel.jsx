const { useCallback, useMemo } = wp.element;
const { PanelBody, SelectControl } = wp.components;
const { useSelect } = wp.data;
const { __ } = wp.i18n;

const FONT_WEIGHT_OPTIONS = [
	{ label: '—', value: '' },
	{ label: 'Light (300)', value: 'fk-fw-light' },
	{ label: 'Normal (400)', value: 'fk-fw-normal' },
	{ label: 'Medium (500)', value: 'fk-fw-medium' },
	{ label: 'Semibold (600)', value: 'fk-fw-semibold' },
	{ label: 'Bold (700)', value: 'fk-fw-bold' },
	{ label: 'Black (900)', value: 'fk-fw-black' },
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

function useFontFamilyOptions() {
	const fontFamilies = useSelect((select) => {
		const settings = select('core/block-editor').getSettings();
		return settings.fontFamilies || settings.__experimentalFeatures?.typography?.fontFamilies?.theme || [];
	}, []);

	return useMemo(() => {
		const options = [{ label: '—', value: '' }];
		if (Array.isArray(fontFamilies)) {
			fontFamilies.forEach((f) => {
				if (f.slug && f.name) {
					options.push({ label: f.name, value: f.slug });
				}
			});
		}
		return options;
	}, [fontFamilies]);
}

export default function TextStylePanel({ attributes, setAttributes }) {
	const textStyle = attributes.fkTextStyle || {};
	const fontFamilyOptions = useFontFamilyOptions();

	const update = useCallback((key, value) => {
		setAttributes({ fkTextStyle: { ...textStyle, [key]: value } });
	}, [textStyle, setAttributes]);

	return (
		<PanelBody
			title={__('Text Style', 'wp-figmakit')}
			initialOpen={false}
			className="fk-text-style-panel"
		>
			<SelectControl
				label={__('Weight', 'wp-figmakit')}
				value={textStyle.weight || ''}
				options={FONT_WEIGHT_OPTIONS}
				onChange={(val) => update('weight', val)}
				__nextHasNoMarginBottom
			/>
			<SelectControl
				label={__('Font', 'wp-figmakit')}
				value={textStyle.family || ''}
				options={fontFamilyOptions}
				onChange={(val) => update('family', val)}
				__nextHasNoMarginBottom
			/>
			<SelectControl
				label={__('Color', 'wp-figmakit')}
				value={textStyle.color || ''}
				options={TEXT_COLOR_OPTIONS}
				onChange={(val) => update('color', val)}
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);
}
