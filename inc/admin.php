<?php
/**
 * WP Figmakit Theme Options Admin Page.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register theme options page.
 */
function wp_figmakit_admin_menu() {
	add_theme_page(
		__( 'WP Figmakit Options', 'wp-figmakit' ),
		__( 'Figmakit Options', 'wp-figmakit' ),
		'manage_options',
		'wp-figmakit-options',
		'wp_figmakit_options_page'
	);
}
add_action( 'admin_menu', 'wp_figmakit_admin_menu' );

/**
 * Register settings.
 */
function wp_figmakit_register_settings() {
	register_setting( 'wp_figmakit_options', 'wp_figmakit_options', array(
		'sanitize_callback' => 'wp_figmakit_sanitize_options',
	) );
}
add_action( 'admin_init', 'wp_figmakit_register_settings' );

/**
 * Sanitize options. Allow scripts/styles in code fields for admins.
 */
function wp_figmakit_sanitize_options( $input ) {
	$sanitized = array();

	// Toggle fields
	$toggles = array(
		'enable_head_code',
		'enable_body_code',
		'enable_post_top_code',
		'enable_post_bottom_code',
	);

	foreach ( $toggles as $toggle ) {
		$sanitized[ $toggle ] = ! empty( $input[ $toggle ] ) ? 1 : 0;
	}

	// Code fields — only allow unfiltered HTML for users with capability
	$code_fields = array(
		'head_code',
		'body_code',
		'post_top_code',
		'post_bottom_code',
	);

	foreach ( $code_fields as $field ) {
		if ( ! isset( $input[ $field ] ) ) {
			$sanitized[ $field ] = '';
			continue;
		}

		if ( current_user_can( 'unfiltered_html' ) ) {
			$sanitized[ $field ] = $input[ $field ];
		} else {
			$sanitized[ $field ] = wp_kses_post( $input[ $field ] );
		}
	}

	return $sanitized;
}

/**
 * Get theme option.
 */
function wp_figmakit_get_option( $key, $default = '' ) {
	$options = get_option( 'wp_figmakit_options', array() );
	return isset( $options[ $key ] ) ? $options[ $key ] : $default;
}

/**
 * Enqueue admin styles.
 */
function wp_figmakit_admin_styles( $hook ) {
	if ( 'appearance_page_wp-figmakit-options' !== $hook ) {
		return;
	}

	wp_enqueue_style(
		'wp-figmakit-admin',
		WP_FIGMAKIT_URI . '/assets/css/admin.css',
		array(),
		WP_FIGMAKIT_VERSION
	);
}
add_action( 'admin_enqueue_scripts', 'wp_figmakit_admin_styles' );

/**
 * Render options page.
 */
function wp_figmakit_options_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap fk-admin">
		<h1 class="fk-admin__title"><?php esc_html_e( 'WP Figmakit Options', 'wp-figmakit' ); ?></h1>

		<form method="post" action="options.php">
			<?php settings_fields( 'wp_figmakit_options' ); ?>

			<div class="fk-admin__section">
				<h2 class="fk-admin__section-title"><?php esc_html_e( 'Code Integration', 'wp-figmakit' ); ?></h2>

				<div class="fk-admin__toggles">
					<label class="fk-admin__toggle">
						<input type="checkbox" name="wp_figmakit_options[enable_head_code]" value="1"
							<?php checked( wp_figmakit_get_option( 'enable_head_code' ), 1 ); ?> />
						<span><?php esc_html_e( 'Enable Header Code', 'wp-figmakit' ); ?></span>
					</label>

					<label class="fk-admin__toggle">
						<input type="checkbox" name="wp_figmakit_options[enable_body_code]" value="1"
							<?php checked( wp_figmakit_get_option( 'enable_body_code' ), 1 ); ?> />
						<span><?php esc_html_e( 'Enable Body Code', 'wp-figmakit' ); ?></span>
					</label>

					<label class="fk-admin__toggle">
						<input type="checkbox" name="wp_figmakit_options[enable_post_top_code]" value="1"
							<?php checked( wp_figmakit_get_option( 'enable_post_top_code' ), 1 ); ?> />
						<span><?php esc_html_e( 'Enable Single Post Top Code', 'wp-figmakit' ); ?></span>
					</label>

					<label class="fk-admin__toggle">
						<input type="checkbox" name="wp_figmakit_options[enable_post_bottom_code]" value="1"
							<?php checked( wp_figmakit_get_option( 'enable_post_bottom_code' ), 1 ); ?> />
						<span><?php esc_html_e( 'Enable Single Post Bottom Code', 'wp-figmakit' ); ?></span>
					</label>
				</div>
			</div>

			<div class="fk-admin__section">
				<div class="fk-admin__code-block">
					<h3><?php esc_html_e( 'Add Code To The <head> Of Your Blog', 'wp-figmakit' ); ?></h3>
					<p class="description"><?php esc_html_e( 'Add tracking codes, meta tags, or custom CSS/JS to the head section.', 'wp-figmakit' ); ?></p>
					<textarea name="wp_figmakit_options[head_code]" rows="8" class="fk-admin__textarea"><?php echo esc_textarea( wp_figmakit_get_option( 'head_code' ) ); ?></textarea>
				</div>

				<div class="fk-admin__code-block">
					<h3><?php esc_html_e( 'Add Code To The <body>', 'wp-figmakit' ); ?></h3>
					<p class="description"><?php esc_html_e( 'Good for tracking codes such as Google Analytics or Tag Manager.', 'wp-figmakit' ); ?></p>
					<textarea name="wp_figmakit_options[body_code]" rows="8" class="fk-admin__textarea"><?php echo esc_textarea( wp_figmakit_get_option( 'body_code' ) ); ?></textarea>
				</div>

				<div class="fk-admin__code-block">
					<h3><?php esc_html_e( 'Add Code To The Top Of Your Posts', 'wp-figmakit' ); ?></h3>
					<p class="description"><?php esc_html_e( 'Code will be output at the top of single post content.', 'wp-figmakit' ); ?></p>
					<textarea name="wp_figmakit_options[post_top_code]" rows="8" class="fk-admin__textarea"><?php echo esc_textarea( wp_figmakit_get_option( 'post_top_code' ) ); ?></textarea>
				</div>

				<div class="fk-admin__code-block">
					<h3><?php esc_html_e( 'Add Code To The Bottom Of Your Posts, Before The Comments', 'wp-figmakit' ); ?></h3>
					<p class="description"><?php esc_html_e( 'Code will be output at the bottom of single post content.', 'wp-figmakit' ); ?></p>
					<textarea name="wp_figmakit_options[post_bottom_code]" rows="8" class="fk-admin__textarea"><?php echo esc_textarea( wp_figmakit_get_option( 'post_bottom_code' ) ); ?></textarea>
				</div>
			</div>

			<?php submit_button( __( 'Save Changes', 'wp-figmakit' ) ); ?>
		</form>
	</div>
	<?php
}

/**
 * Output head code.
 */
function wp_figmakit_output_head_code() {
	if ( wp_figmakit_get_option( 'enable_head_code' ) ) {
		$code = wp_figmakit_get_option( 'head_code' );
		if ( $code ) {
			echo "\n" . $code . "\n";
		}
	}
}
add_action( 'wp_head', 'wp_figmakit_output_head_code', 99 );

/**
 * Output body code.
 */
function wp_figmakit_output_body_code() {
	if ( wp_figmakit_get_option( 'enable_body_code' ) ) {
		$code = wp_figmakit_get_option( 'body_code' );
		if ( $code ) {
			echo "\n" . $code . "\n";
		}
	}
}
add_action( 'wp_body_open', 'wp_figmakit_output_body_code' );

/**
 * Output post top/bottom code.
 */
function wp_figmakit_output_post_code( $content ) {
	if ( ! is_single() ) {
		return $content;
	}

	$top    = '';
	$bottom = '';

	if ( wp_figmakit_get_option( 'enable_post_top_code' ) ) {
		$code = wp_figmakit_get_option( 'post_top_code' );
		if ( $code ) {
			$top = "\n" . $code . "\n";
		}
	}

	if ( wp_figmakit_get_option( 'enable_post_bottom_code' ) ) {
		$code = wp_figmakit_get_option( 'post_bottom_code' );
		if ( $code ) {
			$bottom = "\n" . $code . "\n";
		}
	}

	return $top . $content . $bottom;
}
add_filter( 'the_content', 'wp_figmakit_output_post_code', 99 );
