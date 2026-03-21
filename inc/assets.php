<?php
/**
 * Asset loading with Vite integration.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Check if Vite dev server is running.
 */
function wp_figmakit_is_vite_dev() {
	return ! file_exists( WP_FIGMAKIT_DIR . '/dist/.vite/manifest.json' );
}

/**
 * Get the Vite manifest.
 */
function wp_figmakit_get_manifest() {
	static $manifest = null;

	if ( $manifest === null ) {
		$manifest_path = WP_FIGMAKIT_DIR . '/dist/.vite/manifest.json';
		if ( file_exists( $manifest_path ) ) {
			$manifest = json_decode( file_get_contents( $manifest_path ), true );
		}
	}

	return $manifest;
}

/**
 * Enqueue a Vite entry point.
 */
function wp_figmakit_enqueue_entry( $entry, $handle ) {
	if ( wp_figmakit_is_vite_dev() ) {
		wp_enqueue_script(
			'wp-figmakit-vite-client',
			'http://localhost:5173/@vite/client',
			array(),
			null,
			false
		);

		wp_enqueue_script(
			$handle,
			'http://localhost:5173/' . $entry,
			array(),
			null,
			true
		);
		return;
	}

	$manifest = wp_figmakit_get_manifest();
	if ( ! $manifest || ! isset( $manifest[ $entry ] ) ) {
		return;
	}

	$data = $manifest[ $entry ];

	wp_enqueue_script(
		$handle,
		WP_FIGMAKIT_URI . '/dist/' . $data['file'],
		array(),
		WP_FIGMAKIT_VERSION,
		true
	);

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

/**
 * Enqueue frontend assets.
 */
function wp_figmakit_enqueue_assets() {
	wp_figmakit_enqueue_entry( 'src/main.js', 'wp-figmakit-main' );
}
add_action( 'wp_enqueue_scripts', 'wp_figmakit_enqueue_assets' );

/**
 * Enqueue editor assets.
 */
function wp_figmakit_enqueue_editor_assets() {
	$editor_entry = 'src/editor.js';
	$manifest = wp_figmakit_get_manifest();

	if ( $manifest && isset( $manifest[ $editor_entry ] ) ) {
		wp_enqueue_script(
			'wp-figmakit-editor',
			WP_FIGMAKIT_URI . '/dist/' . $manifest[ $editor_entry ]['file'],
			array( 'wp-blocks', 'wp-dom-ready', 'wp-edit-post' ),
			WP_FIGMAKIT_VERSION,
			true
		);
	}
}
add_action( 'enqueue_block_editor_assets', 'wp_figmakit_enqueue_editor_assets' );

/**
 * Add type="module" to Vite scripts.
 */
function wp_figmakit_script_module_type( $tag, $handle ) {
	$module_handles = array( 'wp-figmakit-vite-client', 'wp-figmakit-main' );

	if ( in_array( $handle, $module_handles, true ) ) {
		$tag = str_replace( '<script ', '<script type="module" ', $tag );
	}

	return $tag;
}
add_filter( 'script_loader_tag', 'wp_figmakit_script_module_type', 10, 2 );
