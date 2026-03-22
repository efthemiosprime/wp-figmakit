const { Fragment, useCallback } = wp.element;
const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody, ToggleControl, SelectControl } = wp.components;
const { __ } = wp.i18n;
const { createBlock } = wp.blocks;
const { useDispatch, useSelect } = wp.data;

const VARIANT_OPTIONS = [
	{ label: 'Vertical Stack', value: 'vstack' },
	{ label: 'Horizontal Stack', value: 'hstack' },
];

function buildContentBlocks(showEyebrow, showButtons, showFootnote) {
	const content = [];

	if (showEyebrow) {
		content.push(['core/paragraph', {
			placeholder: 'Eyebrow text',
			className: 'fk-card__eyebrow fk-text-eyebrow',
		}]);
	}

	content.push(['core/heading', {
		level: 3,
		placeholder: 'Card Title',
		className: 'fk-card__title',
	}]);

	content.push(['core/paragraph', {
		placeholder: 'Card description goes here…',
		className: 'fk-card__description',
	}]);

	if (showButtons) {
		content.push(['core/buttons', { className: 'fk-card__buttons' }, [
			['core/button', { placeholder: 'CTA Button' }],
		]]);
	}

	if (showFootnote) {
		content.push(['core/paragraph', {
			placeholder: 'Footnote text',
			className: 'fk-card__footnote fk-text-footnote',
		}]);
	}

	return content;
}

function getTemplate(variant, showImage, showEyebrow, showButtons, showFootnote) {
	const template = [];
	const contentBlocks = buildContentBlocks(showEyebrow, showButtons, showFootnote);

	if (showImage) {
		template.push(['core/image', { className: 'fk-card__image' }]);
	}

	if (variant === 'hstack') {
		// Wrap text content in a Group for hstack
		template.push(['core/group', { className: 'fk-card__content' }, contentBlocks]);
	} else {
		// vstack — flat structure
		template.push(...contentBlocks);
	}

	return template;
}

export default function Edit({ attributes, setAttributes, clientId }) {
	const { variant, showImage, showEyebrow, showButtons, showFootnote } = attributes;

	const blockProps = useBlockProps({
		className: `fk-card fk-card--${variant}`,
	});

	const { replaceInnerBlocks } = useDispatch('core/block-editor');
	const innerBlocks = useSelect((select) => {
		return select('core/block-editor').getBlocks(clientId);
	}, [clientId]);

	// Rebuild inner blocks when variant changes
	const changeVariant = useCallback((newVariant) => {
		setAttributes({ variant: newVariant });

		// Collect all content blocks (flatten from group if hstack → vstack)
		let imageBlock = null;
		let contentChildren = [];

		innerBlocks.forEach((block) => {
			if (block.name === 'core/image' && (block.attributes.className || '').includes('fk-card__image')) {
				imageBlock = block;
			} else if (block.name === 'core/group' && (block.attributes.className || '').includes('fk-card__content')) {
				contentChildren = [...block.innerBlocks];
			} else {
				contentChildren.push(block);
			}
		});

		const newBlocks = [];

		if (imageBlock) {
			newBlocks.push(imageBlock);
		}

		if (newVariant === 'hstack') {
			// Wrap content in group
			const contentGroup = createBlock(
				'core/group',
				{ className: 'fk-card__content' },
				contentChildren
			);
			newBlocks.push(contentGroup);
		} else {
			// Flatten — no wrapper
			newBlocks.push(...contentChildren);
		}

		replaceInnerBlocks(clientId, newBlocks, false);
	}, [innerBlocks, clientId, setAttributes, replaceInnerBlocks]);

	const toggleImage = useCallback(() => {
		const newVal = !showImage;
		setAttributes({ showImage: newVal });

		if (newVal) {
			const imageBlock = createBlock('core/image', { className: 'fk-card__image' });
			replaceInnerBlocks(clientId, [imageBlock, ...innerBlocks], false);
		} else {
			const filtered = innerBlocks.filter((b) =>
				!(b.name === 'core/image' && (b.attributes.className || '').includes('fk-card__image'))
			);
			replaceInnerBlocks(clientId, filtered, false);
		}
	}, [showImage, innerBlocks, clientId, setAttributes, replaceInnerBlocks]);

	const toggleEyebrow = useCallback(() => {
		const newVal = !showEyebrow;
		setAttributes({ showEyebrow: newVal });

		// Find content group (hstack) or top-level blocks (vstack)
		if (variant === 'hstack') {
			const groupIndex = innerBlocks.findIndex((b) =>
				b.name === 'core/group' && (b.attributes.className || '').includes('fk-card__content')
			);
			if (groupIndex >= 0) {
				const group = innerBlocks[groupIndex];
				let children = [...group.innerBlocks];

				if (newVal) {
					const eyebrow = createBlock('core/paragraph', {
						placeholder: 'Eyebrow text',
						className: 'fk-card__eyebrow fk-text-eyebrow',
					});
					children = [eyebrow, ...children];
				} else {
					children = children.filter((b) =>
						!(b.name === 'core/paragraph' && (b.attributes.className || '').includes('fk-card__eyebrow'))
					);
				}

				const newGroup = createBlock('core/group', group.attributes, children);
				const updated = [...innerBlocks];
				updated[groupIndex] = newGroup;
				replaceInnerBlocks(clientId, updated, false);
			}
		} else {
			if (newVal) {
				const eyebrow = createBlock('core/paragraph', {
					placeholder: 'Eyebrow text',
					className: 'fk-card__eyebrow fk-text-eyebrow',
				});
				const imageIndex = innerBlocks.findIndex((b) =>
					b.name === 'core/image' && (b.attributes.className || '').includes('fk-card__image')
				);
				const insertAt = imageIndex >= 0 ? imageIndex + 1 : 0;
				const updated = [...innerBlocks];
				updated.splice(insertAt, 0, eyebrow);
				replaceInnerBlocks(clientId, updated, false);
			} else {
				const filtered = innerBlocks.filter((b) =>
					!(b.name === 'core/paragraph' && (b.attributes.className || '').includes('fk-card__eyebrow'))
				);
				replaceInnerBlocks(clientId, filtered, false);
			}
		}
	}, [showEyebrow, variant, innerBlocks, clientId, setAttributes, replaceInnerBlocks]);

	const toggleButtons = useCallback(() => {
		const newVal = !showButtons;
		setAttributes({ showButtons: newVal });

		if (variant === 'hstack') {
			const groupIndex = innerBlocks.findIndex((b) =>
				b.name === 'core/group' && (b.attributes.className || '').includes('fk-card__content')
			);
			if (groupIndex >= 0) {
				const group = innerBlocks[groupIndex];
				let children = [...group.innerBlocks];

				if (newVal) {
					const buttons = createBlock('core/buttons', { className: 'fk-card__buttons' }, [
						createBlock('core/button', { placeholder: 'CTA Button' }),
					]);
					children = [...children, buttons];
				} else {
					children = children.filter((b) =>
						!(b.name === 'core/buttons' && (b.attributes.className || '').includes('fk-card__buttons'))
					);
				}

				const newGroup = createBlock('core/group', group.attributes, children);
				const updated = [...innerBlocks];
				updated[groupIndex] = newGroup;
				replaceInnerBlocks(clientId, updated, false);
			}
		} else {
			if (newVal) {
				const buttons = createBlock('core/buttons', { className: 'fk-card__buttons' }, [
					createBlock('core/button', { placeholder: 'CTA Button' }),
				]);
				replaceInnerBlocks(clientId, [...innerBlocks, buttons], false);
			} else {
				const filtered = innerBlocks.filter((b) =>
					!(b.name === 'core/buttons' && (b.attributes.className || '').includes('fk-card__buttons'))
				);
				replaceInnerBlocks(clientId, filtered, false);
			}
		}
	}, [showButtons, variant, innerBlocks, clientId, setAttributes, replaceInnerBlocks]);

	const toggleFootnote = useCallback(() => {
		const newVal = !showFootnote;
		setAttributes({ showFootnote: newVal });

		if (variant === 'hstack') {
			const groupIndex = innerBlocks.findIndex((b) =>
				b.name === 'core/group' && (b.attributes.className || '').includes('fk-card__content')
			);
			if (groupIndex >= 0) {
				const group = innerBlocks[groupIndex];
				let children = [...group.innerBlocks];

				if (newVal) {
					const footnote = createBlock('core/paragraph', {
						placeholder: 'Footnote text',
						className: 'fk-card__footnote fk-text-footnote',
					});
					children = [...children, footnote];
				} else {
					children = children.filter((b) =>
						!(b.name === 'core/paragraph' && (b.attributes.className || '').includes('fk-card__footnote'))
					);
				}

				const newGroup = createBlock('core/group', group.attributes, children);
				const updated = [...innerBlocks];
				updated[groupIndex] = newGroup;
				replaceInnerBlocks(clientId, updated, false);
			}
		} else {
			if (newVal) {
				const footnote = createBlock('core/paragraph', {
					placeholder: 'Footnote text',
					className: 'fk-card__footnote fk-text-footnote',
				});
				replaceInnerBlocks(clientId, [...innerBlocks, footnote], false);
			} else {
				const filtered = innerBlocks.filter((b) =>
					!(b.name === 'core/paragraph' && (b.attributes.className || '').includes('fk-card__footnote'))
				);
				replaceInnerBlocks(clientId, filtered, false);
			}
		}
	}, [showFootnote, variant, innerBlocks, clientId, setAttributes, replaceInnerBlocks]);

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Card Settings', 'wp-figmakit')} initialOpen={true}>
					<SelectControl
						label={__('Variant', 'wp-figmakit')}
						value={variant}
						options={VARIANT_OPTIONS}
						onChange={changeVariant}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Show Image', 'wp-figmakit')}
						checked={showImage}
						onChange={toggleImage}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Show Eyebrow', 'wp-figmakit')}
						checked={showEyebrow}
						onChange={toggleEyebrow}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Show Buttons', 'wp-figmakit')}
						checked={showButtons}
						onChange={toggleButtons}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Show Footnote', 'wp-figmakit')}
						checked={showFootnote}
						onChange={toggleFootnote}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<InnerBlocks
					template={getTemplate(variant, showImage, showEyebrow, showButtons, showFootnote)}
					templateLock={false}
				/>
			</div>
		</Fragment>
	);
}
