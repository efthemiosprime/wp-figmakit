<?php
/**
 * Optional classic template support.
 *
 * Provides PHP template fallbacks for environments that need them.
 * The block templates in /templates take priority — these are loaded
 * only when classic rendering is explicitly needed.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register navigation menus (used by both block and classic templates).
 */
function wp_figmakit_register_menus() {
	register_nav_menus( array(
		'primary'  => __( 'Primary Menu', 'wp-figmakit' ),
		'footer'   => __( 'Footer Menu', 'wp-figmakit' ),
	) );
}
add_action( 'after_setup_theme', 'wp_figmakit_register_menus' );

/**
 * Register widget areas (for classic template fallback).
 */
function wp_figmakit_widgets_init() {
	register_sidebar( array(
		'name'          => __( 'Sidebar', 'wp-figmakit' ),
		'id'            => 'sidebar-1',
		'before_widget' => '<section id="%1$s" class="widget %2$s">',
		'after_widget'  => '</section>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	) );
}
add_action( 'widgets_init', 'wp_figmakit_widgets_init' );
