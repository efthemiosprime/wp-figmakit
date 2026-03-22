const { Fragment, useState, useEffect, useMemo } = wp.element;
const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl, ToggleControl, Spinner } = wp.components;
const { __ } = wp.i18n;
const { useSelect } = wp.data;

const VARIANT_OPTIONS = [
	{ label: __('Default (Logo top)', 'wp-figmakit'), value: 'default' },
	{ label: __('Utility Top', 'wp-figmakit'), value: 'header-utility-top' },
];

const INNER_BLOCKS_TEMPLATE = [
	['core/site-logo', { className: 'fk-header__logo-img' }],
];

const ALLOWED_BLOCKS = ['core/site-logo', 'core/image', 'core/group'];

/**
 * Build a nested menu tree from flat menu items.
 */
function buildMenuTree(items) {
	if (!items || !items.length) return [];
	const map = {};
	const roots = [];

	// Sort by menu_order
	const sorted = [...items].sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));

	sorted.forEach((item) => {
		map[item.id] = { ...item, children: [] };
	});

	sorted.forEach((item) => {
		const node = map[item.id];
		const parentId = item.parent || (item.menus && item.menus[0]) || 0;
		if (parentId && map[parentId]) {
			map[parentId].children.push(node);
		} else {
			roots.push(node);
		}
	});

	return roots;
}

/**
 * Decode HTML entities from REST API rendered strings.
 */
function decodeEntities(str) {
	const txt = document.createElement('textarea');
	txt.innerHTML = str;
	return txt.value;
}

/**
 * Render a nav menu preview from menu items.
 */
function MenuPreview({ menuId, type, label }) {
	const [items, setItems] = useState(null);

	useEffect(() => {
		if (!menuId) {
			setItems([]);
			return;
		}
		const controller = new AbortController();
		wp.apiFetch({ path: `/wp/v2/menu-items?menus=${menuId}&per_page=100`, signal: controller.signal }).then((data) => {
			setItems(data);
		}).catch((err) => {
			if (err.name !== 'AbortError') setItems([]);
		});
		return () => controller.abort();
	}, [menuId]);

	const tree = useMemo(() => buildMenuTree(items), [items]);

	const linkClass = type === 'utility' ? 'utility-nav-link' : 'nav-link';
	const ariaLabel = type === 'utility'
		? __('Utility navigation', 'wp-figmakit')
		: __('Main navigation', 'wp-figmakit');

	if (items === null) {
		return (
			<div className="fk-header__menu-loading">
				<Spinner />
			</div>
		);
	}

	if (!menuId) {
		return (
			<span className="fk-header__menu-label">
				{label} ({__('not selected', 'wp-figmakit')})
			</span>
		);
	}

	if (!tree.length) {
		return (
			<span className="fk-header__menu-label">
				{label} ({__('empty', 'wp-figmakit')})
			</span>
		);
	}

	return (
		<nav className={`fk-header__${type}`} aria-label={ariaLabel}>
			<ul className={`fk-header__${type}-list`}>
				{tree.map((item) => (
					<li
						key={item.id}
						className={`fk-header__${type}-item${item.children.length ? ` fk-header__${type}-item--has-children` : ''}`}
					>
						<a className={linkClass} href="#" onClick={(e) => e.preventDefault()}>
							{type === 'primary' ? (
								<span>{decodeEntities(item.title.rendered)}</span>
							) : (
								item.title.rendered
							)}
							{item.children.length > 0 && (
								<span className="fk-header__chevron" aria-hidden="true" />
							)}
						</a>
						{item.children.length > 0 && (
							<ul className={`fk-header__${type}-sub`}>
								{item.children.map((child) => (
									<li key={child.id}>
										<a className={linkClass} href="#" onClick={(e) => e.preventDefault()}>
											{child.title.rendered}
										</a>
									</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
}

export default function Edit({ attributes, setAttributes }) {
	const { variant, utilityMenuId, mainMenuId, showUtilityMenu, showSkipLink } = attributes;

	const blockProps = useBlockProps({
		className: `fk-header fk-header--${variant}`,
	});

	const menus = useSelect((select) => {
		return select('core').getEntityRecords('taxonomy', 'nav_menu', { per_page: -1 });
	}, []);

	const menuOptions = [
		{ label: __('— Select Menu —', 'wp-figmakit'), value: 0 },
		...(menus || []).map((menu) => ({
			label: menu.name,
			value: menu.id,
		})),
	];

	const isLoading = menus === null;

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Header Settings', 'wp-figmakit')} initialOpen={true}>
					<SelectControl
						label={__('Variant', 'wp-figmakit')}
						value={variant}
						options={VARIANT_OPTIONS}
						onChange={(val) => setAttributes({ variant: val })}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Show Skip Link', 'wp-figmakit')}
						checked={showSkipLink}
						onChange={(val) => setAttributes({ showSkipLink: val })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__('Menus', 'wp-figmakit')} initialOpen={true}>
					{isLoading ? (
						<Spinner />
					) : (
						<Fragment>
							<ToggleControl
								label={__('Show Utility Menu', 'wp-figmakit')}
								checked={showUtilityMenu}
								onChange={(val) => setAttributes({ showUtilityMenu: val })}
								__nextHasNoMarginBottom
							/>
							{showUtilityMenu && (
								<SelectControl
									label={__('Utility Menu', 'wp-figmakit')}
									value={utilityMenuId}
									options={menuOptions}
									onChange={(val) => setAttributes({ utilityMenuId: parseInt(val, 10) })}
									__nextHasNoMarginBottom
								/>
							)}
							<SelectControl
								label={__('Main Menu', 'wp-figmakit')}
								value={mainMenuId}
								options={menuOptions}
								onChange={(val) => setAttributes({ mainMenuId: parseInt(val, 10) })}
								__nextHasNoMarginBottom
							/>
						</Fragment>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="fk-header__inner">
					{variant === 'default' ? (
						<Fragment>
							<div className="fk-header__row fk-header__row--main">
								<div className="fk-header__logo">
									<InnerBlocks
										template={INNER_BLOCKS_TEMPLATE}
										allowedBlocks={ALLOWED_BLOCKS}
										templateLock={false}
									/>
								</div>
								<div className="fk-header__menus">
									{showUtilityMenu && (
										<div className="fk-header__menus-row">
											<MenuPreview menuId={utilityMenuId} type="utility" label={__('Utility Menu', 'wp-figmakit')} />
										</div>
									)}
									<div className="fk-header__menus-row">
										<MenuPreview menuId={mainMenuId} type="primary" label={__('Main Menu', 'wp-figmakit')} />
									</div>
								</div>
							</div>
						</Fragment>
					) : (
						<Fragment>
							<div className="fk-header__row fk-header__row--top">
								{showUtilityMenu && (
									<MenuPreview menuId={utilityMenuId} type="utility" label={__('Utility Menu', 'wp-figmakit')} />
								)}
							</div>
							<div className="fk-header__row fk-header__row--main">
								<div className="fk-header__logo">
									<InnerBlocks
										template={INNER_BLOCKS_TEMPLATE}
										allowedBlocks={ALLOWED_BLOCKS}
										templateLock={false}
									/>
								</div>
								<MenuPreview menuId={mainMenuId} type="primary" label={__('Main Menu', 'wp-figmakit')} />
							</div>
						</Fragment>
					)}
				</div>
			</div>
		</Fragment>
	);
}
