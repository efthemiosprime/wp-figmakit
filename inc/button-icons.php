<?php
/**
 * Render button icons on the frontend.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Inject icon span into core/button block output.
 */
function wp_figmakit_render_button_icon( $block_content, $block ) {
	if ( $block['blockName'] !== 'core/button' ) {
		return $block_content;
	}

	if ( empty( $block['attrs']['fkButtonIcon'] ) ) {
		return $block_content;
	}

	$icon     = sanitize_html_class( $block['attrs']['fkButtonIcon'] );
	$position = isset( $block['attrs']['fkButtonIconPosition'] )
		? sanitize_html_class( $block['attrs']['fkButtonIconPosition'] )
		: 'before';

	$icon_html = '<span class="fk-btn-icon dashicons dashicons-' . $icon . '" aria-hidden="true"></span>';

	// Inject icon inside the <a> tag
	if ( $position === 'before' ) {
		$block_content = preg_replace(
			'/(<a\b[^>]*>)/',
			'$1' . $icon_html,
			$block_content,
			1
		);
	} else {
		$block_content = preg_replace(
			'/(<\/a>)/',
			$icon_html . '$1',
			$block_content,
			1
		);
	}

	// Add wrapper classes
	$dom = new WP_HTML_Tag_Processor( $block_content );
	if ( $dom->next_tag() ) {
		$dom->add_class( 'fk-has-button-icon' );
		$dom->add_class( 'fk-icon-position-' . $position );
	}

	return $dom->get_updated_html();
}
add_filter( 'render_block', 'wp_figmakit_render_button_icon', 10, 2 );

/**
 * Enqueue Dashicons on the frontend for button icons.
 */
function wp_figmakit_enqueue_dashicons() {
	wp_enqueue_style( 'dashicons' );
}
add_action( 'wp_enqueue_scripts', 'wp_figmakit_enqueue_dashicons' );
