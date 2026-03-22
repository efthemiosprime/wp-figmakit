const { useState, useEffect, useCallback, useRef } = wp.element;
const { Button, Notice, RadioControl } = wp.components;
const { __ } = wp.i18n;

function slugify(str) {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '') || 'page';
}

export default function PortabilityPanel() {
	const [mode, setMode] = useState('export');
	const [importMode, setImportMode] = useState('replace');
	const [status, setStatus] = useState(null);
	const fileRef = useRef();
	const timerRef = useRef();

	useEffect(() => () => clearTimeout(timerRef.current), []);

	const clearStatus = useCallback(() => {
		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => setStatus(null), 4000);
	}, []);

	const handleExport = useCallback(() => {
		const blocks = wp.data.select('core/block-editor').getBlocks();

		if (!blocks.length) {
			setStatus({ type: 'error', message: __('There are no blocks to export on this page.', 'wp-figmakit') });
			clearStatus();
			return;
		}

		const content = wp.blocks.serialize(blocks);
		const title = wp.data.select('core/editor').getEditedPostAttribute('title') || 'page';

		const json = JSON.stringify({
			version: 1,
			generator: 'figmakit',
			title,
			date: new Date().toISOString(),
			content,
		}, null, 2);

		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${slugify(title)}-export.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		setStatus({ type: 'success', message: __('Page exported.', 'wp-figmakit') });
		clearStatus();
	}, [clearStatus]);

	const handleImport = useCallback(() => {
		fileRef.current?.click();
	}, []);

	const onFileChange = useCallback((e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Reset so the same file can be re-selected
		e.target.value = '';

		const reader = new FileReader();

		reader.onerror = () => {
			setStatus({ type: 'error', message: __('Could not read the file. Please try again.', 'wp-figmakit') });
			clearStatus();
		};

		reader.onload = () => {
			let json;
			try {
				json = JSON.parse(reader.result);
			} catch {
				setStatus({ type: 'error', message: __('Invalid JSON file. Please check the file format.', 'wp-figmakit') });
				clearStatus();
				return;
			}

			if (!json.content || typeof json.content !== 'string') {
				setStatus({ type: 'error', message: __('This file does not contain valid block data.', 'wp-figmakit') });
				clearStatus();
				return;
			}

			const parsed = wp.blocks.parse(json.content);

			if (!parsed.length) {
				setStatus({ type: 'error', message: __('No blocks found in the imported file.', 'wp-figmakit') });
				clearStatus();
				return;
			}

			if (importMode === 'replace') {
				wp.data.dispatch('core/block-editor').resetBlocks(parsed);
			} else {
				wp.data.dispatch('core/block-editor').insertBlocks(parsed);
			}

			setStatus({ type: 'success', message: __('Blocks imported.', 'wp-figmakit') });
			clearStatus();
		};

		reader.readAsText(file);
	}, [importMode, clearStatus]);

	return (
		<div className="fk-panel-portability">
			{status && (
				<Notice status={status.type} isDismissible={false}>
					{status.message}
				</Notice>
			)}

			<RadioControl
				selected={mode}
				options={[
					{ label: __('Export', 'wp-figmakit'), value: 'export' },
					{ label: __('Import', 'wp-figmakit'), value: 'import' },
				]}
				onChange={setMode}
			/>

			{mode === 'export' && (
				<>
					<p className="fk-panel-portability__desc">
						{__('Download this page\'s blocks as a JSON file.', 'wp-figmakit')}
					</p>
					<Button
						variant="primary"
						className="fk-panel-portability__action"
						onClick={handleExport}
					>
						{__('Export Page', 'wp-figmakit')}
					</Button>
				</>
			)}

			{mode === 'import' && (
				<>
					<p className="fk-panel-portability__desc">
						{__('Import blocks from a JSON file.', 'wp-figmakit')}
					</p>
					<RadioControl
						label={__('Import mode', 'wp-figmakit')}
						selected={importMode}
						options={[
							{ label: __('Replace existing blocks', 'wp-figmakit'), value: 'replace' },
							{ label: __('Append to existing blocks', 'wp-figmakit'), value: 'append' },
						]}
						onChange={setImportMode}
					/>
					<Button
						variant="secondary"
						className="fk-panel-portability__action"
						onClick={handleImport}
					>
						{__('Choose File', 'wp-figmakit')}
					</Button>
					<input
						type="file"
						accept=".json"
						ref={fileRef}
						onChange={onFileChange}
						style={{ display: 'none' }}
					/>
				</>
			)}
		</div>
	);
}
