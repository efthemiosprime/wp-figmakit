<?php
/**
 * REST API endpoint for grid settings.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register grid settings REST route.
 */
function wp_figmakit_register_grid_api() {
	register_rest_route( 'wp-figmakit/v1', '/grid-settings', array(
		'methods'             => 'POST',
		'callback'            => 'wp_figmakit_save_grid_settings',
		'permission_callback' => function () {
			return current_user_can( 'manage_options' );
		},
	) );

	register_rest_route( 'wp-figmakit/v1', '/grid-settings', array(
		'methods'             => 'GET',
		'callback'            => 'wp_figmakit_get_grid_settings',
		'permission_callback' => function () {
			return current_user_can( 'edit_posts' );
		},
	) );
}
add_action( 'rest_api_init', 'wp_figmakit_register_grid_api' );

/**
 * Get grid settings.
 */
function wp_figmakit_get_grid_settings() {
	$options = get_option( 'wp_figmakit_options', array() );
	$fields  = wp_figmakit_get_grid_fields();
	$result  = array();

	foreach ( $fields as $field ) {
		$result[ $field['key'] ] = isset( $options[ $field['key'] ] ) ? $options[ $field['key'] ] : $field['default'];
	}

	return rest_ensure_response( $result );
}

/**
 * Save grid settings.
 */
function wp_figmakit_save_grid_settings( $request ) {
	$fields = wp_figmakit_get_grid_fields();
	$params = $request->get_json_params();

	// Atomic read-modify-write with transient lock.
	$lock_key = 'wp_figmakit_options_lock';
	if ( ! get_transient( $lock_key ) ) {
		set_transient( $lock_key, 1, 5 );
	}

	$options = get_option( 'wp_figmakit_options', array() );

	foreach ( $fields as $field ) {
		$key = $field['key'];
		if ( isset( $params[ $key ] ) && ! empty( $params[ $key ] ) ) {
			$val = wp_strip_all_tags( $params[ $key ] );
			if ( preg_match( '/^[\d.]+(px|em|rem|%|vw)$/', $val ) ) {
				$options[ $key ] = $val;
			}
		}
	}

	update_option( 'wp_figmakit_options', $options );
	delete_transient( $lock_key );

	return rest_ensure_response( array( 'success' => true ) );
}
