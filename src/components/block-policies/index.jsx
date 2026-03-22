const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment, useState, useEffect, useCallback } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, CheckboxControl } = wp.components;
const { __ } = wp.i18n;

// Module-level cache for policies
let policiesCache = null;
let policiesLoading = false;
let policiesCallbacks = [];

// Listen for policy updates from PoliciesPanel.
document.addEventListener('fk-policies-updated', (e) => {
	policiesCache = e.detail;
});

function loadPolicies(callback) {

	if (policiesCache !== null) {
		callback(policiesCache);
		return;
	}

	policiesCallbacks.push(callback);

	if (policiesLoading) return;
	policiesLoading = true;

	wp.apiFetch({ path: '/wp-figmakit/v1/policies' }).then((data) => {
		policiesCache = data || {};
		policiesLoading = false;
		policiesCallbacks.forEach((cb) => cb(policiesCache));
		policiesCallbacks = [];
	}).catch(() => {
		policiesCache = {};
		policiesLoading = false;
		policiesCallbacks.forEach((cb) => cb(policiesCache));
		policiesCallbacks = [];
	});
}

/**
 * Add fkPolicyClasses attribute to all blocks.
 */
addFilter('blocks.registerBlockType', 'wp-figmakit/block-policies', (settings) => {
	settings.attributes = {
		...settings.attributes,
		fkPolicyClasses: {
			type: 'array',
			default: [],
		},
	};
	return settings;
});

/**
 * Style Classes panel in the block inspector.
 */
const withPoliciesPanel = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { attributes, setAttributes, name } = props;
		const [policies, setPolicies] = useState(null);
		const selected = attributes.fkPolicyClasses || [];

		useEffect(() => {
			loadPolicies(setPolicies);
		}, []);

		const toggleClass = useCallback((className) => {
			const current = attributes.fkPolicyClasses || [];
			const updated = current.includes(className)
				? current.filter((c) => c !== className)
				: [...current, className];
			setAttributes({ fkPolicyClasses: updated });
		}, [attributes.fkPolicyClasses, setAttributes]);

		// Check if this block type has policies
		const blockPolicies = policies && policies[name] ? policies[name] : [];

		if (!policies || blockPolicies.length === 0) {
			return <BlockEdit {...props} />;
		}

		return (
			<Fragment>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						title={__('Style Classes', 'wp-figmakit')}
						initialOpen={false}
						className="fk-policies-panel"
					>
						{blockPolicies.map((entry) => (
							<CheckboxControl
								key={entry.class}
								label={entry.label}
								help={entry.class}
								checked={selected.includes(entry.class)}
								onChange={() => toggleClass(entry.class)}
								__nextHasNoMarginBottom
							/>
						))}
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withPoliciesPanel');

addFilter('editor.BlockEdit', 'wp-figmakit/block-policies-panel', withPoliciesPanel);
