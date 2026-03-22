<?php
/**
 * Apply policy classes to blocks on the frontend.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add policy classes to server-rendered blocks.
 */
function wp_figmakit_apply_block_policies( $block_content, $block ) {
	if ( empty( $block['attrs']['fkPolicyClasses'] ) || empty( $block_content ) ) {
		return $block_content;
	}

	$classes = $block['attrs']['fkPolicyClasses'];

	if ( ! is_array( $classes ) || empty( $classes ) ) {
		return $block_content;
	}

	// Validate against saved policies
	$options  = get_option( 'wp_figmakit_options', array() );
	$policies = isset( $options['policies'] ) ? $options['policies'] : array();
	$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';

	$allowed = array();
	if ( isset( $policies[ $block_name ] ) ) {
		foreach ( $policies[ $block_name ] as $entry ) {
			$allowed[] = $entry['class'];
		}
	}

	$dom = new WP_HTML_Tag_Processor( $block_content );

	if ( ! $dom->next_tag() ) {
		return $block_content;
	}

	foreach ( $classes as $class ) {
		$class = sanitize_html_class( $class );
		if ( ! empty( $class ) && in_array( $class, $allowed, true ) ) {
			$dom->add_class( $class );
		}
	}

	return $dom->get_updated_html();
}
add_filter( 'render_block', 'wp_figmakit_apply_block_policies', 10, 2 );
