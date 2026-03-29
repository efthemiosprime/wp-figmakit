/**
 * Re-sync from Figma Toolbar Button
 *
 * Adds a toolbar button on blocks that belong to a FigmaKit pattern.
 * Clicking it re-imports the Figma component and updates the block
 * pattern content via the plugin's REST API.
 */

const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useState, createElement } = wp.element;
const { useSelect } = wp.data;
const { __ } = wp.i18n;

const syncIcon = wp.element.createElement('svg', {
	xmlns: 'http://www.w3.org/2000/svg',
	viewBox: '0 0 24 24',
	width: 24,
	height: 24,
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 2,
}, [
	wp.element.createElement('path', { key: '1', d: 'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }),
	wp.element.createElement('path', { key: '2', d: 'M3 3v5h5' }),
	wp.element.createElement('path', { key: '3', d: 'M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16' }),
	wp.element.createElement('path', { key: '4', d: 'M16 16h5v5' }),
]);

function SyncButton({ clientId }) {
	const [syncing, setSyncing] = useState(false);

	// Check if this block is a synced pattern (core/block reference) with FigmaKit meta.
	const componentId = useSelect((select) => {
		const block = select('core/block-editor').getBlock(clientId);
		if (!block) return null;

		// core/block is a synced pattern reference — check its ref post for _fk_component_id.
		if (block.name === 'core/block' && block.attributes.ref) {
			const post = select('core').getEntityRecord('postType', 'wp_block', block.attributes.ref);
			if (post?.meta?._fk_component_id) {
				return post.meta._fk_component_id;
			}
		}

		return null;
	}, [clientId]);

	if (!componentId) {
		return null;
	}

	const handleSync = async () => {
		setSyncing(true);
		try {
			const apiUrl = window.fkEditorData?.apiUrl || '/wp-json/figmakit/v1/';
			const result = await wp.apiFetch({
				path: apiUrl + 'components/' + componentId + '/sync-pattern',
				method: 'POST',
			});

			wp.data.dispatch('core/notices').createSuccessNotice(
				__('Pattern re-synced from Figma.', 'wp-figmakit'),
				{ type: 'snackbar' }
			);

			// Invalidate the pattern cache so the editor reloads it.
			wp.data.dispatch('core').invalidateResolution('getEntityRecord', ['postType', 'wp_block', result.post_id || result.data?.post_id]);
		} catch (err) {
			wp.data.dispatch('core/notices').createErrorNotice(
				__('Sync failed: ', 'wp-figmakit') + (err.message || __('Unknown error', 'wp-figmakit')),
				{ type: 'snackbar' }
			);
		}
		setSyncing(false);
	};

	const { ToolbarGroup, ToolbarButton, Spinner } = wp.components;

	return createElement(
		ToolbarGroup,
		null,
		createElement(ToolbarButton, {
			icon: syncing ? createElement(Spinner, null) : syncIcon,
			label: __('Re-sync from Figma', 'wp-figmakit'),
			onClick: handleSync,
			disabled: syncing,
		})
	);
}

// Only register the filter if the FigmaKit plugin is active.
// Without the plugin there are no component IDs, no REST API, no patterns to sync.
const pluginActive = window.fkEditorData?.pluginActive === true;

const withFigmaSync = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const showSync = pluginActive && (props.name === 'core/block' || props.name.startsWith('wp-figmakit/'));

		if (!showSync) {
			return createElement(BlockEdit, props);
		}

		const { BlockControls } = wp.blockEditor;

		return createElement(
			Fragment,
			null,
			createElement(
				BlockControls,
				{ group: 'other' },
				createElement(SyncButton, { clientId: props.clientId })
			),
			createElement(BlockEdit, props)
		);
	};
}, 'withFigmaSync');

// Only register filter when plugin is active — no sync functionality without it.
if (pluginActive) {
	addFilter('editor.BlockEdit', 'wp-figmakit/figma-sync', withFigmaSync, 20);
}
