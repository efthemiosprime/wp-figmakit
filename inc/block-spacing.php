<?php
/**
 * Apply spacing utility classes to blocks on the frontend.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add spacing classes to server-rendered blocks.
 */
function wp_figmakit_apply_block_spacing( $block_content, $block ) {
	if ( empty( $block['attrs']['fkSpacing'] ) || empty( $block_content ) ) {
		return $block_content;
	}

	$spacing = $block['attrs']['fkSpacing'];
	$sides   = array( 'pt', 'pb', 'pl', 'pr', 'mt', 'mb', 'ml', 'mr' );
	$classes = array();

	foreach ( $sides as $side ) {
		if ( ! empty( $spacing[ $side ] ) ) {
			$classes[] = sanitize_html_class( $side . '-' . $spacing[ $side ] );
		}
	}

	// Auto-add d-block when left+right margins are auto (centering)
	if ( isset( $spacing['ml'], $spacing['mr'] ) && 'auto' === $spacing['ml'] && 'auto' === $spacing['mr'] ) {
		$classes[] = 'd-block';
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
add_filter( 'render_block', 'wp_figmakit_apply_block_spacing', 10, 2 );
