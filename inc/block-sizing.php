<?php
/**
 * Apply sizing utility classes to blocks on the frontend.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add sizing classes to server-rendered blocks.
 */
function wp_figmakit_apply_block_sizing( $block_content, $block ) {
	if ( empty( $block['attrs']['fkSizing'] ) || empty( $block_content ) ) {
		return $block_content;
	}

	$sizing = $block['attrs']['fkSizing'];

	$allowed = array(
		'fk-w-auto', 'fk-w-25', 'fk-w-33', 'fk-w-50', 'fk-w-66', 'fk-w-75', 'fk-w-full', 'fk-w-screen',
		'fk-mw-none', 'fk-mw-xs', 'fk-mw-sm', 'fk-mw-md', 'fk-mw-lg', 'fk-mw-xl', 'fk-mw-2xl', 'fk-mw-3xl', 'fk-mw-full',
		'fk-h-auto', 'fk-h-25', 'fk-h-50', 'fk-h-75', 'fk-h-full', 'fk-h-screen',
		'fk-mnh-0', 'fk-mnh-xs', 'fk-mnh-sm', 'fk-mnh-md', 'fk-mnh-lg', 'fk-mnh-xl', 'fk-mnh-2xl', 'fk-mnh-full', 'fk-mnh-screen',
		'fk-mxh-none', 'fk-mxh-full', 'fk-mxh-screen',
		'fk-of-hidden', 'fk-of-auto', 'fk-of-visible', 'fk-of-scroll',
	);

	$classes = array();
	foreach ( $sizing as $value ) {
		if ( ! empty( $value ) && in_array( $value, $allowed, true ) ) {
			$classes[] = $value;
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
// add_filter( 'render_block', 'wp_figmakit_apply_block_sizing', 10, 2 );
