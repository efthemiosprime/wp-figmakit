const { __ } = wp.i18n;

export default function FlyoutPanel({ title, isOpen, onClose, children }) {
	return (
		<div className={`fk-flyout ${isOpen ? 'is-open' : ''}`}>
			<div className="fk-flyout__header">
				<h2 className="fk-flyout__title">{title}</h2>
				<button
					className="fk-flyout__close"
					onClick={onClose}
					type="button"
					title={__('Close', 'wp-figmakit')}
				>
					<span className="dashicons dashicons-no-alt" />
				</button>
			</div>
			<div className="fk-flyout__content">
				{children}
			</div>
		</div>
	);
}
