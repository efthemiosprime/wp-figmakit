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
	$editor_deps = array(
		'wp-blocks',
		'wp-dom-ready',
		'wp-edit-post',
		'wp-plugins',
		'wp-editor',
		'wp-data',
		'wp-block-editor',
		'wp-components',
		'wp-i18n',
		'wp-element',
	);

	if ( wp_figmakit_is_vite_dev() ) {
		wp_enqueue_script(
			'wp-figmakit-vite-client',
			'http://localhost:5173/@vite/client',
			array(),
			null,
			false
		);

		wp_enqueue_script(
			'wp-figmakit-editor',
			'http://localhost:5173/src/editor.js',
			$editor_deps,
			null,
			true
		);
		return;
	}

	$editor_entry = 'src/editor.js';
	$manifest = wp_figmakit_get_manifest();

	if ( $manifest && isset( $manifest[ $editor_entry ] ) ) {
		wp_enqueue_script(
			'wp-figmakit-editor',
			WP_FIGMAKIT_URI . '/dist/' . $manifest[ $editor_entry ]['file'],
			$editor_deps,
			WP_FIGMAKIT_VERSION,
			true
		);

		if ( isset( $manifest[ $editor_entry ]['css'] ) ) {
			foreach ( $manifest[ $editor_entry ]['css'] as $i => $css ) {
				// Enqueue in admin page
				wp_enqueue_style(
					'wp-figmakit-editor-css-' . $i,
					WP_FIGMAKIT_URI . '/dist/' . $css,
					array(),
					WP_FIGMAKIT_VERSION
				);
			}
		}

	}
}
add_action( 'enqueue_block_editor_assets', 'wp_figmakit_enqueue_editor_assets' );

/**
 * Inject editor CSS into the block editor iframe.
 */
function wp_figmakit_editor_iframe_styles( $editor_settings ) {
	$manifest = wp_figmakit_get_manifest();
	if ( $manifest ) {
		// Inject editor CSS
		$editor_entry = 'src/editor.js';
		if ( isset( $manifest[ $editor_entry ]['css'][0] ) ) {
			$css_url = WP_FIGMAKIT_URI . '/dist/' . $manifest[ $editor_entry ]['css'][0];
			$editor_settings['styles'][] = array( 'css' => '@import url("' . $css_url . '");' );
		}

		// Inject all block CSS files into the iframe
		foreach ( $manifest as $entry => $data ) {
			if ( strpos( $entry, 'src/blocks/' ) === 0 && isset( $data['css'] ) ) {
				foreach ( $data['css'] as $css ) {
					$css_url = WP_FIGMAKIT_URI . '/dist/' . $css;
					$editor_settings['styles'][] = array( 'css' => '@import url("' . $css_url . '");' );
				}
			}
		}
	}
	return $editor_settings;
}
add_filter( 'block_editor_settings_all', 'wp_figmakit_editor_iframe_styles' );

/**
 * Add type="module" to Vite scripts.
 */
function wp_figmakit_script_module_type( $tag, $handle ) {
	if ( strpos( $handle, 'wp-figmakit' ) === 0 ) {
		$tag = str_replace( '<script ', '<script type="module" ', $tag );
	}

	return $tag;
}
add_filter( 'script_loader_tag', 'wp_figmakit_script_module_type', 10, 2 );
