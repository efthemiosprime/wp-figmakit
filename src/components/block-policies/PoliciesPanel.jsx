const { useState, useEffect, useCallback } = wp.element;
const { PanelBody, CheckboxControl } = wp.components;
const { __ } = wp.i18n;

// Module-level cache for policies.
let policiesCache = null;
let policiesLoading = false;
let policiesCallbacks = [];

// Listen for policy updates from PoliciesPanel in the toolbar.
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

export default function PoliciesPanel({ attributes, setAttributes, name }) {
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

	const blockPolicies = policies && policies[name] ? policies[name] : [];

	if (!policies || blockPolicies.length === 0) {
		return null;
	}

	return (
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
	);
}
