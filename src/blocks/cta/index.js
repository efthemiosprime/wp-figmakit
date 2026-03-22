import './cta.scss';
import edit from './edit.jsx';
import save from './save.jsx';

const { registerBlockType } = wp.blocks;
const { createElement } = wp.element;

const ctaIcon = createElement('svg', {
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
	createElement('rect', { key: 'r', width: 20, height: 14, x: 2, y: 5, rx: 2 }),
	createElement('path', { key: 'p', d: 'M9 15l3-3 3 3' }),
]);

registerBlockType('wp-figmakit/fk-cta', {
	icon: ctaIcon,
	edit,
	save,
});
