import { createBlockExtension } from '../../lib/create-block-extension';
import VariantPanel from './VariantPanel';

createBlockExtension({
	name: 'button-variant',
	attribute: {
		key: 'fkButtonVariant',
		type: 'string',
		default: 'primary',
	},
	blockFilter: (name) => name === 'core/button',
	getClasses: (variant) => {
		if (!variant || variant === 'primary') return [];
		return [`fk-btn--${variant}`];
	},
	Panel: VariantPanel,
});
