const { Fragment, useState } = wp.element;
const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody, TextControl, SelectControl, ToggleControl, Button } = wp.components;
const { __ } = wp.i18n;

const VARIANT_OPTIONS = [
	{ label: 'Hash Triggered', value: 'hash' },
	{ label: 'Exit Intent', value: 'exit-intent' },
	{ label: 'HCP Gate', value: 'hcp-gate' },
];

const MAX_WIDTH_OPTIONS = [
	{ label: '480px', value: '480px' },
	{ label: '640px', value: '640px' },
	{ label: '800px', value: '800px' },
	{ label: '960px', value: '960px' },
	{ label: '100%', value: '100%' },
];

const ALLOWED_BLOCKS = [
	'core/heading',
	'core/paragraph',
	'core/buttons',
	'core/button',
	'core/image',
	'core/video',
	'core/group',
	'core/embed',
	'core/columns',
	'core/list',
	'core/separator',
];

const TEMPLATE = [
	['core/heading', { level: 2, placeholder: 'Modal Title' }],
	['core/paragraph', { placeholder: 'Modal content goes here…' }],
	['core/buttons', {}, [
		['core/button', { placeholder: 'Action' }],
	]],
];

export default function Edit({ attributes, setAttributes }) {
	const {
		modalId,
		variant,
		maxWidth,
		showBackdrop,
		closeOnEscape,
		closeOnBackdrop,
		whitelistUrls,
		hcpCookieExpiry,
		hcpDenyUrl,
	} = attributes;

	const [newUrl, setNewUrl] = useState('');

	const blockProps = useBlockProps({
		className: `fk-modal fk-modal--editor fk-modal--${variant}`,
	});

	const variantLabel = VARIANT_OPTIONS.find((v) => v.value === variant)?.label || variant;

	const addWhitelistUrl = () => {
		if (newUrl.trim()) {
			setAttributes({ whitelistUrls: [...whitelistUrls, newUrl.trim()] });
			setNewUrl('');
		}
	};

	const removeWhitelistUrl = (index) => {
		const updated = [...whitelistUrls];
		updated.splice(index, 1);
		setAttributes({ whitelistUrls: updated });
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Modal Settings', 'wp-figmakit')} initialOpen={true}>
					<TextControl
						label={__('Modal ID', 'wp-figmakit')}
						help={__('Unique identifier. For hash trigger, use this as href="#your-id"', 'wp-figmakit')}
						value={modalId}
						onChange={(val) => setAttributes({ modalId: val.replace(/[^a-zA-Z0-9-_]/g, '') })}
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={__('Variant', 'wp-figmakit')}
						value={variant}
						options={VARIANT_OPTIONS}
						onChange={(val) => setAttributes({ variant: val })}
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={__('Max Width', 'wp-figmakit')}
						value={maxWidth}
						options={MAX_WIDTH_OPTIONS}
						onChange={(val) => setAttributes({ maxWidth: val })}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Show Backdrop', 'wp-figmakit')}
						checked={showBackdrop}
						onChange={(val) => setAttributes({ showBackdrop: val })}
						__nextHasNoMarginBottom
					/>
					{variant !== 'hcp-gate' && (
						<Fragment>
							<ToggleControl
								label={__('Close on Escape', 'wp-figmakit')}
								checked={closeOnEscape}
								onChange={(val) => setAttributes({ closeOnEscape: val })}
								__nextHasNoMarginBottom
							/>
							<ToggleControl
								label={__('Close on Backdrop Click', 'wp-figmakit')}
								checked={closeOnBackdrop}
								onChange={(val) => setAttributes({ closeOnBackdrop: val })}
								__nextHasNoMarginBottom
							/>
						</Fragment>
					)}
				</PanelBody>

				<PanelBody title={__('Usage & API', 'wp-figmakit')} initialOpen={false}>
					<div style={{ fontSize: '12px', color: '#757575', lineHeight: '1.6' }}>
						<p style={{ marginBottom: '8px' }}>
							{__('Open and close modals from any custom JS, inline scripts, or button onclick handlers.', 'wp-figmakit')}
						</p>
						<pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', fontSize: '11px', whiteSpace: 'pre-wrap', margin: '0' }}>
{`// JavaScript API
fkModal.open('${modalId || 'modal-id'}')  // open
fkModal.close()              // close

// Inline example
<button onclick="fkModal.open('${modalId || 'modal-id'}')">
  Open
</button>`}
						</pre>
					</div>
				</PanelBody>

				{variant === 'exit-intent' && (
					<PanelBody title={__('Exit Intent Settings', 'wp-figmakit')} initialOpen={true}>
						<p style={{ fontSize: '12px', color: '#757575', marginBottom: '12px' }}>
							{__('URLs that should NOT trigger the exit intent modal. External links matching these will navigate normally.', 'wp-figmakit')}
						</p>
						{whitelistUrls.map((url, i) => (
							<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
								<code style={{ flex: 1, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</code>
								<Button
									isDestructive
									isSmall
									onClick={() => removeWhitelistUrl(i)}
									aria-label={__('Remove URL', 'wp-figmakit')}
								>
									&times;
								</Button>
							</div>
						))}
						<div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
							<TextControl
								placeholder="https://example.com"
								value={newUrl}
								onChange={setNewUrl}
								onKeyDown={(e) => e.key === 'Enter' && addWhitelistUrl()}
								__nextHasNoMarginBottom
								style={{ flex: 1 }}
							/>
							<Button variant="secondary" isSmall onClick={addWhitelistUrl}>
								{__('Add', 'wp-figmakit')}
							</Button>
						</div>
					</PanelBody>
				)}

				{variant === 'hcp-gate' && (
					<PanelBody title={__('HCP Gate Settings', 'wp-figmakit')} initialOpen={true}>
						<p style={{ fontSize: '12px', color: '#757575', marginBottom: '12px' }}>
							{__('The modal cannot be dismissed — users must choose an option. Add "Yes" and "No" buttons inside the modal content.', 'wp-figmakit')}
						</p>
						<TextControl
							label={__('Cookie Expiry (days)', 'wp-figmakit')}
							type="number"
							min={1}
							value={String(hcpCookieExpiry)}
							onChange={(val) => setAttributes({ hcpCookieExpiry: parseInt(val, 10) || 30 })}
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={__('Deny Redirect URL', 'wp-figmakit')}
							help={__('Where to redirect if user denies HCP status', 'wp-figmakit')}
							value={hcpDenyUrl}
							onChange={(val) => setAttributes({ hcpDenyUrl: val })}
							__nextHasNoMarginBottom
						/>
					</PanelBody>
				)}
			</InspectorControls>

			<div {...blockProps}>
				<div className="fk-modal__editor-label">
					{`Modal: #${modalId || '(no id)'} — ${variantLabel}`}
				</div>
				<div className="fk-modal__editor-content">
					<InnerBlocks
						allowedBlocks={ALLOWED_BLOCKS}
						template={TEMPLATE}
						templateLock={false}
					/>
				</div>
			</div>
		</Fragment>
	);
}
