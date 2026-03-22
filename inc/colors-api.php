<?php
/**
 * REST API and frontend output for color tokens.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Color token definitions.
 */
function wp_figmakit_get_color_fields() {
	return array(
		array( 'key' => 'color_primary',    'css_var' => '--fk-color-primary',    'default' => '#1a1a2e' ),
		array( 'key' => 'color_secondary',  'css_var' => '--fk-color-secondary',  'default' => '#16213e' ),
		array( 'key' => 'color_accent',     'css_var' => '--fk-color-accent',     'default' => '#0f3460' ),
		array( 'key' => 'color_highlight',  'css_var' => '--fk-color-highlight',  'default' => '#e94560' ),
		array( 'key' => 'color_text',       'css_var' => '--fk-color-text',       'default' => '#333333' ),
		array( 'key' => 'color_text_light', 'css_var' => '--fk-color-text-light', 'default' => '#666666' ),
		array( 'key' => 'color_bg',         'css_var' => '--fk-color-bg',         'default' => '#ffffff' ),
	);
}

/**
 * Register color settings REST routes.
 */
function wp_figmakit_register_colors_api() {
	register_rest_route( 'wp-figmakit/v1', '/color-settings', array(
		array(
			'methods'             => 'GET',
			'callback'            => 'wp_figmakit_get_color_settings',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		),
		array(
			'methods'             => 'POST',
			'callback'            => 'wp_figmakit_save_color_settings',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		),
	) );
}
add_action( 'rest_api_init', 'wp_figmakit_register_colors_api' );

/**
 * Get color settings.
 */
function wp_figmakit_get_color_settings() {
	$options = get_option( 'wp_figmakit_options', array() );
	$fields  = wp_figmakit_get_color_fields();
	$result  = array();

	foreach ( $fields as $field ) {
		$result[ $field['key'] ] = isset( $options[ $field['key'] ] ) ? $options[ $field['key'] ] : $field['default'];
	}

	// Include custom colors
	if ( ! empty( $options['_custom_colors'] ) ) {
		$result['_custom_colors'] = $options['_custom_colors'];
		foreach ( $options['_custom_colors'] as $custom ) {
			if ( isset( $options[ $custom['key'] ] ) ) {
				$result[ $custom['key'] ] = $options[ $custom['key'] ];
			}
		}
	}

	return rest_ensure_response( $result );
}

/**
 * Save color settings.
 */
function wp_figmakit_save_color_settings( $request ) {
	$options = get_option( 'wp_figmakit_options', array() );
	$fields  = wp_figmakit_get_color_fields();
	$params  = $request->get_json_params();

	// Save default color fields
	foreach ( $fields as $field ) {
		$key = $field['key'];
		if ( isset( $params[ $key ] ) ) {
			$color = sanitize_hex_color( $params[ $key ] );
			if ( $color ) {
				$options[ $key ] = $color;
			}
		}
	}

	// Save custom colors metadata
	if ( isset( $params['_custom_colors'] ) && is_array( $params['_custom_colors'] ) ) {
		$custom_colors = array();
		foreach ( $params['_custom_colors'] as $custom ) {
			if ( ! empty( $custom['key'] ) && ! empty( $custom['label'] ) ) {
				$custom_colors[] = array(
					'key'   => sanitize_key( $custom['key'] ),
					'label' => sanitize_text_field( $custom['label'] ),
					'cssVar' => '--fk-' . str_replace( '_', '-', sanitize_key( $custom['key'] ) ),
				);
			}
		}
		$options['_custom_colors'] = $custom_colors;

		// Save custom color values
		foreach ( $custom_colors as $custom ) {
			$key = $custom['key'];
			if ( isset( $params[ $key ] ) ) {
				$color = sanitize_hex_color( $params[ $key ] );
				if ( $color ) {
					$options[ $key ] = $color;
				}
			}
		}
	}

	update_option( 'wp_figmakit_options', $options );

	return rest_ensure_response( array( 'success' => true ) );
}

/**
 * Output color CSS custom properties on the frontend.
 */
function wp_figmakit_output_color_css() {
	$options = get_option( 'wp_figmakit_options', array() );
	$fields  = wp_figmakit_get_color_fields();
	$vars    = array();

	// Default colors
	foreach ( $fields as $field ) {
		if ( ! empty( $options[ $field['key'] ] ) ) {
			$vars[] = $field['css_var'] . ':' . $options[ $field['key'] ];
		}
	}

	// Custom colors
	if ( ! empty( $options['_custom_colors'] ) ) {
		foreach ( $options['_custom_colors'] as $custom ) {
			if ( ! empty( $options[ $custom['key'] ] ) && ! empty( $custom['cssVar'] ) ) {
				$vars[] = $custom['cssVar'] . ':' . $options[ $custom['key'] ];
			}
		}
	}

	if ( empty( $vars ) ) {
		return;
	}

	echo "<style id='fk-color-vars'>:root{" . implode( ';', $vars ) . "}</style>\n";
}
add_action( 'wp_head', 'wp_figmakit_output_color_css', 100 );
