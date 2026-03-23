import edit from './edit.jsx';
import save from './save.jsx';

const { registerBlockType } = wp.blocks;
const { createElement } = wp.element;

const tabItemIcon = createElement('svg', {
	xmlns: 'http://www.w3.org/2000/svg',
	width: 24,
	height: 24,
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 2,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
}, [
	createElement('rect', { key: 'r', width: 18, height: 14, x: 3, y: 5, rx: 2 }),
	createElement('path', { key: 'p', d: 'M3 10h18' }),
]);

registerBlockType('wp-figmakit/fk-tab-item', {
	icon: tabItemIcon,
	edit,
	save,
});
