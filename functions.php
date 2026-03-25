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

// Modular includes
require_once WP_FIGMAKIT_DIR . '/inc/assets.php';
require_once WP_FIGMAKIT_DIR . '/inc/blocks.php';
require_once WP_FIGMAKIT_DIR . '/inc/patterns.php';
require_once WP_FIGMAKIT_DIR . '/inc/templates.php';
require_once WP_FIGMAKIT_DIR . '/inc/block-attributes.php';
require_once WP_FIGMAKIT_DIR . '/inc/responsive-visibility.php';
require_once WP_FIGMAKIT_DIR . '/inc/button-icons.php';
require_once WP_FIGMAKIT_DIR . '/inc/button-variant.php';
require_once WP_FIGMAKIT_DIR . '/inc/block-spacing.php';
require_once WP_FIGMAKIT_DIR . '/inc/block-layout.php';
require_once WP_FIGMAKIT_DIR . '/inc/block-sizing.php';
require_once WP_FIGMAKIT_DIR . '/inc/block-text-style.php';
require_once WP_FIGMAKIT_DIR . '/inc/admin.php';
require_once WP_FIGMAKIT_DIR . '/inc/grid-api.php';
require_once WP_FIGMAKIT_DIR . '/inc/colors-api.php';
require_once WP_FIGMAKIT_DIR . '/inc/policies-api.php';
require_once WP_FIGMAKIT_DIR . '/inc/block-policies.php';
require_once WP_FIGMAKIT_DIR . '/inc/block-render-combined.php';
require_once WP_FIGMAKIT_DIR . '/inc/security.php';
require_once WP_FIGMAKIT_DIR . '/inc/figma-tokens.php';
