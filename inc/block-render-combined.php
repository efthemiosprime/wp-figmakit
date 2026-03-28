<?php
/**
 * Unified render_block filter for all class-based block extensions.
 *
 * Single WP_HTML_Tag_Processor pass per block for: spacing, layout, sizing,
 * text-style, visibility, policies, button-variant, block-attributes.
 * Button-icon injection runs as a post-processor (DOM insertion).
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build the spacing class allowlist programmatically.
 */
function wp_figmakit_spacing_allowlist() {
	static $allowlist = null;
	if ( $allowlist !== null ) {
		return $allowlist;
	}

	$sides = array( 'pt', 'pb', 'pl', 'pr', 'mt', 'mb', 'ml', 'mr' );
	$sizes = array( '3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs', '2xs', '3xs', '4xs', '0' );

	$allowlist = array();
	foreach ( $sides as $side ) {
		foreach ( $sizes as $size ) {
			$allowlist[] = 'fk-' . $side . '-' . $size;
		}
	}

	// Auto margins for centering.
	$allowlist[] = 'fk-mt-auto';
	$allowlist[] = 'fk-mb-auto';
	$allowlist[] = 'fk-ml-auto';
	$allowlist[] = 'fk-mr-auto';

	return $allowlist;
}

/**
 * Apply all block extensions in a single render_block pass.
 */
function wp_figmakit_render_block_extensions( $block_content, $block ) {
	if ( empty( $block_content ) ) {
		return $block_content;
	}

	$attrs      = isset( $block['attrs'] ) ? $block['attrs'] : array();
	$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';
	$classes    = array();
	$styles     = array();
	$html_attrs = array();

	// ──────────────────────────────────────────────────────────────────────
	// 1. Spacing classes (fkSpacing) — validated against allowlist.
	// ──────────────────────────────────────────────────────────────────────
	if ( ! empty( $attrs['fkSpacing'] ) ) {
		$spacing   = $attrs['fkSpacing'];
		$allowed   = wp_figmakit_spacing_allowlist();
		$sides     = array( 'pt', 'pb', 'pl', 'pr', 'mt', 'mb', 'ml', 'mr' );

		foreach ( $sides as $side ) {
			if ( ! empty( $spacing[ $side ] ) ) {
				$candidate = 'fk-' . $side . '-' . $spacing[ $side ];
				if ( in_array( $candidate, $allowed, true ) ) {
					$classes[] = $candidate;
				}
			}
		}

		// Auto-add d-block when left+right margins are auto (centering).
		if ( isset( $spacing['ml'], $spacing['mr'] ) && 'auto' === $spacing['ml'] && 'auto' === $spacing['mr'] ) {
			$classes[] = 'fk-d-block';
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// 2. Layout classes (fkLayout, fkLayoutTablet, fkLayoutMobile).
	// ──────────────────────────────────────────────────────────────────────
	$layout_allowed = array(
		'fk-d-block', 'fk-d-flex', 'fk-d-iflex', 'fk-d-grid', 'fk-d-none',
		'fk-dir-row', 'fk-dir-row-r', 'fk-dir-col', 'fk-dir-col-r',
		'fk-jc-start', 'fk-jc-center', 'fk-jc-end', 'fk-jc-between', 'fk-jc-around', 'fk-jc-evenly',
		'fk-ai-start', 'fk-ai-center', 'fk-ai-end', 'fk-ai-stretch', 'fk-ai-baseline',
		'fk-wrap', 'fk-nowrap',
		'fk-gap-3xl', 'fk-gap-2xl', 'fk-gap-xl', 'fk-gap-lg', 'fk-gap-md', 'fk-gap-sm', 'fk-gap-xs', 'fk-gap-2xs', 'fk-gap-3xs', 'fk-gap-4xs', 'fk-gap-0',
		'fk-t-d-block', 'fk-t-d-flex', 'fk-t-d-none',
		'fk-t-dir-row', 'fk-t-dir-col',
		'fk-m-d-block', 'fk-m-d-flex', 'fk-m-d-none',
		'fk-m-dir-row', 'fk-m-dir-col',
	);

	foreach ( array( 'fkLayout', 'fkLayoutTablet', 'fkLayoutMobile' ) as $layout_key ) {
		if ( ! empty( $attrs[ $layout_key ] ) && is_array( $attrs[ $layout_key ] ) ) {
			foreach ( $attrs[ $layout_key ] as $value ) {
				if ( ! empty( $value ) && in_array( $value, $layout_allowed, true ) ) {
					$classes[] = $value;
				}
			}
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// 3. Sizing classes (fkSizing).
	// ──────────────────────────────────────────────────────────────────────
	if ( ! empty( $attrs['fkSizing'] ) && is_array( $attrs['fkSizing'] ) ) {
		$sizing_allowed = array(
			'fk-w-auto', 'fk-w-fit', 'fk-w-25', 'fk-w-33', 'fk-w-50', 'fk-w-66', 'fk-w-75', 'fk-w-full', 'fk-w-screen',
			'fk-mw-none', 'fk-mw-xs', 'fk-mw-sm', 'fk-mw-md', 'fk-mw-lg', 'fk-mw-xl', 'fk-mw-2xl', 'fk-mw-3xl', 'fk-mw-full',
			'fk-mnw-0', 'fk-mnw-full',
			'fk-h-auto', 'fk-h-25', 'fk-h-50', 'fk-h-75', 'fk-h-full', 'fk-h-screen',
			'fk-mnh-0', 'fk-mnh-xs', 'fk-mnh-sm', 'fk-mnh-md', 'fk-mnh-lg', 'fk-mnh-xl', 'fk-mnh-2xl', 'fk-mnh-full', 'fk-mnh-screen',
			'fk-mxh-none', 'fk-mxh-full', 'fk-mxh-screen',
			'fk-of-hidden', 'fk-of-auto', 'fk-of-visible', 'fk-of-scroll',
		);

		foreach ( $attrs['fkSizing'] as $value ) {
			if ( ! empty( $value ) && in_array( $value, $sizing_allowed, true ) ) {
				$classes[] = $value;
			}
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// 4. Text style classes (fkTextStyle).
	// ──────────────────────────────────────────────────────────────────────
	$font_family_slug = '';
	if ( ! empty( $attrs['fkTextStyle'] ) && is_array( $attrs['fkTextStyle'] ) ) {
		$text_allowed = array(
			'fk-text-title', 'fk-text-subtitle', 'fk-text-eyebrow',
			'fk-text-body-lg', 'fk-text-body-md', 'fk-text-body-sm',
			'fk-text-caption', 'fk-text-footnote', 'fk-text-link',
			'fk-fw-light', 'fk-fw-normal', 'fk-fw-medium', 'fk-fw-semibold', 'fk-fw-bold', 'fk-fw-black',
			'fk-ff-sans', 'fk-ff-mono',
			'fk-tc-primary', 'fk-tc-secondary', 'fk-tc-accent', 'fk-tc-highlight',
			'fk-tc-text', 'fk-tc-text-light', 'fk-tc-white',
		);

		foreach ( $attrs['fkTextStyle'] as $key => $value ) {
			if ( empty( $value ) ) {
				continue;
			}
			// Font family is stored as a slug, applied as inline style.
			if ( 'family' === $key && ! str_starts_with( $value, 'fk-ff-' ) ) {
				$font_family_slug = sanitize_html_class( $value );
				continue;
			}
			if ( in_array( $value, $text_allowed, true ) ) {
				$classes[] = $value;
			}
		}

		if ( ! empty( $font_family_slug ) ) {
			$styles['font-family'] = 'var(--wp--preset--font-family--' . $font_family_slug . ')';
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// 5. Responsive visibility classes (fkVisibility).
	// ──────────────────────────────────────────────────────────────────────
	if ( ! empty( $attrs['fkVisibility'] ) ) {
		$vis = $attrs['fkVisibility'];
		if ( isset( $vis['desktop'] ) && ! $vis['desktop'] ) {
			$classes[] = 'fk-hide-desktop';
		}
		if ( isset( $vis['tablet'] ) && ! $vis['tablet'] ) {
			$classes[] = 'fk-hide-tablet';
		}
		if ( isset( $vis['mobile'] ) && ! $vis['mobile'] ) {
			$classes[] = 'fk-hide-mobile';
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// 6. Policy classes (fkPolicyClasses).
	// ──────────────────────────────────────────────────────────────────────
	if ( ! empty( $attrs['fkPolicyClasses'] ) && is_array( $attrs['fkPolicyClasses'] ) ) {
		static $policies = null;
		if ( $policies === null ) {
			$options  = get_option( 'wp_figmakit_options', array() );
			$policies = isset( $options['policies'] ) ? $options['policies'] : array();
		}

		$allowed = array();
		if ( isset( $policies[ $block_name ] ) ) {
			foreach ( $policies[ $block_name ] as $entry ) {
				$allowed[] = $entry['class'];
			}
		}

		foreach ( $attrs['fkPolicyClasses'] as $class ) {
			$class = sanitize_html_class( $class );
			if ( ! empty( $class ) && in_array( $class, $allowed, true ) ) {
				$classes[] = $class;
			}
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// 7. Button variant (fkButtonVariant) — core/button only.
	// ──────────────────────────────────────────────────────────────────────
	if ( 'core/button' === $block_name ) {
		$variant = isset( $attrs['fkButtonVariant'] )
			? sanitize_html_class( $attrs['fkButtonVariant'] )
			: 'primary';

		if ( 'primary' !== $variant && ! empty( $variant ) ) {
			$classes[] = 'fk-btn--' . $variant;
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// 8. Block attributes (fkAttributes) — arbitrary HTML attributes.
	// ──────────────────────────────────────────────────────────────────────
	if ( ! empty( $attrs['fkAttributes'] ) && is_array( $attrs['fkAttributes'] ) ) {
		$allowed_attr_names = array( 'id', 'title', 'alt', 'rel', 'target', 'role' );

		foreach ( $attrs['fkAttributes'] as $attr ) {
			if ( empty( $attr['name'] ) || $attr['name'] === 'data-' ) {
				continue;
			}

			$name  = sanitize_key( $attr['name'] );
			$value = esc_attr( $attr['value'] );

			if ( 'class' === $name ) {
				$classes[] = sanitize_html_class( $value );
			} elseif ( in_array( $name, $allowed_attr_names, true ) || str_starts_with( $name, 'data-' ) || str_starts_with( $name, 'aria-' ) ) {
				$html_attrs[ $name ] = $value;
			}
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// 9. Button icon data (fkButtonIcon) — core/button only.
	//    Collect data here; injection happens as post-processor below.
	// ──────────────────────────────────────────────────────────────────────
	$icon_data = null;
	if ( 'core/button' === $block_name && ! empty( $attrs['fkButtonIcon'] ) ) {
		$icon     = sanitize_html_class( $attrs['fkButtonIcon'] );
		$position = isset( $attrs['fkButtonIconPosition'] )
			? sanitize_html_class( $attrs['fkButtonIconPosition'] )
			: 'leading';

		// Map legacy values.
		if ( 'before' === $position ) {
			$position = 'leading';
		} elseif ( 'after' === $position ) {
			$position = 'trailing';
		}

		$icon_data = array(
			'icon'     => $icon,
			'position' => $position,
		);

		$classes[] = 'fk-has-button-icon';
		$classes[] = 'fk-icon-position-' . $position;

		if ( 'icon-only' === $position ) {
			$classes[] = 'fk-icon-only';
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// Single WP_HTML_Tag_Processor pass — apply classes, styles, attributes.
	// ──────────────────────────────────────────────────────────────────────
	if ( empty( $classes ) && empty( $styles ) && empty( $html_attrs ) && ! $icon_data ) {
		return $block_content;
	}

	$dom = new WP_HTML_Tag_Processor( $block_content );

	if ( ! $dom->next_tag() ) {
		return $block_content;
	}

	foreach ( $classes as $class ) {
		$dom->add_class( $class );
	}

	// Merge inline styles.
	if ( ! empty( $styles ) ) {
		$existing_style = $dom->get_attribute( 'style' ) ?? '';
		$style_parts    = array();
		foreach ( $styles as $prop => $val ) {
			$style_parts[] = $prop . ':' . $val;
		}
		$new_style = $existing_style
			? rtrim( $existing_style, '; ' ) . ';' . implode( ';', $style_parts )
			: implode( ';', $style_parts );
		$dom->set_attribute( 'style', $new_style );
	}

	// Set HTML attributes.
	foreach ( $html_attrs as $name => $value ) {
		$dom->set_attribute( $name, $value );
	}

	$result = $dom->get_updated_html();

	// ──────────────────────────────────────────────────────────────────────
	// Post-processor: inject button icon <span> inside <a> tag.
	// ──────────────────────────────────────────────────────────────────────
	if ( $icon_data ) {
		$icon_html = '<span class="fk-btn-icon dashicons dashicons-' . $icon_data['icon'] . '" aria-hidden="true"></span>';

		if ( 'trailing' === $icon_data['position'] ) {
			$result = preg_replace( '/(<\/a>)/', $icon_html . '$1', $result, 1 );
		} else {
			$result = preg_replace( '/(<a\b[^>]*>)/', '$1' . $icon_html, $result, 1 );
		}
	}

	return $result;
}
add_filter( 'render_block', 'wp_figmakit_render_block_extensions', 10, 2 );

/**
 * Enqueue Dashicons on the frontend for button icons.
 */
function wp_figmakit_enqueue_dashicons() {
	wp_enqueue_style( 'dashicons' );
}
add_action( 'wp_enqueue_scripts', 'wp_figmakit_enqueue_dashicons' );
