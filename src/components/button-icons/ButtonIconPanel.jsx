const { useCallback } = wp.element;
const { PanelBody, Button, ButtonGroup } = wp.components;
const { __ } = wp.i18n;

const DASHICONS = [
	'arrow-right-alt', 'arrow-right-alt2',
	'arrow-left-alt', 'arrow-left-alt2',
	'arrow-up-alt', 'arrow-down-alt',
	'external', 'download',
	'upload', 'cart',
	'email', 'email-alt',
	'phone', 'search',
	'star-filled', 'star-empty',
	'heart', 'plus-alt',
	'minus', 'info',
	'warning', 'yes',
	'no', 'lock',
	'unlock', 'calendar',
	'clock', 'location',
	'admin-users', 'share',
];

const POSITIONS = [
	{ value: 'leading', label: __('Leading', 'wp-figmakit') },
	{ value: 'trailing', label: __('Trailing', 'wp-figmakit') },
	{ value: 'icon-only', label: __('Icon only', 'wp-figmakit') },
];

export default function ButtonIconPanel({ attributes, setAttributes }) {
	const icon = attributes.fkButtonIcon || '';
	const rawPosition = attributes.fkButtonIconPosition || 'leading';
	const position =
		rawPosition === 'before' ? 'leading' :
		rawPosition === 'after' ? 'trailing' :
		rawPosition;

	const clearIcon = useCallback(() => {
		setAttributes({ fkButtonIcon: '' });
	}, [setAttributes]);

	return (
		<PanelBody
			title={__('Button Icon', 'wp-figmakit')}
			initialOpen={false}
			className="fk-button-icons-panel"
		>
			<div className="fk-button-icons-panel__position">
				<label className="fk-button-icons-panel__label">
					{__('Position', 'wp-figmakit')}
				</label>
				<ButtonGroup className="fk-button-icons-panel__position-group">
					{POSITIONS.map((p) => (
						<Button
							key={p.value}
							variant={position === p.value ? 'primary' : 'secondary'}
							size="small"
							onClick={() => setAttributes({ fkButtonIconPosition: p.value })}
						>
							{p.label}
						</Button>
					))}
				</ButtonGroup>
			</div>

			<div className="fk-button-icons-panel__grid">
				{DASHICONS.map((name) => (
					<button
						key={name}
						type="button"
						className={`fk-button-icons-panel__icon ${icon === name ? 'is-selected' : ''}`}
						onClick={() => setAttributes({ fkButtonIcon: name })}
						title={name}
					>
						<span className={`dashicons dashicons-${name}`} />
					</button>
				))}
			</div>

			{icon && (
				<Button
					variant="tertiary"
					isDestructive
					size="small"
					onClick={clearIcon}
					className="fk-button-icons-panel__clear"
				>
					{__('Remove Icon', 'wp-figmakit')}
				</Button>
			)}
		</PanelBody>
	);
}
