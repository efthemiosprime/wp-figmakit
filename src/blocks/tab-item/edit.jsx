const { Fragment } = wp.element;
const { useBlockProps, useInnerBlocksProps, InspectorControls, MediaUpload, MediaUploadCheck } = wp.blockEditor;
const { PanelBody, TextControl, TextareaControl, Button, ToggleControl } = wp.components;
const { useState } = wp.element;
const { __ } = wp.i18n;

export default function Edit({ attributes, setAttributes }) {
	const { label, icon, iconMediaId, iconMediaUrl, superscript } = attributes;
	const [useMediaIcon, setUseMediaIcon] = useState(iconMediaId > 0);

	const blockProps = useBlockProps({
		className: 'fk-tabs__panel-wrapper',
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'fk-tabs__panel-content' },
		{
			templateLock: false,
			renderAppender: wp.blockEditor.InnerBlocks.ButtonBlockAppender,
		}
	);

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Tab Settings', 'wp-figmakit')}>
					<TextControl
						label={__('Label', 'wp-figmakit')}
						value={label}
						onChange={(val) => setAttributes({ label: val })}
					/>
					<TextControl
						label={__('Superscript', 'wp-figmakit')}
						value={superscript}
						help={__('Shown as small text above-right of the label (e.g. "New", "3")', 'wp-figmakit')}
						onChange={(val) => setAttributes({ superscript: val })}
					/>
				</PanelBody>
				<PanelBody title={__('Tab Icon', 'wp-figmakit')} initialOpen={false}>
					<ToggleControl
						label={__('Use media library image', 'wp-figmakit')}
						checked={useMediaIcon}
						onChange={(val) => {
							setUseMediaIcon(val);
							if (!val) {
								setAttributes({ iconMediaId: 0, iconMediaUrl: '' });
							} else {
								setAttributes({ icon: '' });
							}
						}}
					/>
					{useMediaIcon ? (
						<div>
							{iconMediaUrl && (
								<div style={{ marginBottom: 8 }}>
									<img src={iconMediaUrl} alt="" style={{ maxWidth: 48, maxHeight: 48 }} />
								</div>
							)}
							<MediaUploadCheck>
								<MediaUpload
									onSelect={(media) => setAttributes({ iconMediaId: media.id, iconMediaUrl: media.url })}
									allowedTypes={['image']}
									value={iconMediaId}
									render={({ open }) => (
										<Button onClick={open} variant="secondary" isSmall>
											{iconMediaUrl ? __('Replace Icon', 'wp-figmakit') : __('Select Icon', 'wp-figmakit')}
										</Button>
									)}
								/>
							</MediaUploadCheck>
							{iconMediaUrl && (
								<Button
									onClick={() => setAttributes({ iconMediaId: 0, iconMediaUrl: '' })}
									isDestructive
									isSmall
									style={{ marginLeft: 8 }}
								>
									{__('Remove', 'wp-figmakit')}
								</Button>
							)}
						</div>
					) : (
						<TextareaControl
							label={__('SVG Icon', 'wp-figmakit')}
							value={icon}
							help={__('Paste inline SVG markup', 'wp-figmakit')}
							onChange={(val) => setAttributes({ icon: val })}
							rows={4}
						/>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="fk-tabs__panel-label">
					{label || __('Tab', 'wp-figmakit')}
					{superscript && <sup style={{ marginLeft: 4 }}>{superscript}</sup>}
				</div>
				<div {...innerBlocksProps} />
			</div>
		</Fragment>
	);
}
