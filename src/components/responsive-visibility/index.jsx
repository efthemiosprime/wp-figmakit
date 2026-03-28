import { createBlockExtension } from '../../lib/create-block-extension';
import VisibilityPanel from './VisibilityPanel';

createBlockExtension({
	name: 'responsive-visibility',
	attribute: {
		key: 'fkVisibility',
		type: 'object',
		default: { desktop: true, tablet: true, mobile: true },
	},
	getClasses: (vis) => {
		if (!vis) return [];
		const classes = [];
		if (!vis.desktop) classes.push('fk-hide-desktop');
		if (!vis.tablet) classes.push('fk-hide-tablet');
		if (!vis.mobile) classes.push('fk-hide-mobile');
		return classes;
	},
	Panel: VisibilityPanel,
});
