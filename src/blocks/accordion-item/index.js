import edit from './edit.jsx';
import save from './save.jsx';

const { registerBlockType } = wp.blocks;
const { createElement } = wp.element;

const itemIcon = createElement('svg', {
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
	createElement('path', { key: '1', d: 'M3 12h18' }),
	createElement('path', { key: '2', d: 'M12 3v18' }),
]);

registerBlockType('wp-figmakit/fk-accordion-item', {
	icon: itemIcon,
	edit,
	save,
});
