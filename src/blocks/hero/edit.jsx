const { Fragment, useCallback } = wp.element;
const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody, ToggleControl, SelectControl, __experimentalUnitControl: UnitControl } = wp.components;
const { __ } = wp.i18n;
const { createBlock } = wp.blocks;
const { useDispatch, useSelect } = wp.data;

const VARIANT_OPTIONS = [
	{ label: 'Centered', value: 'centered' },
	{ label: 'Split', value: 'split' },
	{ label: 'Image Left', value: 'image-left' },
];

function getTemplate(variant, showButtons) {
	const template = [];

	template.push(['core/heading', {
		level: 1,
		placeholder: 'Hero Title',
		className: 'fk-hero__title',
	}]);

	template.push(['core/paragraph', {
		placeholder: 'Hero description text goes here...',
		className: 'fk-hero__description',
	}]);

	if (showButtons) {
		template.push(['core/buttons', { className: 'fk-hero__buttons' }, [
			['core/button', { placeholder: 'Primary CTA' }],
			['core/button', { placeholder: 'Secondary CTA', className: 'is-style-outline' }],
		]]);
	}

	return template;
}

export default function Edit({ attributes, setAttributes, clientId }) {
	const { variant, showOverlay, minHeight, showButtons } = attributes;

	const blockProps = useBlockProps({
		className: `fk-hero fk-hero--${variant}${showOverlay ? ' fk-hero--overlay' : ''}`,
		style: { minHeight },
	});

	const { replaceInnerBlocks } = useDispatch('core/block-editor');
	const innerBlocks = useSelect((select) => {
		return select('core/block-editor').getBlocks(clientId);
	}, [clientId]);

	const toggleButtons = useCallback(() => {
		const newVal = !showButtons;
		setAttributes({ showButtons: newVal });

		if (newVal) {
			const buttons = createBlock('core/buttons', { className: 'fk-hero__buttons' }, [
				createBlock('core/button', { placeholder: 'Primary CTA' }),
				createBlock('core/button', { placeholder: 'Secondary CTA', className: 'is-style-outline' }),
			]);
			replaceInnerBlocks(clientId, [...innerBlocks, buttons], false);
		} else {
			const filtered = innerBlocks.filter((b) =>
				!(b.name === 'core/buttons' && (b.attributes.className || '').includes('fk-hero__buttons'))
			);
			replaceInnerBlocks(clientId, filtered, false);
		}
	}, [showButtons, innerBlocks, clientId, setAttributes, replaceInnerBlocks]);

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Hero Settings', 'wp-figmakit')} initialOpen={true}>
					<SelectControl
						label={__('Variant', 'wp-figmakit')}
						value={variant}
						options={VARIANT_OPTIONS}
						onChange={(val) => setAttributes({ variant: val })}
						__nextHasNoMarginBottom
					/>
					<UnitControl
						label={__('Min Height', 'wp-figmakit')}
						value={minHeight}
						onChange={(val) => setAttributes({ minHeight: val })}
					/>
					<ToggleControl
						label={__('Show Overlay', 'wp-figmakit')}
						checked={showOverlay}
						onChange={(val) => setAttributes({ showOverlay: val })}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Show Buttons', 'wp-figmakit')}
						checked={showButtons}
						onChange={toggleButtons}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="fk-hero__inner">
					<InnerBlocks
						template={getTemplate(variant, showButtons)}
						templateLock={false}
					/>
				</div>
			</div>
		</Fragment>
	);
}
