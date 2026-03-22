<?php
/**
 * Apply responsive visibility classes to blocks on the frontend.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add visibility hide classes to server-rendered blocks.
 */
function wp_figmakit_apply_responsive_visibility( $block_content, $block ) {
	if ( empty( $block['attrs']['fkVisibility'] ) || empty( $block_content ) ) {
		return $block_content;
	}

	$vis     = $block['attrs']['fkVisibility'];
	$classes = array();

	if ( isset( $vis['desktop'] ) && ! $vis['desktop'] ) {
		$classes[] = 'fk-hide-desktop';
	}
	if ( isset( $vis['tablet'] ) && ! $vis['tablet'] ) {
		$classes[] = 'fk-hide-tablet';
	}
	if ( isset( $vis['mobile'] ) && ! $vis['mobile'] ) {
		$classes[] = 'fk-hide-mobile';
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
// add_filter( 'render_block', 'wp_figmakit_apply_responsive_visibility', 10, 2 );
