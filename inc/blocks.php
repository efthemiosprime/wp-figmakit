<?php
/**
 * Block registration and management.
 *
 * Auto-registers all blocks found in the /blocks directory.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register all custom blocks from the blocks directory.
 */
function wp_figmakit_register_blocks() {
	$blocks_dir = WP_FIGMAKIT_DIR . '/blocks';

	if ( ! is_dir( $blocks_dir ) ) {
		return;
	}

	$block_dirs = glob( $blocks_dir . '/*/block.json' );

	foreach ( $block_dirs as $block_json ) {
		register_block_type( dirname( $block_json ) );
	}
}
add_action( 'init', 'wp_figmakit_register_blocks' );

/**
 * Register a block category for Figmakit blocks.
 */
function wp_figmakit_block_categories( $categories ) {
	return array_merge(
		array(
			array(
				'slug'  => 'wp-figmakit',
				'title' => 'WP Figmakit',
				'icon'  => null,
			),
		),
		$categories
	);
}
add_filter( 'block_categories_all', 'wp_figmakit_block_categories', 10, 1 );
