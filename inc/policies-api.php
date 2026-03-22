<?php
/**
 * REST API for block policies (style class system).
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register policies REST routes.
 */
function wp_figmakit_register_policies_api() {
	register_rest_route( 'wp-figmakit/v1', '/policies', array(
		array(
			'methods'             => 'GET',
			'callback'            => 'wp_figmakit_get_policies',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		),
		array(
			'methods'             => 'POST',
			'callback'            => 'wp_figmakit_save_policies',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		),
	) );
}
add_action( 'rest_api_init', 'wp_figmakit_register_policies_api' );

/**
 * Get policies.
 */
function wp_figmakit_get_policies() {
	$options  = get_option( 'wp_figmakit_options', array() );
	$policies = isset( $options['policies'] ) ? $options['policies'] : array();

	return rest_ensure_response( $policies );
}

/**
 * Save policies.
 */
function wp_figmakit_save_policies( $request ) {
	$options = get_option( 'wp_figmakit_options', array() );
	$params  = $request->get_json_params();

	$sanitized = array();

	if ( is_array( $params ) ) {
		foreach ( $params as $block_type => $classes ) {
			$block_key = sanitize_text_field( $block_type );
			$sanitized[ $block_key ] = array();

			if ( is_array( $classes ) ) {
				foreach ( $classes as $entry ) {
					if ( ! empty( $entry['label'] ) && ! empty( $entry['class'] ) ) {
						$sanitized[ $block_key ][] = array(
							'label' => sanitize_text_field( $entry['label'] ),
							'class' => sanitize_html_class( $entry['class'] ),
						);
					}
				}
			}
		}
	}

	$options['policies'] = $sanitized;
	update_option( 'wp_figmakit_options', $options );

	return rest_ensure_response( array( 'success' => true ) );
}
