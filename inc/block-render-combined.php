<?php
/**
 * Combined render_block filter for class-based block extensions.
 *
 * Consolidates spacing, layout, sizing, text-style, visibility, and policies
 * into a single filter with one WP_HTML_Tag_Processor pass per block.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Apply all class-based attributes in a single render_block pass.
 */
function wp_figmakit_apply_combined_classes( $block_content, $block ) {
	if ( empty( $block_content ) ) {
		return $block_content;
	}

	$attrs   = isset( $block['attrs'] ) ? $block['attrs'] : array();
	$classes = array();

	// 1. Spacing classes (fkSpacing).
	if ( ! empty( $attrs['fkSpacing'] ) ) {
		$spacing = $attrs['fkSpacing'];
		$sides   = array( 'pt', 'pb', 'pl', 'pr', 'mt', 'mb', 'ml', 'mr' );

		foreach ( $sides as $side ) {
			if ( ! empty( $spacing[ $side ] ) ) {
				$classes[] = sanitize_html_class( $side . '-' . $spacing[ $side ] );
			}
		}

		if ( isset( $spacing['ml'], $spacing['mr'] ) && 'auto' === $spacing['ml'] && 'auto' === $spacing['mr'] ) {
			$classes[] = 'fk-d-block';
		}
	}

	// 2. Layout classes (fkLayout, fkLayoutTablet, fkLayoutMobile).
	$layout_allowed = array(
		'fk-d-block', 'fk-d-flex', 'fk-d-iflex', 'fk-d-grid', 'fk-d-none',
		'fk-dir-row', 'fk-dir-row-r', 'fk-dir-col', 'fk-dir-col-r',
		'fk-jc-start', 'fk-jc-center', 'fk-jc-end', 'fk-jc-between', 'fk-jc-around', 'fk-jc-evenly',
		'fk-ai-start', 'fk-ai-center', 'fk-ai-end', 'fk-ai-stretch', 'fk-ai-baseline',
		'fk-wrap', 'fk-nowrap',
		'gap-3xl', 'gap-2xl', 'gap-xl', 'gap-lg', 'gap-md', 'gap-sm', 'gap-xs', 'gap-2xs', 'gap-3xs', 'gap-4xs', 'gap-0',
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

	// 3. Sizing classes (fkSizing).
	if ( ! empty( $attrs['fkSizing'] ) && is_array( $attrs['fkSizing'] ) ) {
		$sizing_allowed = array(
			'fk-w-auto', 'fk-w-25', 'fk-w-33', 'fk-w-50', 'fk-w-66', 'fk-w-75', 'fk-w-full', 'fk-w-screen',
			'fk-mw-none', 'fk-mw-xs', 'fk-mw-sm', 'fk-mw-md', 'fk-mw-lg', 'fk-mw-xl', 'fk-mw-2xl', 'fk-mw-3xl', 'fk-mw-full',
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

	// 4. Text style classes (fkTextStyle).
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
	}

	// 5. Responsive visibility classes (fkVisibility).
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

	// 6. Policy classes (fkPolicyClasses).
	if ( ! empty( $attrs['fkPolicyClasses'] ) && is_array( $attrs['fkPolicyClasses'] ) ) {
		static $policies = null;
		if ( $policies === null ) {
			$options  = get_option( 'wp_figmakit_options', array() );
			$policies = isset( $options['policies'] ) ? $options['policies'] : array();
		}

		$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';
		$allowed    = array();
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

	// Skip HTML parsing if no classes or inline styles to add.
	if ( empty( $classes ) && empty( $font_family_slug ) ) {
		return $block_content;
	}

	$dom = new WP_HTML_Tag_Processor( $block_content );

	if ( ! $dom->next_tag() ) {
		return $block_content;
	}

	foreach ( $classes as $class ) {
		$dom->add_class( $class );
	}

	// Apply font-family as inline style using WP preset CSS variable.
	if ( ! empty( $font_family_slug ) ) {
		$existing_style = $dom->get_attribute( 'style' ) ?? '';
		$font_style     = 'font-family:var(--wp--preset--font-family--' . $font_family_slug . ')';
		$new_style      = $existing_style ? $existing_style . ';' . $font_style : $font_style;
		$dom->set_attribute( 'style', $new_style );
	}

	return $dom->get_updated_html();
}
add_filter( 'render_block', 'wp_figmakit_apply_combined_classes', 10, 2 );
