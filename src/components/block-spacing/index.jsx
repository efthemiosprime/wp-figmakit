import { createBlockExtension } from '../../lib/create-block-extension';
import SpacingPanel from './SpacingPanel';

function getSpacingClasses(spacing) {
	if (!spacing) return [];

	const map = {
		pt: 'pt', pb: 'pb', pl: 'pl', pr: 'pr',
		mt: 'mt', mb: 'mb', ml: 'ml', mr: 'mr',
	};

	const classes = Object.entries(map).reduce((acc, [key, prefix]) => {
		const val = spacing[key];
		if (val) {
			acc.push(`${prefix}-${val}`);
		}
		return acc;
	}, []);

	// Auto-add d-block when left+right margins are auto (centering).
	if (spacing.ml === 'auto' && spacing.mr === 'auto') {
		classes.push('fk-d-block');
	}

	return classes;
}

createBlockExtension({
	name: 'block-spacing',
	attribute: {
		key: 'fkSpacing',
		type: 'object',
		default: {
			pt: '', pb: '', pl: '', pr: '',
			mt: '', mb: '', ml: '', mr: '',
		},
	},
	getClasses: getSpacingClasses,
	Panel: SpacingPanel,
});
