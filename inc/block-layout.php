<?php
/**
 * Apply layout utility classes to blocks on the frontend.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add layout classes to server-rendered blocks.
 */
function wp_figmakit_apply_block_layout( $block_content, $block ) {
	$has_layout  = ! empty( $block['attrs']['fkLayout'] );
	$has_tablet  = ! empty( $block['attrs']['fkLayoutTablet'] );
	$has_mobile  = ! empty( $block['attrs']['fkLayoutMobile'] );

	if ( ( ! $has_layout && ! $has_tablet && ! $has_mobile ) || empty( $block_content ) ) {
		return $block_content;
	}

	$allowed = array(
		'fk-d-block', 'fk-d-flex', 'fk-d-iflex', 'fk-d-grid', 'fk-d-none',
		'fk-dir-row', 'fk-dir-row-r', 'fk-dir-col', 'fk-dir-col-r',
		'fk-jc-start', 'fk-jc-center', 'fk-jc-end', 'fk-jc-between', 'fk-jc-around', 'fk-jc-evenly',
		'fk-ai-start', 'fk-ai-center', 'fk-ai-end', 'fk-ai-stretch', 'fk-ai-baseline',
		'fk-wrap', 'fk-nowrap',
		'gap-3xl', 'gap-2xl', 'gap-xl', 'gap-lg', 'gap-md', 'gap-sm', 'gap-xs', 'gap-2xs', 'gap-3xs', 'gap-4xs', 'gap-0',
		// Tablet responsive
		'fk-t-d-block', 'fk-t-d-flex', 'fk-t-d-none',
		'fk-t-dir-row', 'fk-t-dir-col',
		// Mobile responsive
		'fk-m-d-block', 'fk-m-d-flex', 'fk-m-d-none',
		'fk-m-dir-row', 'fk-m-dir-col',
	);

	$classes = array();

	// Desktop layout
	if ( $has_layout ) {
		foreach ( $block['attrs']['fkLayout'] as $value ) {
			if ( ! empty( $value ) && in_array( $value, $allowed, true ) ) {
				$classes[] = $value;
			}
		}
	}

	// Tablet overrides
	if ( $has_tablet ) {
		foreach ( $block['attrs']['fkLayoutTablet'] as $value ) {
			if ( ! empty( $value ) && in_array( $value, $allowed, true ) ) {
				$classes[] = $value;
			}
		}
	}

	// Mobile overrides
	if ( $has_mobile ) {
		foreach ( $block['attrs']['fkLayoutMobile'] as $value ) {
			if ( ! empty( $value ) && in_array( $value, $allowed, true ) ) {
				$classes[] = $value;
			}
		}
	}

	if ( empty( $classes ) ) {
		return $block_content;
	}

	$dom = new WP_HTML_Tag_Processor( $block_content );

	if ( ! $dom->next_tag() ) {
		return $block_content;
	}

	foreach ( $classes as $class ) {
		$dom->add_class( $class );
	}

	return $dom->get_updated_html();
}
// Moved to block-render-combined.php for single-pass performance.
// add_filter( 'render_block', 'wp_figmakit_apply_block_layout', 10, 2 );
