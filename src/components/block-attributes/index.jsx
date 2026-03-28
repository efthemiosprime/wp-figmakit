import { createBlockExtension } from '../../lib/create-block-extension';
import AttributesPanel from './AttributesPanel';

createBlockExtension({
	name: 'block-attributes',
	attribute: {
		key: 'fkAttributes',
		type: 'array',
		default: [],
	},
	Panel: AttributesPanel,
});
