const { useCallback } = wp.element;
const { ToolbarGroup, ToolbarDropdownMenu, MenuGroup, MenuItem } = wp.components;
const { __ } = wp.i18n;

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

export { TEXT_STYLES };

export default function TextStyleToolbar({ attributes, setAttributes }) {
	const textStyle = attributes.fkTextStyle || {};
	const currentStyle = TEXT_STYLES.find((s) => s.value === textStyle.style);

	const updateStyle = useCallback((value) => {
		setAttributes({ fkTextStyle: { ...textStyle, style: value } });
	}, [textStyle, setAttributes]);

	return (
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
								onClick={() => { updateStyle(''); onClose(); }}
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
								onClick={() => { updateStyle(style.value); onClose(); }}
								className={textStyle.style === style.value ? 'is-active' : ''}
							>
								{style.label}
							</MenuItem>
						))}
					</MenuGroup>
				)}
			</ToolbarDropdownMenu>
		</ToolbarGroup>
	);
}
