const { Fragment, useCallback } = wp.element;
const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody, ToggleControl, SelectControl } = wp.components;
const { __ } = wp.i18n;
const { createBlock } = wp.blocks;
const { useDispatch, useSelect } = wp.data;

const VARIANT_OPTIONS = [
	{ label: 'Standard', value: 'standard' },
	{ label: 'Centered', value: 'centered' },
	{ label: 'Large Quote', value: 'large-quote' },
];

function getTemplate(showAvatar, showRole) {
	const template = [];

	template.push(['core/quote', {
		className: 'fk-testimonial__quote',
	}]);

	if (showAvatar) {
		template.push(['core/image', {
			className: 'fk-testimonial__avatar',
		}]);
	}

	template.push(['core/paragraph', {
		placeholder: 'Author Name',
		className: 'fk-testimonial__name',
	}]);

	if (showRole) {
		template.push(['core/paragraph', {
			placeholder: 'Role / Company',
			className: 'fk-testimonial__role',
		}]);
	}

	return template;
}

export default function Edit({ attributes, setAttributes, clientId }) {
	const { variant, showAvatar, showRole } = attributes;

	const blockProps = useBlockProps({
		className: `fk-testimonial fk-testimonial--${variant}`,
	});

	const { replaceInnerBlocks } = useDispatch('core/block-editor');
	const innerBlocks = useSelect((select) => {
		return select('core/block-editor').getBlocks(clientId);
	}, [clientId]);

	const toggleAvatar = useCallback(() => {
		const newVal = !showAvatar;
		setAttributes({ showAvatar: newVal });

		if (newVal) {
			const avatar = createBlock('core/image', {
				className: 'fk-testimonial__avatar',
			});
			// Insert after quote block
			const quoteIndex = innerBlocks.findIndex((b) => b.name === 'core/quote');
			const insertAt = quoteIndex >= 0 ? quoteIndex + 1 : 0;
			const updated = [...innerBlocks];
			updated.splice(insertAt, 0, avatar);
			replaceInnerBlocks(clientId, updated, false);
		} else {
			const filtered = innerBlocks.filter((b) =>
				!(b.name === 'core/image' && (b.attributes.className || '').includes('fk-testimonial__avatar'))
			);
			replaceInnerBlocks(clientId, filtered, false);
		}
	}, [showAvatar, innerBlocks, clientId, setAttributes, replaceInnerBlocks]);

	const toggleRole = useCallback(() => {
		const newVal = !showRole;
		setAttributes({ showRole: newVal });

		if (newVal) {
			const role = createBlock('core/paragraph', {
				placeholder: 'Role / Company',
				className: 'fk-testimonial__role',
			});
			replaceInnerBlocks(clientId, [...innerBlocks, role], false);
		} else {
			const filtered = innerBlocks.filter((b) =>
				!(b.name === 'core/paragraph' && (b.attributes.className || '').includes('fk-testimonial__role'))
			);
			replaceInnerBlocks(clientId, filtered, false);
		}
	}, [showRole, innerBlocks, clientId, setAttributes, replaceInnerBlocks]);

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Testimonial Settings', 'wp-figmakit')} initialOpen={true}>
					<SelectControl
						label={__('Variant', 'wp-figmakit')}
						value={variant}
						options={VARIANT_OPTIONS}
						onChange={(val) => setAttributes({ variant: val })}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Show Avatar', 'wp-figmakit')}
						checked={showAvatar}
						onChange={toggleAvatar}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Show Role', 'wp-figmakit')}
						checked={showRole}
						onChange={toggleRole}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<InnerBlocks
					template={getTemplate(showAvatar, showRole)}
					templateLock={false}
				/>
			</div>
		</Fragment>
	);
}
