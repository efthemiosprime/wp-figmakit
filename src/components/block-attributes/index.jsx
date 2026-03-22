const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useState, useCallback } = wp.element;
const { InspectorControls } = wp.blockEditor;
const {
	PanelBody,
	Button,
	TextControl,
	DropdownMenu,
	MenuItem,
} = wp.components;
const { __ } = wp.i18n;

const ATTRIBUTE_OPTIONS = [
	{ key: 'class', label: 'class' },
	{ key: 'id', label: 'id' },
	{ key: 'title', label: 'title' },
	{ key: 'alt', label: 'alt' },
	{ key: 'rel', label: 'rel' },
	{ key: 'target', label: 'target' },
	{ key: 'role', label: 'role' },
	{ key: 'aria-label', label: 'aria-label' },
	{ key: 'data-', label: 'data-' },
];

/**
 * Add fkAttributes to all blocks.
 */
addFilter('blocks.registerBlockType', 'wp-figmakit/block-attributes', (settings) => {
	settings.attributes = {
		...settings.attributes,
		fkAttributes: {
			type: 'array',
			default: [],
		},
	};

	return settings;
});

/**
 * Inspector panel for managing HTML attributes.
 */
const withAttributesPanel = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { attributes, setAttributes } = props;
		const fkAttrs = attributes.fkAttributes || [];

		const addAttribute = useCallback((key) => {
			const attrName = key === 'data-' ? 'data-' : key;
			setAttributes({
				fkAttributes: [...fkAttrs, { name: attrName, value: '' }],
			});
		}, [fkAttrs, setAttributes]);

		const updateAttribute = useCallback((index, field, value) => {
			const updated = fkAttrs.map((attr, i) =>
				i === index ? { ...attr, [field]: value } : attr
			);
			setAttributes({ fkAttributes: updated });
		}, [fkAttrs, setAttributes]);

		const removeAttribute = useCallback((index) => {
			setAttributes({
				fkAttributes: fkAttrs.filter((_, i) => i !== index),
			});
		}, [fkAttrs, setAttributes]);

		const usedKeys = fkAttrs.map((a) =>
			a.name.startsWith('data-') ? 'data-' : a.name
		);
		const availableOptions = ATTRIBUTE_OPTIONS.filter(
			(opt) => opt.key === 'data-' || !usedKeys.includes(opt.key)
		);

		return (
			<Fragment>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						title={__('Attributes', 'wp-figmakit')}
						initialOpen={false}
						className="fk-attributes-panel"
					>
						{fkAttrs.map((attr, index) => (
							<div key={index} className="fk-attributes-panel__item">
								{attr.name === 'data-' || attr.name.startsWith('data-') ? (
									<div className="fk-attributes-panel__data-row">
										<TextControl
											label={__('Name', 'wp-figmakit')}
											value={attr.name}
											onChange={(val) => {
												const sanitized = val.startsWith('data-') ? val : 'data-' + val;
												updateAttribute(index, 'name', sanitized);
											}}
											placeholder="data-my-attr"
											__nextHasNoMarginBottom
										/>
										<TextControl
											label={__('Value', 'wp-figmakit')}
											value={attr.value}
											onChange={(val) => updateAttribute(index, 'value', val)}
											__nextHasNoMarginBottom
										/>
									</div>
								) : (
									<TextControl
										label={attr.name}
										value={attr.value}
										onChange={(val) => updateAttribute(index, 'value', val)}
										__nextHasNoMarginBottom
									/>
								)}
								<Button
									icon="no-alt"
									isDestructive
									size="small"
									label={__('Remove', 'wp-figmakit')}
									onClick={() => removeAttribute(index)}
									className="fk-attributes-panel__remove"
								/>
							</div>
						))}

						{availableOptions.length > 0 && (
							<DropdownMenu
								icon="plus"
								label={__('Add Attribute', 'wp-figmakit')}
								text={__('Add Attribute', 'wp-figmakit')}
								className="fk-attributes-panel__add"
							>
								{({ onClose }) =>
									availableOptions.map((opt) => (
										<MenuItem
											key={opt.key}
											onClick={() => {
												addAttribute(opt.key);
												onClose();
											}}
										>
											{opt.label}
										</MenuItem>
									))
								}
							</DropdownMenu>
						)}
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withAttributesPanel');

addFilter('editor.BlockEdit', 'wp-figmakit/block-attributes-panel', withAttributesPanel);
