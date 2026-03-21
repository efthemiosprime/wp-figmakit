const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useRef, useEffect, useCallback } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, Button, ButtonGroup } = wp.components;
const { __ } = wp.i18n;

const DASHICONS = [
	'arrow-right-alt',
	'arrow-right-alt2',
	'arrow-left-alt',
	'arrow-left-alt2',
	'arrow-up-alt',
	'arrow-down-alt',
	'external',
	'download',
	'upload',
	'cart',
	'email',
	'email-alt',
	'phone',
	'search',
	'star-filled',
	'star-empty',
	'heart',
	'plus-alt',
	'minus',
	'info',
	'warning',
	'yes',
	'no',
	'lock',
	'unlock',
	'calendar',
	'clock',
	'location',
	'admin-users',
	'share',
];

/**
 * Add icon attributes to core/button only.
 */
addFilter('blocks.registerBlockType', 'wp-figmakit/button-icons', (settings, name) => {
	if (name !== 'core/button') return settings;

	settings.attributes = {
		...settings.attributes,
		fkButtonIcon: { type: 'string', default: '' },
		fkButtonIconPosition: { type: 'string', default: 'before' },
	};
	return settings;
});

/**
 * Button icon inspector panel + editor preview.
 */
const withButtonIconPanel = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		if (props.name !== 'core/button') {
			return <BlockEdit {...props} />;
		}

		const { attributes, setAttributes } = props;
		const icon = attributes.fkButtonIcon || '';
		const position = attributes.fkButtonIconPosition || 'before';
		const wrapperRef = useRef(null);

		// Editor preview: inject icon span into button link via DOM
		useEffect(() => {
			if (!wrapperRef.current) return;

			const link = wrapperRef.current.querySelector('.wp-block-button__link');
			if (!link) return;

			// Clean up old icons
			link.querySelectorAll('.fk-btn-icon').forEach((el) => el.remove());

			if (!icon) return;

			const span = document.createElement('span');
			span.className = `fk-btn-icon dashicons dashicons-${icon}`;
			span.setAttribute('aria-hidden', 'true');

			if (position === 'after') {
				link.appendChild(span);
			} else {
				link.prepend(span);
			}

			return () => {
				link.querySelectorAll('.fk-btn-icon').forEach((el) => el.remove());
			};
		}, [icon, position]);

		const clearIcon = useCallback(() => {
			setAttributes({ fkButtonIcon: '' });
		}, [setAttributes]);

		return (
			<Fragment>
				<div ref={wrapperRef}>
					<BlockEdit {...props} />
				</div>
				<InspectorControls>
					<PanelBody
						title={__('Button Icon', 'wp-figmakit')}
						initialOpen={false}
						className="fk-button-icons-panel"
					>
						<div className="fk-button-icons-panel__position">
							<label className="fk-button-icons-panel__label">
								{__('Position', 'wp-figmakit')}
							</label>
							<ButtonGroup>
								<Button
									variant={position === 'before' ? 'primary' : 'secondary'}
									size="small"
									onClick={() => setAttributes({ fkButtonIconPosition: 'before' })}
								>
									{__('Before', 'wp-figmakit')}
								</Button>
								<Button
									variant={position === 'after' ? 'primary' : 'secondary'}
									size="small"
									onClick={() => setAttributes({ fkButtonIconPosition: 'after' })}
								>
									{__('After', 'wp-figmakit')}
								</Button>
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
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withButtonIconPanel');

addFilter('editor.BlockEdit', 'wp-figmakit/button-icons-panel', withButtonIconPanel);
