import Toolbar from './Toolbar';

const { createRoot } = wp.element;

function mountToolbar() {
	const editorWrapper = document.querySelector('.editor-editor-interface') ||
		document.querySelector('.edit-post-layout') ||
		document.querySelector('#editor');

	if (!editorWrapper) {
		// Retry — editor may not be ready yet
		setTimeout(mountToolbar, 500);
		return;
	}

	// Don't mount twice
	if (document.getElementById('fk-toolbar-root')) return;

	const container = document.createElement('div');
	container.id = 'fk-toolbar-root';
	document.body.appendChild(container);

	const root = createRoot(container);
	root.render(<Toolbar />);
}

wp.domReady(() => {
	// Delay slightly to ensure editor DOM is fully rendered
	setTimeout(mountToolbar, 1000);
});
