import './feature.scss';
import edit from './edit.jsx';
import save from './save.jsx';

const { registerBlockType } = wp.blocks;
const { createElement } = wp.element;

const featureIcon = createElement('svg', {
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
	createElement('circle', { key: 'c', cx: 12, cy: 8, r: 4 }),
	createElement('line', { key: 'l1', x1: 8, x2: 16, y1: 16, y2: 16 }),
	createElement('line', { key: 'l2', x1: 10, x2: 14, y1: 20, y2: 20 }),
]);

registerBlockType('wp-figmakit/fk-feature', {
	icon: featureIcon,
	edit,
	save,
});
