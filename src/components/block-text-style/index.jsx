import { createBlockExtension } from '../../lib/create-block-extension';
import TextStylePanel from './TextStylePanel';
import TextStyleToolbar from './TextStyleToolbar';

const TEXT_BLOCKS = [
	'core/paragraph',
	'core/heading',
	'core/list',
	'core/quote',
	'core/pullquote',
	'core/verse',
	'core/preformatted',
];

createBlockExtension({
	name: 'block-text-style',
	attribute: {
		key: 'fkTextStyle',
		type: 'object',
		default: { style: '', weight: '', family: '', color: '' },
	},
	blockFilter: (name) => TEXT_BLOCKS.includes(name),
	getClasses: (ts) => {
		if (!ts) return [];
		const { family, ...rest } = ts;
		return Object.values(rest).filter(Boolean);
	},
	getWrapperProps: (ts, existingWP) => {
		if (!ts?.family) return null;
		return {
			...(existingWP || {}),
			style: {
				...(existingWP?.style || {}),
				fontFamily: `var(--wp--preset--font-family--${ts.family})`,
			},
		};
	},
	Panel: TextStylePanel,
	Toolbar: TextStyleToolbar,
});
