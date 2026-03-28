import { createBlockExtension } from '../../lib/create-block-extension';
import LayoutPanel from './LayoutPanel';

function getLayoutClasses(layout) {
	if (!layout) return [];
	return Object.values(layout).filter(Boolean);
}

createBlockExtension({
	name: 'block-layout',
	attribute: {
		key: 'fkLayout',
		type: 'object',
		default: {
			display: '',
			direction: '',
			justify: '',
			align: '',
			wrap: '',
			gap: '',
		},
	},
	extraAttributes: {
		fkLayoutTablet: {
			type: 'object',
			default: { display: '', direction: '' },
		},
		fkLayoutMobile: {
			type: 'object',
			default: { display: '', direction: '' },
		},
		fkColumns: {
			type: 'number',
			default: 0,
			blockFilter: (name) => name === 'core/group',
		},
	},
	getClasses: (layout, allAttributes) => {
		const tablet = allAttributes.fkLayoutTablet || {};
		const mobile = allAttributes.fkLayoutMobile || {};

		return [
			...getLayoutClasses(layout),
			...getLayoutClasses(tablet),
			...getLayoutClasses(mobile),
		];
	},
	Panel: LayoutPanel,
});
