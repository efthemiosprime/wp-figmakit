<?php
/**
 * Figma design token integration with theme.json.
 *
 * Layers Figma design tokens on top of the hand-authored theme.json via the
 * wp_theme_json_data_theme filter, from (in the active theme's folder, so a
 * child theme's own files):
 *
 * - figma-tokens.json      theme.json settings written by FigmaKit's token sync
 * - src/scss/presets.json  the Foundations tokens as presets, written by FigmaKit →
 *                          Theme SCSS next to the SCSS it generates from them
 *
 * Presets (palette, font sizes, font families, spacing sizes, radius sizes) are
 * merged by slug: a token replaces the theme preset with its slug and the others
 * are added, so the theme's own presets — and content using them — keep working.
 * (theme.json itself replaces a whole preset list when a child sets one.)
 *
 * @package WP_Figmakit
 * @since   1.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'wp_theme_json_data_theme', 'wp_figmakit_merge_figma_tokens' );

/**
 * Theme.json preset lists the token files may hold (settings paths).
 */
const WP_FIGMAKIT_TOKEN_PRESETS = array(
	array( 'color', 'palette' ),
	array( 'typography', 'fontSizes' ),
	array( 'typography', 'fontFamilies' ),
	array( 'spacing', 'spacingSizes' ),
	array( 'border', 'radiusSizes' ),
);

/**
 * Merge Figma tokens into theme.json data.
 *
 * @param WP_Theme_JSON_Data $theme_json Current theme.json data object.
 * @return WP_Theme_JSON_Data Modified theme.json data.
 */
function wp_figmakit_merge_figma_tokens( $theme_json ) {
	$dir = get_stylesheet_directory();
	foreach ( array( '/figma-tokens.json', '/src/scss/presets.json' ) as $file ) {
		$figma_data = wp_figmakit_read_token_file( $dir . $file );
		if ( $figma_data ) {
			$theme_json = wp_figmakit_merge_token_data( $theme_json, $figma_data );
		}
	}
	return $theme_json;
}

/**
 * @param string $path Token file.
 * @return array|null Decoded theme.json data, or null when missing / not JSON.
 */
function wp_figmakit_read_token_file( $path ) {
	if ( ! file_exists( $path ) ) {
		return null;
	}
	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$contents = file_get_contents( $path );
	if ( empty( $contents ) ) {
		return null;
	}
	$figma_data = json_decode( $contents, true );
	return is_array( $figma_data ) ? $figma_data : null;
}

/**
 * Apply one token file: its presets merged by slug into the theme's, other settings as given.
 *
 * @param WP_Theme_JSON_Data $theme_json Theme data.
 * @param array              $figma_data theme.json-shaped data.
 * @return WP_Theme_JSON_Data
 */
function wp_figmakit_merge_token_data( $theme_json, array $figma_data ) {
	$settings = isset( $figma_data['settings'] ) && is_array( $figma_data['settings'] ) ? $figma_data['settings'] : array();
	if ( ! $settings ) {
		return $theme_json;
	}
	$current = $theme_json->get_data();
	foreach ( WP_FIGMAKIT_TOKEN_PRESETS as $path ) {
		$incoming = _wp_array_get( $settings, $path, null );
		if ( ! is_array( $incoming ) ) {
			continue;
		}
		// Theme presets are kept per origin internally.
		$existing = _wp_array_get( $current, array_merge( array( 'settings' ), $path, array( 'theme' ) ), array() );
		_wp_array_set( $settings, $path, wp_figmakit_merge_presets_by_slug( is_array( $existing ) ? $existing : array(), $incoming ) );
	}
	$data = array(
		'version'  => isset( $figma_data['version'] ) ? $figma_data['version'] : WP_Theme_JSON::LATEST_SCHEMA,
		'settings' => $settings,
	);
	if ( isset( $figma_data['styles']['typography']['fontFamily'] ) ) {
		// The site's text in the Foundations font.
		$data['styles'] = array( 'typography' => array( 'fontFamily' => (string) $figma_data['styles']['typography']['fontFamily'] ) );
	}
	return $theme_json->update_with( $data );
}

add_action( 'wp_enqueue_scripts', 'wp_figmakit_enqueue_token_fonts' );
add_action( 'enqueue_block_assets', 'wp_figmakit_enqueue_token_fonts' );

/**
 * Load the Foundations fonts (src/scss/presets.json font families) from Google Fonts, as the
 * theme loads its own — every weight, so each text style's weight renders as drawn.
 */
function wp_figmakit_enqueue_token_fonts() {
	$data = wp_figmakit_read_token_file( get_stylesheet_directory() . '/src/scss/presets.json' );
	$list = $data && isset( $data['settings']['typography']['fontFamilies'] ) ? (array) $data['settings']['typography']['fontFamilies'] : array();
	$args = array();
	foreach ( $list as $family ) {
		if ( ! empty( $family['name'] ) ) {
			$args[] = 'family=' . str_replace( ' ', '+', (string) $family['name'] ) . ':ital,wght@0,100..900;1,100..900';
		}
	}
	if ( $args ) {
		wp_enqueue_style( 'wp-figmakit-token-fonts', 'https://fonts.googleapis.com/css2?' . implode( '&', $args ) . '&display=swap', array(), null );
	}
}

/**
 * @param array[] $existing Theme presets.
 * @param array[] $incoming Token presets.
 * @return array[] The tokens first (listed first in the editor, and the preset an import
 *                 links a shared value to), then the theme's presets they do not replace.
 */
function wp_figmakit_merge_presets_by_slug( array $existing, array $incoming ) {
	$merged = array();
	$slugs  = array();
	foreach ( $incoming as $preset ) {
		if ( is_array( $preset ) && isset( $preset['slug'] ) && ! isset( $slugs[ 's' . $preset['slug'] ] ) ) {
			$slugs[ 's' . $preset['slug'] ] = true; // Prefixed: numeric slugs ("0") would become integer keys.
			$merged[]                       = $preset;
		}
	}
	foreach ( $existing as $preset ) {
		$slug = is_array( $preset ) && isset( $preset['slug'] ) ? 's' . $preset['slug'] : null;
		if ( null === $slug || ! isset( $slugs[ $slug ] ) ) {
			$merged[] = $preset;
		}
	}
	return $merged;
}
