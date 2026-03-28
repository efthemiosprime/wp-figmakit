/**
 * Shared spacing size options used by block-spacing and block-layout gap.
 */

const { __ } = wp.i18n;

export const SPACING_SIZES = [
	{ label: '—', value: '' },
	{ label: '3XL (96px)', value: '3xl' },
	{ label: '2XL (80px)', value: '2xl' },
	{ label: 'XL (48px)', value: 'xl' },
	{ label: 'LG (32px)', value: 'lg' },
	{ label: 'MD (24px)', value: 'md' },
	{ label: 'SM (20px)', value: 'sm' },
	{ label: 'XS (16px)', value: 'xs' },
	{ label: '2XS (12px)', value: '2xs' },
	{ label: '3XS (8px)', value: '3xs' },
	{ label: '4XS (4px)', value: '4xs' },
	{ label: '0', value: '0' },
	{ label: __('Auto', 'wp-figmakit'), value: 'auto' },
];

export const GAP_SIZES = [
	{ label: '—', value: '' },
	{ label: '3XL (96px)', value: 'fk-gap-3xl' },
	{ label: '2XL (80px)', value: 'fk-gap-2xl' },
	{ label: 'XL (48px)', value: 'fk-gap-xl' },
	{ label: 'LG (32px)', value: 'fk-gap-lg' },
	{ label: 'MD (24px)', value: 'fk-gap-md' },
	{ label: 'SM (20px)', value: 'fk-gap-sm' },
	{ label: 'XS (16px)', value: 'fk-gap-xs' },
	{ label: '2XS (12px)', value: 'fk-gap-2xs' },
	{ label: '3XS (8px)', value: 'fk-gap-3xs' },
	{ label: '4XS (4px)', value: 'fk-gap-4xs' },
	{ label: '0', value: 'fk-gap-0' },
];
