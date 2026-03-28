import { createBlockExtension } from '../../lib/create-block-extension';
import SizingPanel from './SizingPanel';

createBlockExtension({
	name: 'block-sizing',
	attribute: {
		key: 'fkSizing',
		type: 'object',
		default: {
			width: '',
			maxWidth: '',
			height: '',
			minHeight: '',
			maxHeight: '',
			overflow: '',
		},
	},
	getClasses: (sizing) => {
		if (!sizing) return [];
		return Object.values(sizing).filter(Boolean);
	},
	Panel: SizingPanel,
});
