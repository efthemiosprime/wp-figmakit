<?php
/**
 * Apply text style utility classes to blocks on the frontend.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add text style classes to server-rendered blocks.
 */
function wp_figmakit_apply_block_text_style( $block_content, $block ) {
	if ( empty( $block['attrs']['fkTextStyle'] ) || empty( $block_content ) ) {
		return $block_content;
	}

	$text_style = $block['attrs']['fkTextStyle'];

	$allowed = array(
		'fk-text-title', 'fk-text-subtitle', 'fk-text-eyebrow',
		'fk-text-body-lg', 'fk-text-body-md', 'fk-text-body-sm',
		'fk-text-caption', 'fk-text-footnote', 'fk-text-link',
		'fk-fw-light', 'fk-fw-normal', 'fk-fw-medium', 'fk-fw-semibold', 'fk-fw-bold', 'fk-fw-black',
		'fk-ff-sans', 'fk-ff-mono',
	);

	$classes = array();
	foreach ( $text_style as $value ) {
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
add_filter( 'render_block', 'wp_figmakit_apply_block_text_style', 10, 2 );
