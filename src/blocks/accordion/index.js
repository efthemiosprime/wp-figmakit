import './accordion.scss';
import edit from './edit.jsx';
import save from './save.jsx';

const { registerBlockType } = wp.blocks;
const { createElement } = wp.element;

const accordionIcon = createElement('svg', {
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
	createElement('path', { key: '1', d: 'M3 5h8' }),
	createElement('path', { key: '2', d: 'M3 12h8' }),
	createElement('path', { key: '3', d: 'M3 19h8' }),
	createElement('path', { key: '4', d: 'm15 8 3-3 3 3' }),
	createElement('path', { key: '5', d: 'm15 16 3 3 3-3' }),
]);

registerBlockType('wp-figmakit/fk-accordion', {
	icon: accordionIcon,
	edit,
	save,
});
