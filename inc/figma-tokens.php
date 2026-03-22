<?php
/**
 * Figma design token integration with theme.json.
 *
 * Loads figma-tokens.json (if present) via the
 * wp_theme_json_data_theme filter to layer Figma design tokens
 * on top of the hand-authored theme.json.
 *
 * @package WP_Figmakit
 * @since   1.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'wp_theme_json_data_theme', 'wp_figmakit_merge_figma_tokens' );

/**
 * Merge Figma tokens into theme.json data.
 *
 * @param WP_Theme_JSON_Data $theme_json Current theme.json data object.
 * @return WP_Theme_JSON_Data Modified theme.json data.
 */
function wp_figmakit_merge_figma_tokens( $theme_json ) {
	$tokens_file = get_stylesheet_directory() . '/figma-tokens.json';

	if ( ! file_exists( $tokens_file ) ) {
		return $theme_json;
	}

	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$contents = file_get_contents( $tokens_file );
	if ( empty( $contents ) ) {
		return $theme_json;
	}

	$figma_data = json_decode( $contents, true );
	if ( ! is_array( $figma_data ) ) {
		return $theme_json;
	}

	$theme_json->update_with( $figma_data );

	return $theme_json;
}
