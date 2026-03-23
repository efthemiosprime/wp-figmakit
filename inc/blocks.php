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

/**
 * Enqueue custom block editor scripts from Vite build.
 */
function wp_figmakit_enqueue_block_scripts() {
	$manifest = wp_figmakit_get_manifest();

	if ( ! $manifest ) {
		return;
	}

	// Auto-enqueue block-* entries
	foreach ( $manifest as $entry => $data ) {
		if ( strpos( $entry, 'src/blocks/' ) === 0 && isset( $data['file'] ) ) {
			$block_name = basename( dirname( $entry ) );
			$handle     = 'wp-figmakit-block-' . $block_name;

			wp_enqueue_script(
				$handle,
				WP_FIGMAKIT_URI . '/dist/' . $data['file'],
				array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n', 'wp-data' ),
				WP_FIGMAKIT_VERSION,
				true
			);

			// Enqueue block CSS
			if ( isset( $data['css'] ) ) {
				foreach ( $data['css'] as $i => $css ) {
					wp_enqueue_style(
						$handle . '-css-' . $i,
						WP_FIGMAKIT_URI . '/dist/' . $css,
						array(),
						WP_FIGMAKIT_VERSION
					);
				}
			}
		}
	}
}
add_action( 'enqueue_block_editor_assets', 'wp_figmakit_enqueue_block_scripts' );

/**
 * Enqueue block frontend CSS.
 */
function wp_figmakit_enqueue_block_frontend_styles() {
	$manifest = wp_figmakit_get_manifest();

	if ( ! $manifest ) {
		return;
	}

	foreach ( $manifest as $entry => $data ) {
		if ( strpos( $entry, 'src/blocks/' ) === 0 && isset( $data['css'] ) ) {
			$block_name = basename( dirname( $entry ) );
			foreach ( $data['css'] as $i => $css ) {
				wp_enqueue_style(
					'wp-figmakit-block-' . $block_name . '-css-' . $i,
					WP_FIGMAKIT_URI . '/dist/' . $css,
					array(),
					WP_FIGMAKIT_VERSION
				);
			}
		}
	}
}
add_action( 'wp_enqueue_scripts', 'wp_figmakit_enqueue_block_frontend_styles' );

/**
 * Enqueue frontend JS for blocks that need interactivity (tabs, accordion, etc.).
 */
function wp_figmakit_enqueue_block_frontend_scripts() {
	// Only enqueue when the fk-tabs block is present on the page.
	if ( ! has_block( 'wp-figmakit/fk-tabs' ) ) {
		return;
	}

	$manifest = wp_figmakit_get_manifest();
	$src      = null;

	// Look for tabs-frontend in the Vite manifest.
	if ( $manifest ) {
		foreach ( $manifest as $entry => $data ) {
			if ( strpos( $entry, 'tabs-frontend' ) !== false && isset( $data['file'] ) ) {
				$src = WP_FIGMAKIT_URI . '/dist/' . $data['file'];
				break;
			}
		}
	}

	// Fallback: use source file directly (dev mode).
	if ( ! $src ) {
		$src = WP_FIGMAKIT_URI . '/src/blocks/tabs/tabs-frontend.js';
	}

	wp_enqueue_script(
		'wp-figmakit-tabs-frontend',
		$src,
		array(),
		WP_FIGMAKIT_VERSION,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'wp_figmakit_enqueue_block_frontend_scripts' );
