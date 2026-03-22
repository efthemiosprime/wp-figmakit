import './header.scss';
import edit from './edit.jsx';
import save from './save.jsx';

const { registerBlockType } = wp.blocks;
const { createElement } = wp.element;

const headerIcon = createElement('svg', {
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
	createElement('rect', { key: 'r1', width: 20, height: 4, x: 2, y: 3, rx: 1 }),
	createElement('rect', { key: 'r2', width: 20, height: 12, x: 2, y: 9, rx: 1 }),
	createElement('line', { key: 'l1', x1: 6, x2: 10, y1: 14, y2: 14 }),
	createElement('line', { key: 'l2', x1: 13, x2: 18, y1: 14, y2: 14 }),
]);

registerBlockType('wp-figmakit/fk-header', {
	icon: headerIcon,
	edit,
	save,
});
