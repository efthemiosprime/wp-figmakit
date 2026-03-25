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

const POSITIONS = [
	{ value: 'leading', label: __('Leading', 'wp-figmakit') },
	{ value: 'trailing', label: __('Trailing', 'wp-figmakit') },
	{ value: 'icon-only', label: __('Icon only', 'wp-figmakit') },
];

/**
 * Add icon attributes to core/button only.
 */
addFilter('blocks.registerBlockType', 'wp-figmakit/button-icons', (settings, name) => {
	if (name !== 'core/button') return settings;

	settings.attributes = {
		...settings.attributes,
		fkButtonIcon: { type: 'string', default: '' },
		fkButtonIconPosition: { type: 'string', default: 'leading' },
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
		// Support legacy "before"/"after" values
		const rawPosition = attributes.fkButtonIconPosition || 'leading';
		const position =
			rawPosition === 'before' ? 'leading' :
			rawPosition === 'after' ? 'trailing' :
			rawPosition;
		const wrapperRef = useRef(null);

		// Editor preview: inject icon span into button link via DOM.
		// Uses MutationObserver so the icon survives React re-renders
		// of the inner RichText (typing, focus changes, etc.).
		useEffect(() => {
			if (!wrapperRef.current) return;

			const inject = () => {
				const link = wrapperRef.current?.querySelector('.wp-block-button__link');
				if (!link) return;

				// Already injected — nothing to do
				if (link.querySelector('.fk-btn-icon')) return;

				if (!icon) return;

				const span = document.createElement('span');
				span.className = `fk-btn-icon dashicons dashicons-${icon}`;
				span.setAttribute('aria-hidden', 'true');

				if (position === 'trailing') {
					link.appendChild(span);
				} else {
					link.prepend(span);
				}
			};

			// Clean up any existing icons first (handles icon/position changes)
			const clean = () => {
				wrapperRef.current?.querySelectorAll('.fk-btn-icon').forEach((el) => el.remove());
			};

			clean();
			inject();

			// Re-inject when React rebuilds the button DOM
			const observer = new MutationObserver(inject);
			observer.observe(wrapperRef.current, { childList: true, subtree: true });

			return () => {
				observer.disconnect();
				clean();
			};
		}, [icon, position]);

		// Toggle icon-only class on the editor wrapper
		useEffect(() => {
			if (!wrapperRef.current) return;

			const btn = wrapperRef.current.querySelector('.wp-block-button');
			if (!btn) return;

			btn.classList.toggle('fk-icon-only', !!(icon && position === 'icon-only'));

			return () => {
				btn?.classList.remove('fk-icon-only');
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
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withButtonIconPanel');

addFilter('editor.BlockEdit', 'wp-figmakit/button-icons-panel', withButtonIconPanel);
