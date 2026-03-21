<?php
/**
 * Block pattern registration.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register block pattern category.
 */
function wp_figmakit_register_pattern_categories() {
	register_block_pattern_category( 'wp-figmakit', array(
		'label' => 'WP Figmakit',
	) );
}
add_action( 'init', 'wp_figmakit_register_pattern_categories' );
