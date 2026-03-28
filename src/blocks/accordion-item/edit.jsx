const { Fragment } = wp.element;
const { useBlockProps, InnerBlocks, InspectorControls, MediaUpload, MediaUploadCheck, RichText } = wp.blockEditor;
const { PanelBody, ToggleControl, Button } = wp.components;
const { __ } = wp.i18n;

const ALLOWED_BLOCKS = [
	'core/group',
	'core/heading',
	'core/paragraph',
	'core/image',
	'core/video',
	'core/list',
	'core/separator',
	'core/columns',
	'core/buttons',
];

const TEMPLATE = [
	['core/paragraph', { placeholder: 'Accordion panel content…' }],
];

export default function Edit({ attributes, setAttributes }) {
	const { title, iconMediaId, iconMediaUrl, isOpenByDefault } = attributes;

	const blockProps = useBlockProps({
		className: 'fk-accordion-item fk-accordion-item--editor',
	});

	const onSelectIcon = (media) => {
		setAttributes({
			iconMediaId: media.id,
			iconMediaUrl: media.url,
		});
	};

	const onRemoveIcon = () => {
		setAttributes({
			iconMediaId: 0,
			iconMediaUrl: '',
		});
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Item Settings', 'wp-figmakit')} initialOpen={true}>
					<ToggleControl
						label={__('Open by Default', 'wp-figmakit')}
						checked={isOpenByDefault}
						onChange={(val) => setAttributes({ isOpenByDefault: val })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody title={__('Header Icon', 'wp-figmakit')} initialOpen={false}>
					<MediaUploadCheck>
						{iconMediaUrl ? (
							<div style={{ marginBottom: '12px' }}>
								<img
									src={iconMediaUrl}
									alt=""
									style={{ maxWidth: '60px', maxHeight: '60px', display: 'block', marginBottom: '8px' }}
								/>
								<Button isDestructive isSmall onClick={onRemoveIcon}>
									{__('Remove Icon', 'wp-figmakit')}
								</Button>
							</div>
						) : (
							<MediaUpload
								onSelect={onSelectIcon}
								allowedTypes={['image']}
								value={iconMediaId}
								render={({ open }) => (
									<Button variant="secondary" onClick={open}>
										{__('Select Icon', 'wp-figmakit')}
									</Button>
								)}
							/>
						)}
					</MediaUploadCheck>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="fk-accordion-item__header fk-accordion-item__header--editor">
					{iconMediaUrl && (
						<span className="fk-accordion-item__icon">
							<img src={iconMediaUrl} alt="" />
						</span>
					)}
					<RichText
						tagName="span"
						className="fk-accordion-item__title"
						value={title}
						onChange={(val) => setAttributes({ title: val })}
						placeholder={__('Accordion title…', 'wp-figmakit')}
						allowedFormats={['core/bold', 'core/italic']}
					/>
					<span className="fk-accordion-item__toggle" aria-hidden="true"></span>
				</div>
				<div className="fk-accordion-item__panel fk-accordion-item__panel--editor">
					<div className="fk-accordion-item__panel-inner">
						<InnerBlocks
							allowedBlocks={ALLOWED_BLOCKS}
							template={TEMPLATE}
							templateLock={false}
						/>
					</div>
				</div>
			</div>
		</Fragment>
	);
}
