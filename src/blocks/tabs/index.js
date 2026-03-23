import './tabs.scss';
import edit from './edit.jsx';
import save from './save.jsx';

const { registerBlockType } = wp.blocks;
const { createElement } = wp.element;

const tabsIcon = createElement('svg', {
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
	createElement('rect', { key: 'r', width: 20, height: 16, x: 2, y: 4, rx: 2 }),
	createElement('line', { key: 'l1', x1: 8, x2: 8, y1: 4, y2: 9 }),
	createElement('line', { key: 'l2', x1: 14, x2: 14, y1: 4, y2: 9 }),
	createElement('line', { key: 'l3', x1: 2, x2: 22, y1: 9, y2: 9 }),
]);

registerBlockType('wp-figmakit/fk-tabs', {
	icon: tabsIcon,
	edit,
	save,
});
