const { useState, useEffect, useCallback, useMemo } = wp.element;
const { Button, TextControl, Notice, Spinner } = wp.components;
const { __ } = wp.i18n;
const { BlockPreview } = wp.blockEditor;

function PatternCard({ pattern, isRenaming, renameValue, onRenameChange, onRenameConfirm, onRenameCancel, onRenameStart, onInsert, onDelete }) {
	const parsedBlocks = useMemo(() => {
		try {
			return wp.blocks.parse(pattern.content.raw);
		} catch {
			return [];
		}
	}, [pattern.content.raw]);

	return (
		<div className="fk-pattern-card">
			<div className="fk-pattern-card__preview" onClick={onInsert}>
				{parsedBlocks.length > 0 ? (
					<BlockPreview blocks={parsedBlocks} viewportWidth={800} />
				) : (
					<div className="fk-pattern-card__placeholder" />
				)}
			</div>
			<div className="fk-pattern-card__info">
				{isRenaming ? (
					<TextControl
						value={renameValue}
						onChange={onRenameChange}
						onKeyDown={(e) => {
							if (e.key === 'Enter') onRenameConfirm();
							if (e.key === 'Escape') onRenameCancel();
						}}
						__nextHasNoMarginBottom
					/>
				) : (
					<span className="fk-pattern-card__title">{pattern.title.raw}</span>
				)}
				<div className="fk-pattern-card__actions">
					{isRenaming ? (
						<>
							<Button size="small" variant="primary" onClick={onRenameConfirm}>
								{__('Save', 'wp-figmakit')}
							</Button>
							<Button size="small" variant="tertiary" onClick={onRenameCancel}>
								{__('Cancel', 'wp-figmakit')}
							</Button>
						</>
					) : (
						<>
							<Button size="small" variant="tertiary" onClick={onInsert}>
								{__('Insert', 'wp-figmakit')}
							</Button>
							<Button size="small" variant="tertiary" onClick={onRenameStart}>
								{__('Rename', 'wp-figmakit')}
							</Button>
							<Button size="small" variant="tertiary" isDestructive onClick={onDelete}>
								{__('Delete', 'wp-figmakit')}
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default function PatternLibraryPanel() {
	const [patterns, setPatterns] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [renamingId, setRenamingId] = useState(null);
	const [renameValue, setRenameValue] = useState('');
	const [savingNew, setSavingNew] = useState(false);
	const [newName, setNewName] = useState('');
	const [status, setStatus] = useState(null);

	const showStatus = useCallback((type, message) => {
		setStatus({ type, message });
		setTimeout(() => setStatus(null), 4000);
	}, []);

	const fetchPatterns = useCallback(() => {
		wp.apiFetch({ path: '/wp/v2/blocks?per_page=100' }).then((data) => {
			setPatterns(data);
		}).catch(() => {
			setPatterns([]);
		});
	}, []);

	useEffect(() => {
		fetchPatterns();
	}, [fetchPatterns]);

	const filtered = useMemo(() => {
		if (!patterns) return [];
		if (!searchTerm.trim()) return patterns;
		const lower = searchTerm.toLowerCase();
		return patterns.filter((p) => p.title.raw.toLowerCase().includes(lower));
	}, [patterns, searchTerm]);

	const handleInsert = useCallback((pattern) => {
		const parsed = wp.blocks.parse(pattern.content.raw);
		if (parsed.length) {
			wp.data.dispatch('core/block-editor').insertBlocks(parsed);
			showStatus('success', __('Pattern inserted.', 'wp-figmakit'));
		}
	}, [showStatus]);

	const handleSaveNew = useCallback(() => {
		const multi = wp.data.select('core/block-editor').getMultiSelectedBlocks();
		const single = wp.data.select('core/block-editor').getSelectedBlock();
		const blocks = multi.length ? multi : single ? [single] : [];

		if (!blocks.length) {
			showStatus('error', __('Select one or more blocks first.', 'wp-figmakit'));
			return;
		}

		setSavingNew(true);
		setNewName('');
	}, [showStatus]);

	const confirmSaveNew = useCallback(() => {
		const multi = wp.data.select('core/block-editor').getMultiSelectedBlocks();
		const single = wp.data.select('core/block-editor').getSelectedBlock();
		const blocks = multi.length ? multi : single ? [single] : [];

		if (!blocks.length) {
			showStatus('error', __('Select one or more blocks first.', 'wp-figmakit'));
			setSavingNew(false);
			return;
		}

		const content = wp.blocks.serialize(blocks);

		wp.apiFetch({
			path: '/wp/v2/blocks',
			method: 'POST',
			data: { title: newName, content, status: 'publish' },
		}).then(() => {
			setSavingNew(false);
			setNewName('');
			fetchPatterns();
			showStatus('success', __('Pattern saved.', 'wp-figmakit'));
		}).catch(() => {
			showStatus('error', __('Failed to save pattern.', 'wp-figmakit'));
		});
	}, [newName, fetchPatterns, showStatus]);

	const handleRenameConfirm = useCallback(() => {
		wp.apiFetch({
			path: `/wp/v2/blocks/${renamingId}`,
			method: 'POST',
			data: { title: renameValue },
		}).then(() => {
			setRenamingId(null);
			fetchPatterns();
			showStatus('success', __('Pattern renamed.', 'wp-figmakit'));
		}).catch(() => {
			showStatus('error', __('Failed to rename pattern.', 'wp-figmakit'));
		});
	}, [renamingId, renameValue, fetchPatterns, showStatus]);

	const handleDelete = useCallback((pattern) => {
		if (!window.confirm(__('Delete this pattern? This cannot be undone.', 'wp-figmakit'))) return;

		wp.apiFetch({
			path: `/wp/v2/blocks/${pattern.id}`,
			method: 'DELETE',
		}).then(() => {
			fetchPatterns();
			showStatus('success', __('Pattern deleted.', 'wp-figmakit'));
		}).catch(() => {
			showStatus('error', __('Failed to delete pattern.', 'wp-figmakit'));
		});
	}, [fetchPatterns, showStatus]);

	if (patterns === null) {
		return (
			<div className="fk-panel-patterns">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="fk-panel-patterns">
			{status && (
				<Notice status={status.type} isDismissible={false}>
					{status.message}
				</Notice>
			)}

			<div className="fk-panel-patterns__search">
				<TextControl
					placeholder={__('Search patterns...', 'wp-figmakit')}
					value={searchTerm}
					onChange={setSearchTerm}
					__nextHasNoMarginBottom
				/>
			</div>

			<div className="fk-panel-patterns__save-bar">
				{savingNew ? (
					<div className="fk-panel-patterns__save-fields">
						<TextControl
							placeholder={__('Pattern name', 'wp-figmakit')}
							value={newName}
							onChange={setNewName}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && newName.trim()) confirmSaveNew();
								if (e.key === 'Escape') setSavingNew(false);
							}}
							__nextHasNoMarginBottom
						/>
						<Button
							size="small"
							variant="primary"
							onClick={confirmSaveNew}
							disabled={!newName.trim()}
						>
							{__('Save', 'wp-figmakit')}
						</Button>
						<Button size="small" variant="tertiary" onClick={() => setSavingNew(false)}>
							{__('Cancel', 'wp-figmakit')}
						</Button>
					</div>
				) : (
					<Button variant="secondary" className="fk-panel-patterns__save-btn" onClick={handleSaveNew}>
						{__('Save Selection as Pattern', 'wp-figmakit')}
					</Button>
				)}
			</div>

			<div className="fk-panel-patterns__list">
				{filtered.length === 0 && (
					<p className="fk-panel-patterns__empty">
						{patterns.length === 0
							? __('No patterns saved yet. Select blocks and save them as a pattern.', 'wp-figmakit')
							: __('No patterns match your search.', 'wp-figmakit')
						}
					</p>
				)}
				{filtered.map((pattern) => (
					<PatternCard
						key={pattern.id}
						pattern={pattern}
						isRenaming={renamingId === pattern.id}
						renameValue={renameValue}
						onRenameChange={setRenameValue}
						onRenameStart={() => {
							setRenamingId(pattern.id);
							setRenameValue(pattern.title.raw);
						}}
						onRenameConfirm={handleRenameConfirm}
						onRenameCancel={() => setRenamingId(null)}
						onInsert={() => handleInsert(pattern)}
						onDelete={() => handleDelete(pattern)}
					/>
				))}
			</div>
		</div>
	);
}
