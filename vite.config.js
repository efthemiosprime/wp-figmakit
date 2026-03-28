import { defineConfig } from 'vite';
import path from 'path';
import { readdirSync, existsSync } from 'fs';

/**
 * Auto-discover block entry points from src/blocks/
 * Each block folder with an index.js becomes an entry.
 */
function getBlockEntries() {
	const blocksDir = path.resolve(__dirname, 'src/blocks');
	const entries = {};

	if (!existsSync(blocksDir)) {
		return entries;
	}

	readdirSync(blocksDir, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.forEach((dir) => {
			const entry = path.resolve(blocksDir, dir.name, 'index.js');
			if (existsSync(entry)) {
				entries[`block-${dir.name}`] = entry;
			}
		});

	return entries;
}

export default defineConfig({
	root: '.',
	base: './',
	esbuild: {
		jsxFactory: 'wp.element.createElement',
		jsxFragment: 'wp.element.Fragment',
	},
	build: {
		outDir: 'dist',
		manifest: true,
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, 'src/main.js'),
				editor: path.resolve(__dirname, 'src/editor.js'),
				'tabs-frontend': path.resolve(__dirname, 'src/blocks/tabs/tabs-frontend.js'),
			'accordion-frontend': path.resolve(__dirname, 'src/blocks/accordion/accordion-frontend.js'),
			'modal-frontend': path.resolve(__dirname, 'src/blocks/modal/modal-frontend.js'),
			'isi-tray-frontend': path.resolve(__dirname, 'src/blocks/isi-tray/isi-tray-frontend.js'),
				...getBlockEntries(),
			},
		},
	},
	css: {
		preprocessorOptions: {
			scss: {},
		},
	},
	server: {
		port: 5173,
		strictPort: true,
		cors: true,
	},
});
