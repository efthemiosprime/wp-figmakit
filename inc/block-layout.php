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
	if ( empty( $block['attrs']['fkLayout'] ) || empty( $block_content ) ) {
		return $block_content;
	}

	$layout = $block['attrs']['fkLayout'];

	$allowed = array(
		'd-block', 'd-flex', 'd-inline-flex', 'd-grid', 'd-none',
		'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse',
		'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly',
		'align-start', 'align-center', 'align-end', 'align-stretch', 'align-baseline',
		'flex-wrap', 'flex-nowrap',
		'gap-3xl', 'gap-2xl', 'gap-xl', 'gap-lg', 'gap-md', 'gap-sm', 'gap-xs', 'gap-2xs', 'gap-3xs', 'gap-4xs', 'gap-0',
	);

	$classes = array();
	foreach ( $layout as $value ) {
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
add_filter( 'render_block', 'wp_figmakit_apply_block_layout', 10, 2 );
