import { SPACING_SIZES } from '../../lib/spacing-options';

const { useCallback, useState } = wp.element;
const { PanelBody, SelectControl, Button } = wp.components;
const { __ } = wp.i18n;

function LinkButton({ isLinked, onClick, title }) {
	return (
		<Button
			className={`fk-spacing-panel__link ${isLinked ? 'is-linked' : ''}`}
			icon={isLinked ? 'admin-links' : 'editor-unlink'}
			size="small"
			label={title}
			onClick={onClick}
			isPressed={isLinked}
		/>
	);
}

function SpacingGroup({ label, sides, spacing, onUpdate }) {
	const [linkAll, setLinkAll] = useState(false);
	const [linkTB, setLinkTB] = useState(false);
	const [linkLR, setLinkLR] = useState(false);

	const handleChange = useCallback((side, value) => {
		const updates = { [side]: value };

		if (linkAll) {
			sides.forEach((s) => { updates[s.key] = value; });
		} else {
			if (linkTB && (side === sides[0].key || side === sides[1].key)) {
				updates[sides[0].key] = value;
				updates[sides[1].key] = value;
			}
			if (linkLR && (side === sides[2].key || side === sides[3].key)) {
				updates[sides[2].key] = value;
				updates[sides[3].key] = value;
			}
		}

		onUpdate(updates);
	}, [linkAll, linkTB, linkLR, sides, onUpdate]);

	return (
		<div className="fk-spacing-panel__section">
			<div className="fk-spacing-panel__header">
				<div className="fk-spacing-panel__heading">{label}</div>
				<div className="fk-spacing-panel__links">
					<LinkButton
						isLinked={linkAll}
						onClick={() => setLinkAll(!linkAll)}
						title={__('Link all sides', 'wp-figmakit')}
					/>
				</div>
			</div>

			{linkAll ? (
				<div className="fk-spacing-panel__single">
					<SelectControl
						label={__('All Sides', 'wp-figmakit')}
						value={spacing[sides[0].key] || ''}
						options={SPACING_SIZES}
						onChange={(val) => handleChange(sides[0].key, val)}
						__nextHasNoMarginBottom
					/>
				</div>
			) : (
				<div className="fk-spacing-panel__grid">
					<div className="fk-spacing-panel__pair">
						<LinkButton
							isLinked={linkTB}
							onClick={() => setLinkTB(!linkTB)}
							title={__('Link top & bottom', 'wp-figmakit')}
						/>
						<SelectControl
							label={sides[0].label}
							value={spacing[sides[0].key] || ''}
							options={SPACING_SIZES}
							onChange={(val) => handleChange(sides[0].key, val)}
							__nextHasNoMarginBottom
						/>
						<SelectControl
							label={sides[1].label}
							value={spacing[sides[1].key] || ''}
							options={SPACING_SIZES}
							onChange={(val) => handleChange(sides[1].key, val)}
							disabled={linkTB}
							__nextHasNoMarginBottom
						/>
					</div>

					<div className="fk-spacing-panel__pair">
						<LinkButton
							isLinked={linkLR}
							onClick={() => setLinkLR(!linkLR)}
							title={__('Link left & right', 'wp-figmakit')}
						/>
						<SelectControl
							label={sides[2].label}
							value={spacing[sides[2].key] || ''}
							options={SPACING_SIZES}
							onChange={(val) => handleChange(sides[2].key, val)}
							__nextHasNoMarginBottom
						/>
						<SelectControl
							label={sides[3].label}
							value={spacing[sides[3].key] || ''}
							options={SPACING_SIZES}
							onChange={(val) => handleChange(sides[3].key, val)}
							disabled={linkLR}
							__nextHasNoMarginBottom
						/>
					</div>
				</div>
			)}
		</div>
	);
}

const PADDING_SIDES = [
	{ key: 'pt', label: __('Top', 'wp-figmakit') },
	{ key: 'pb', label: __('Bottom', 'wp-figmakit') },
	{ key: 'pl', label: __('Left', 'wp-figmakit') },
	{ key: 'pr', label: __('Right', 'wp-figmakit') },
];

const MARGIN_SIDES = [
	{ key: 'mt', label: __('Top', 'wp-figmakit') },
	{ key: 'mb', label: __('Bottom', 'wp-figmakit') },
	{ key: 'ml', label: __('Left', 'wp-figmakit') },
	{ key: 'mr', label: __('Right', 'wp-figmakit') },
];

export default function SpacingPanelWrapper({ attributes, setAttributes }) {
	const spacing = attributes.fkSpacing || {};

	const handleUpdate = useCallback((updates) => {
		setAttributes({ fkSpacing: { ...spacing, ...updates } });
	}, [spacing, setAttributes]);

	return (
		<PanelBody
			title={__('Spacing', 'wp-figmakit')}
			initialOpen={false}
			className="fk-spacing-panel"
		>
			<SpacingGroup
				label={__('Padding', 'wp-figmakit')}
				sides={PADDING_SIDES}
				spacing={spacing}
				onUpdate={handleUpdate}
			/>
			<SpacingGroup
				label={__('Margin', 'wp-figmakit')}
				sides={MARGIN_SIDES}
				spacing={spacing}
				onUpdate={handleUpdate}
			/>
		</PanelBody>
	);
}
