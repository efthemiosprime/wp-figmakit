<?php
/**
 * Apply button variant class on the frontend.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add fk-btn--{variant} class to core/button wrapper.
 */
function wp_figmakit_render_button_variant( $block_content, $block ) {
	if ( $block['blockName'] !== 'core/button' ) {
		return $block_content;
	}

	$variant = isset( $block['attrs']['fkButtonVariant'] )
		? sanitize_html_class( $block['attrs']['fkButtonVariant'] )
		: 'primary';

	// Primary is the default — no extra class needed
	if ( 'primary' === $variant ) {
		return $block_content;
	}

	$dom = new WP_HTML_Tag_Processor( $block_content );
	if ( $dom->next_tag() ) {
		$dom->add_class( 'fk-btn--' . $variant );
	}

	return $dom->get_updated_html();
}
add_filter( 'render_block', 'wp_figmakit_render_button_variant', 9, 2 );
