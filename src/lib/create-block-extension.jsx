/**
 * Factory for registering block editor extensions.
 *
 * Encapsulates the 3-filter pattern:
 *   1. blocks.registerBlockType — attribute registration
 *   2. editor.BlockEdit — inspector panel + optional toolbar
 *   3. editor.BlockListBlock — editor class/style mirroring
 */

const { createHigherOrderComponent } = wp.compose;
const { addFilter } = wp.hooks;
const { Fragment } = wp.element;
const { InspectorControls, BlockControls } = wp.blockEditor;

function capitalize(str) {
	return str.replace(/(^|-)(\w)/g, (_, _sep, ch) => ch.toUpperCase());
}

/**
 * @param {Object} config
 * @param {string}   config.name       — unique extension name (e.g. 'block-sizing')
 * @param {Object}   config.attribute  — { key, type, default }
 * @param {Object}   [config.extraAttributes] — additional attributes keyed by name
 *                     Each value: { type, default, blockFilter? }
 * @param {Function} [config.blockFilter] — (blockName) => boolean, omit for all blocks
 * @param {Function} [config.getClasses] — (attrValue, allAttributes) => string[]
 * @param {Function} [config.getWrapperProps] — (attrValue, existingWrapperProps, allAttributes) => object
 * @param {Component} config.Panel     — inspector panel component
 *                     Receives { attributes, setAttributes, name, clientId }
 * @param {Component} [config.Toolbar] — block toolbar component
 *                     Receives { attributes, setAttributes, name }
 */
export function createBlockExtension(config) {
	const {
		name,
		attribute,
		extraAttributes = {},
		blockFilter = null,
		getClasses = null,
		getWrapperProps = null,
		Panel,
		Toolbar = null,
	} = config;

	const namespace = `wp-figmakit/${name}`;
	const displayName = capitalize(name);

	// ── 1. Register attributes ──────────────────────────────────────────
	addFilter('blocks.registerBlockType', namespace, (settings, blockName) => {
		if (blockFilter && !blockFilter(blockName)) {
			return settings;
		}

		settings.attributes = {
			...settings.attributes,
			[attribute.key]: {
				type: attribute.type,
				default: attribute.default,
			},
		};

		for (const [key, def] of Object.entries(extraAttributes)) {
			if (def.blockFilter && !def.blockFilter(blockName)) {
				continue;
			}
			settings.attributes[key] = { type: def.type, default: def.default };
		}

		return settings;
	});

	// ── 2. Inspector panel + optional toolbar ────────────────────────────
	const withPanel = createHigherOrderComponent((BlockEdit) => {
		return (props) => {
			if (blockFilter && !blockFilter(props.name)) {
				return <BlockEdit {...props} />;
			}

			return (
				<Fragment>
					{Toolbar && (
						<BlockControls>
							<Toolbar
								attributes={props.attributes}
								setAttributes={props.setAttributes}
								name={props.name}
							/>
						</BlockControls>
					)}
					<BlockEdit {...props} />
					<InspectorControls>
						<Panel
							attributes={props.attributes}
							setAttributes={props.setAttributes}
							name={props.name}
							clientId={props.clientId}
						/>
					</InspectorControls>
				</Fragment>
			);
		};
	}, `with${displayName}Panel`);

	addFilter('editor.BlockEdit', `${namespace}-panel`, withPanel);

	// ── 3. Editor class/style mirroring ─────────────────────────────────
	if (getClasses || getWrapperProps) {
		const withEditorMirror = createHigherOrderComponent((BlockListBlock) => {
			return (props) => {
				if (blockFilter && !blockFilter(props.name)) {
					return <BlockListBlock {...props} />;
				}

				const attrValue = props.attributes[attribute.key];
				const classes = getClasses ? getClasses(attrValue, props.attributes) : [];
				const extraWP = getWrapperProps
					? getWrapperProps(attrValue, props.wrapperProps, props.attributes)
					: null;

				if (classes.length === 0 && !extraWP) {
					return <BlockListBlock {...props} />;
				}

				const existing = props.className || '';
				const newClassName = classes.length > 0
					? [existing, ...classes].filter(Boolean).join(' ')
					: existing;

				return (
					<BlockListBlock
						{...props}
						className={newClassName}
						{...(extraWP ? { wrapperProps: extraWP } : {})}
					/>
				);
			};
		}, `with${displayName}Classes`);

		addFilter('editor.BlockListBlock', `${namespace}-classes`, withEditorMirror);
	}
}
