import { createBlockExtension } from '../../lib/create-block-extension';
import PoliciesPanel from './PoliciesPanel';

createBlockExtension({
	name: 'block-policies',
	attribute: {
		key: 'fkPolicyClasses',
		type: 'array',
		default: [],
	},
	Panel: PoliciesPanel,
});
