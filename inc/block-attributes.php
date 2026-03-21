<?php
/**
 * Apply custom HTML attributes to server-rendered blocks.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Apply fkAttributes to block output on the frontend.
 */
function wp_figmakit_apply_block_attributes( $block_content, $block ) {
	if ( empty( $block['attrs']['fkAttributes'] ) || empty( $block_content ) ) {
		return $block_content;
	}

	$attrs = $block['attrs']['fkAttributes'];
	$dom   = new WP_HTML_Tag_Processor( $block_content );

	if ( ! $dom->next_tag() ) {
		return $block_content;
	}

	foreach ( $attrs as $attr ) {
		if ( empty( $attr['name'] ) || $attr['name'] === 'data-' ) {
			continue;
		}

		$name  = sanitize_key( $attr['name'] );
		$value = esc_attr( $attr['value'] );

		// Allow data-*, aria-*, role, title, alt, rel, target, id
		$allowed = array( 'id', 'title', 'alt', 'rel', 'target', 'role' );

		if ( $name === 'class' ) {
			$dom->add_class( $value );
		} elseif ( in_array( $name, $allowed, true ) || str_starts_with( $name, 'data-' ) || str_starts_with( $name, 'aria-' ) ) {
			$dom->set_attribute( $name, $value );
		}
	}

	return $dom->get_updated_html();
}
add_filter( 'render_block', 'wp_figmakit_apply_block_attributes', 10, 2 );
