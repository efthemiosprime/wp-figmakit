export default function ToolbarButton({ icon: Icon, label, isActive, onClick }) {
	return (
		<button
			className={`fk-toolbar__btn ${isActive ? 'is-active' : ''}`}
			onClick={onClick}
			title={label}
			type="button"
		>
			{typeof Icon === 'function' ? <Icon /> : <span className={`dashicons dashicons-${Icon}`} />}
		</button>
	);
}
