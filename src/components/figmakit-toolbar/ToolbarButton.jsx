export default function ToolbarButton({ icon, label, isActive, onClick }) {
	return (
		<button
			className={`fk-toolbar__btn ${isActive ? 'is-active' : ''}`}
			onClick={onClick}
			title={label}
			type="button"
		>
			<span className={`dashicons dashicons-${icon}`} />
		</button>
	);
}
