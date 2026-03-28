<?php
/**
 * WP Figmakit — Component/Block-based theme.
 *
 * Modular loader: all functionality lives in /inc modules.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WP_FIGMAKIT_VERSION', '1.0.0' );
define( 'WP_FIGMAKIT_DIR', get_template_directory() );
define( 'WP_FIGMAKIT_URI', get_template_directory_uri() );

/**
 * Theme setup.
 */
function wp_figmakit_setup() {
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', array(
		'search-form',
		'comment-form',
		'comment-list',
		'gallery',
		'caption',
		'style',
		'script',
	) );

	add_editor_style( 'assets/css/editor.css' );
}
add_action( 'after_setup_theme', 'wp_figmakit_setup' );

/**
 * Enqueue Google Fonts.
 */
function wp_figmakit_enqueue_fonts() {
	wp_enqueue_style(
		'wp-figmakit-google-fonts',
		'https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap',
		array(),
		null
	);
}
add_action( 'wp_enqueue_scripts', 'wp_figmakit_enqueue_fonts' );
add_action( 'enqueue_block_editor_assets', 'wp_figmakit_enqueue_fonts' );

/**
 * Add theme identifier class to body.
 */
function wp_figmakit_body_class( $classes ) {
	$classes[] = 'wp-figmakit';
	return $classes;
}
add_filter( 'body_class', 'wp_figmakit_body_class' );

// Modular includes
require_once WP_FIGMAKIT_DIR . '/inc/assets.php';
require_once WP_FIGMAKIT_DIR . '/inc/blocks.php';
require_once WP_FIGMAKIT_DIR . '/inc/patterns.php';
require_once WP_FIGMAKIT_DIR . '/inc/templates.php';
require_once WP_FIGMAKIT_DIR . '/inc/block-render-combined.php';
require_once WP_FIGMAKIT_DIR . '/inc/admin.php';
require_once WP_FIGMAKIT_DIR . '/inc/grid-api.php';
require_once WP_FIGMAKIT_DIR . '/inc/colors-api.php';
require_once WP_FIGMAKIT_DIR . '/inc/policies-api.php';
require_once WP_FIGMAKIT_DIR . '/inc/security.php';
require_once WP_FIGMAKIT_DIR . '/inc/figma-tokens.php';
