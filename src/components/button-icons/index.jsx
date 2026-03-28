import { createBlockExtension } from '../../lib/create-block-extension';
import ButtonIconPanel from './ButtonIconPanel';

/**
 * Dashicon name → Unicode codepoint for CSS content property.
 * Used to render icons via ::before/::after pseudo-elements in the editor.
 */
const DASHICON_UNICODE = {
	'arrow-right-alt':  '\\f344',
	'arrow-right-alt2': '\\f345',
	'arrow-left-alt':   '\\f340',
	'arrow-left-alt2':  '\\f341',
	'arrow-up-alt':     '\\f342',
	'arrow-up-alt2':    '\\f343',
	'arrow-down-alt':   '\\f346',
	'arrow-down-alt2':  '\\f347',
	'external':         '\\f504',
	'download':         '\\f316',
	'upload':           '\\f317',
	'cart':             '\\f174',
	'email':            '\\f465',
	'email-alt':        '\\f466',
	'phone':            '\\f525',
	'search':           '\\f179',
	'star-filled':      '\\f155',
	'star-empty':       '\\f154',
	'heart':            '\\f487',
	'plus-alt':         '\\f502',
	'minus':            '\\f460',
	'info':             '\\f348',
	'warning':          '\\f534',
	'yes':              '\\f147',
	'no':               '\\f158',
	'lock':             '\\f160',
	'unlock':           '\\f528',
	'calendar':         '\\f145',
	'clock':            '\\f469',
	'location':         '\\f230',
	'admin-users':      '\\f110',
	'share':            '\\f237',
};

function normalizePosition(pos) {
	if (pos === 'before') return 'leading';
	if (pos === 'after') return 'trailing';
	return pos || 'leading';
}

createBlockExtension({
	name: 'button-icons',
	attribute: {
		key: 'fkButtonIcon',
		type: 'string',
		default: '',
	},
	extraAttributes: {
		fkButtonIconPosition: {
			type: 'string',
			default: 'leading',
		},
	},
	blockFilter: (name) => name === 'core/button',

	getClasses: (icon, allAttrs) => {
		if (!icon) return [];

		const position = normalizePosition(allAttrs.fkButtonIconPosition);
		const classes = [
			'fk-has-button-icon',
			`fk-icon-position-${position}`,
		];

		if (position === 'icon-only') {
			classes.push('fk-icon-only');
		}

		return classes;
	},

	getWrapperProps: (icon, existingWP, allAttrs) => {
		if (!icon) return null;

		const codepoint = DASHICON_UNICODE[icon];
		if (!codepoint) return null;

		return {
			...(existingWP || {}),
			style: {
				...(existingWP?.style || {}),
				'--fk-btn-icon-content': `"${codepoint}"`,
			},
		};
	},

	Panel: ButtonIconPanel,
});
