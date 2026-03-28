const { PanelBody, ButtonGroup, Button } = wp.components;
const { __ } = wp.i18n;

const VARIANTS = [
	{ value: 'primary', label: __('Primary', 'wp-figmakit') },
	{ value: 'secondary', label: __('Secondary', 'wp-figmakit') },
	{ value: 'tertiary', label: __('Tertiary', 'wp-figmakit') },
	{ value: 'link', label: __('Link', 'wp-figmakit') },
];

export default function VariantPanel({ attributes, setAttributes }) {
	const variant = attributes.fkButtonVariant || 'primary';

	return (
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
	);
}
