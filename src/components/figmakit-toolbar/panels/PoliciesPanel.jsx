const { useState, useEffect, useCallback } = wp.element;
const { Button, TextControl, SelectControl, Notice } = wp.components;
const { getBlockTypes } = wp.blocks;
const { __ } = wp.i18n;

export default function PoliciesPanel() {
	const [policies, setPolicies] = useState({});
	const [saved, setSaved] = useState(false);
	const [loading, setLoading] = useState(true);
	const [newBlockType, setNewBlockType] = useState('');
	const [addingClass, setAddingClass] = useState(null); // block type key currently adding to
	const [newLabel, setNewLabel] = useState('');
	const [newClass, setNewClass] = useState('');

	useEffect(() => {
		wp.apiFetch({ path: '/wp-figmakit/v1/policies' }).then((data) => {
			setPolicies(data || {});
			setLoading(false);
		}).catch(() => {
			setLoading(false);
		});
	}, []);

	const ALLOWED_BLOCK_TYPES = [
		{ label: 'Group', value: 'core/group' },
		{ label: 'Paragraph', value: 'core/paragraph' },
		{ label: 'Heading', value: 'core/heading' },
		{ label: 'Image', value: 'core/image' },
		{ label: 'Gallery', value: 'core/gallery' },
		{ label: 'Video', value: 'core/video' },
		{ label: 'Button', value: 'core/button' },
		{ label: 'Buttons', value: 'core/buttons' },
		{ label: 'Columns', value: 'core/columns' },
		{ label: 'Table', value: 'core/table' },
		{ label: 'Pullquote', value: 'core/pullquote' },
		{ label: 'List', value: 'core/list' },
		{ label: 'Quote', value: 'core/quote' },
		{ label: 'Cover', value: 'core/cover' },
		{ label: 'Separator', value: 'core/separator' },
		{ label: 'Spacer', value: 'core/spacer' },
	];

	const blockTypes = ALLOWED_BLOCK_TYPES;
	const availableBlockTypes = blockTypes.filter((bt) => !policies[bt.value]);

	const addBlockType = useCallback(() => {
		if (!newBlockType) return;
		setPolicies((prev) => ({ ...prev, [newBlockType]: [] }));
		setNewBlockType('');
		setSaved(false);
	}, [newBlockType]);

	const removeBlockType = useCallback((blockType) => {
		setPolicies((prev) => {
			const next = { ...prev };
			delete next[blockType];
			return next;
		});
		setSaved(false);
	}, []);

	const addClass = useCallback((blockType) => {
		if (!newLabel.trim() || !newClass.trim()) return;
		setPolicies((prev) => ({
			...prev,
			[blockType]: [
				...(prev[blockType] || []),
				{ label: newLabel.trim(), class: newClass.trim() },
			],
		}));
		setNewLabel('');
		setNewClass('');
		setAddingClass(null);
		setSaved(false);
	}, [newLabel, newClass]);

	const removeClass = useCallback((blockType, index) => {
		setPolicies((prev) => ({
			...prev,
			[blockType]: prev[blockType].filter((_, i) => i !== index),
		}));
		setSaved(false);
	}, []);

	const savePolicies = useCallback(() => {
		wp.apiFetch({
			path: '/wp-figmakit/v1/policies',
			method: 'POST',
			data: policies,
		}).then(() => {
			setSaved(true);
			// Update cached policies for sidebar panels
			window._fkPolicies = policies;
			setTimeout(() => setSaved(false), 3000);
		});
	}, [policies]);

	if (loading) return <p>{__('Loading…', 'wp-figmakit')}</p>;

	const blockTypeLabel = (name) => {
		const bt = blockTypes.find((b) => b.value === name);
		return bt ? bt.label : name;
	};

	return (
		<div className="fk-panel-policies">
			{saved && (
				<Notice status="success" isDismissible={false}>
					{__('Policies saved.', 'wp-figmakit')}
				</Notice>
			)}

			{Object.entries(policies).map(([blockType, classes]) => (
				<div key={blockType} className="fk-policy-block">
					<div className="fk-policy-block__header">
						<span className="fk-policy-block__title">{blockTypeLabel(blockType)}</span>
						<span className="fk-policy-block__slug">{blockType}</span>
						<button
							className="fk-policy-block__remove"
							onClick={() => removeBlockType(blockType)}
							title={__('Remove', 'wp-figmakit')}
							type="button"
						>
							<span className="dashicons dashicons-no-alt" />
						</button>
					</div>

					<div className="fk-policy-block__classes">
						{classes.map((entry, index) => (
							<div key={index} className="fk-policy-class">
								<span className="fk-policy-class__label">{entry.label}</span>
								<code className="fk-policy-class__name">{entry.class}</code>
								<button
									className="fk-policy-class__remove"
									onClick={() => removeClass(blockType, index)}
									type="button"
								>
									<span className="dashicons dashicons-dismiss" />
								</button>
							</div>
						))}

						{addingClass === blockType ? (
							<div className="fk-policy-add-form">
								<TextControl
									placeholder={__('Label (e.g. Hero Section)', 'wp-figmakit')}
									value={newLabel}
									onChange={setNewLabel}
									__nextHasNoMarginBottom
								/>
								<TextControl
									placeholder={__('Class (e.g. fk-hero)', 'wp-figmakit')}
									value={newClass}
									onChange={setNewClass}
									__nextHasNoMarginBottom
								/>
								<div className="fk-policy-add-form__actions">
									<Button
										variant="primary"
										size="small"
										onClick={() => addClass(blockType)}
										disabled={!newLabel.trim() || !newClass.trim()}
									>
										{__('Add', 'wp-figmakit')}
									</Button>
									<Button
										variant="tertiary"
										size="small"
										onClick={() => { setAddingClass(null); setNewLabel(''); setNewClass(''); }}
									>
										{__('Cancel', 'wp-figmakit')}
									</Button>
								</div>
							</div>
						) : (
							<Button
								variant="tertiary"
								size="small"
								onClick={() => setAddingClass(blockType)}
								className="fk-policy-block__add-btn"
							>
								{__('+ Add Class', 'wp-figmakit')}
							</Button>
						)}
					</div>
				</div>
			))}

			{availableBlockTypes.length > 0 && (
				<div className="fk-policy-add-block">
					<SelectControl
						label={__('Add Block Type', 'wp-figmakit')}
						value={newBlockType}
						options={[{ label: __('Select…', 'wp-figmakit'), value: '' }, ...availableBlockTypes]}
						onChange={setNewBlockType}
						__nextHasNoMarginBottom
					/>
					<Button
						variant="secondary"
						size="small"
						onClick={addBlockType}
						disabled={!newBlockType}
					>
						{__('+ Add', 'wp-figmakit')}
					</Button>
				</div>
			)}

			<Button variant="primary" onClick={savePolicies} className="fk-panel-policies__save">
				{__('Save Policies', 'wp-figmakit')}
			</Button>
		</div>
	);
}
