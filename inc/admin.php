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

	// Grid fields — validate CSS values
	$grid_fields = wp_figmakit_get_grid_fields();
	foreach ( $grid_fields as $field ) {
		$key = $field['key'];
		if ( isset( $input[ $key ] ) && ! empty( $input[ $key ] ) ) {
			$val = wp_strip_all_tags( $input[ $key ] );
			if ( preg_match( '/^[\d.]+(px|em|rem|%|vw)$/', $val ) ) {
				$sanitized[ $key ] = $val;
			} else {
				$sanitized[ $key ] = $field['default'];
			}
		} else {
			$sanitized[ $key ] = $field['default'];
		}
	}

	// CSP toggle
	$sanitized['enable_csp'] = ! empty( $input['enable_csp'] ) ? 1 : 0;

	// CSP directive fields — sanitize as plain text (no HTML)
	$csp_directives = wp_figmakit_get_csp_directives();
	foreach ( array_keys( $csp_directives ) as $directive ) {
		$key = 'csp_' . $directive;
		$sanitized[ $key ] = isset( $input[ $key ] ) ? sanitize_text_field( $input[ $key ] ) : '';
	}

	return $sanitized;
}

/**
 * Get CSP directive definitions with defaults and descriptions.
 */
function wp_figmakit_get_csp_directives() {
	return array(
		'default-src' => array(
			'default'     => "'self'",
			'description' => 'Fallback for all resource types not explicitly defined.',
		),
		'script-src' => array(
			'default'     => "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net https://cdn.cookielaw.org https://geolocation.onetrust.com https://connect.facebook.net https://bat.bing.com https://www.clarity.ms https://scripts.clarity.ms https://q.clarity.ms https://cdnjs.cloudflare.com https://code.jquery.com",
			'description' => 'Sources allowed to load JavaScript. Includes GA, GTM, OneTrust, Facebook, Bing, Clarity, Cloudflare.',
		),
		'style-src' => array(
			'default'     => "'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.cookielaw.org",
			'description' => 'Sources allowed to load CSS stylesheets.',
		),
		'font-src' => array(
			'default'     => "'self' data: https://fonts.gstatic.com",
			'description' => 'Sources allowed to load fonts.',
		),
		'img-src' => array(
			'default'     => "'self' data: https: http:",
			'description' => 'Sources allowed to load images. Allows all HTTPS/HTTP for tracking pixels.',
		),
		'connect-src' => array(
			'default'     => "'self' https://www.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://cdn.cookielaw.org https://geolocation.onetrust.com https://privacyportal.onetrust.com https://connect.facebook.net https://www.facebook.com https://bat.bing.com https://www.clarity.ms https://scripts.clarity.ms https://q.clarity.ms https://h.clarity.ms https://cdnjs.cloudflare.com",
			'description' => 'Sources allowed for fetch, XHR, WebSocket connections.',
		),
		'frame-src' => array(
			'default'     => "'self' https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net https://cdn.cookielaw.org https://geolocation.onetrust.com https://bat.bing.com https://www.clarity.ms https://scripts.clarity.ms https://q.clarity.ms",
			'description' => 'Sources allowed to be embedded in iframes.',
		),
		'media-src' => array(
			'default'     => "'self' data: https:",
			'description' => 'Sources allowed to load audio/video.',
		),
		'worker-src' => array(
			'default'     => "'self' blob:",
			'description' => 'Sources allowed for Web Workers and Service Workers.',
		),
		'child-src' => array(
			'default'     => "'self' blob:",
			'description' => 'Sources allowed for web workers and nested browsing contexts.',
		),
		'frame-ancestors' => array(
			'default'     => "'self'",
			'description' => 'Who can embed this site in an iframe. Prevents clickjacking.',
		),
		'base-uri' => array(
			'default'     => "'self'",
			'description' => 'Restricts URLs that can be used in the <base> element.',
		),
		'form-action' => array(
			'default'     => "'self'",
			'description' => 'Restricts URLs that forms can submit to.',
		),
	);
}

/**
 * Build the full CSP header string from defaults + overrides.
 */
function wp_figmakit_build_csp_header() {
	$directives = wp_figmakit_get_csp_directives();
	$parts      = array();

	foreach ( $directives as $directive => $info ) {
		$custom = wp_figmakit_get_option( 'csp_' . $directive, '' );
		$value  = ! empty( $custom ) ? $custom : $info['default'];
		$parts[] = $directive . ' ' . $value;
	}

	return implode( '; ', $parts );
}

/**
 * Get grid field definitions with defaults.
 */
function wp_figmakit_get_grid_fields() {
	return array(
		array(
			'key'         => 'grid_container_max',
			'label'       => __( 'Container Max Width', 'wp-figmakit' ),
			'default'     => '1440px',
			'description' => 'Maximum width of the .fk-container element.',
		),
		array(
			'key'         => 'grid_container_padding',
			'label'       => __( 'Container Padding (Desktop)', 'wp-figmakit' ),
			'default'     => '160px',
			'description' => 'Left/right padding inside the container on desktop.',
		),
		array(
			'key'         => 'grid_container_padding_tablet',
			'label'       => __( 'Container Padding (Tablet)', 'wp-figmakit' ),
			'default'     => '32px',
			'description' => 'Left/right padding inside the container on tablet.',
		),
		array(
			'key'         => 'grid_container_padding_mobile',
			'label'       => __( 'Container Padding (Mobile)', 'wp-figmakit' ),
			'default'     => '24px',
			'description' => 'Left/right padding inside the container on mobile.',
		),
		array(
			'key'         => 'grid_gutter',
			'label'       => __( 'Column Gutter (Desktop)', 'wp-figmakit' ),
			'default'     => '24px',
			'description' => 'Space between columns.',
		),
		array(
			'key'         => 'grid_gutter_mobile',
			'label'       => __( 'Column Gutter (Mobile)', 'wp-figmakit' ),
			'default'     => '16px',
			'description' => 'Space between columns on mobile.',
		),
	);
}

/**
 * Output grid CSS custom properties from admin settings.
 */
function wp_figmakit_output_grid_css() {
	$container_max     = wp_figmakit_get_option( 'grid_container_max', '1440px' );
	$container_padding = wp_figmakit_get_option( 'grid_container_padding', '160px' );
	$container_tablet  = wp_figmakit_get_option( 'grid_container_padding_tablet', '32px' );
	$container_mobile  = wp_figmakit_get_option( 'grid_container_padding_mobile', '24px' );
	$gutter            = wp_figmakit_get_option( 'grid_gutter', '24px' );
	$gutter_mobile     = wp_figmakit_get_option( 'grid_gutter_mobile', '16px' );

	$css = ":root{";
	$css .= "--fk-container-max:{$container_max};";
	$css .= "--fk-container-padding:{$container_padding};";
	$css .= "--fk-gutter:{$gutter};";
	$css .= "}";
	$css .= "@media(max-width:980px){:root{--fk-container-padding:{$container_tablet};}}";
	$css .= "@media(max-width:767px){:root{--fk-container-padding:{$container_mobile};--fk-gutter:{$gutter_mobile};}}";

	echo "<style id='fk-grid-vars'>{$css}</style>\n";
}
add_action( 'wp_head', 'wp_figmakit_output_grid_css', 5 );

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

			<div class="fk-admin__section">
				<h2 class="fk-admin__section-title"><?php esc_html_e( 'Grid Settings', 'wp-figmakit' ); ?></h2>
				<p class="description" style="margin-bottom: 16px;">
					<?php esc_html_e( 'Configure the grid system. Values are used as CSS custom properties and update the grid utility classes.', 'wp-figmakit' ); ?>
				</p>

				<?php
				$grid_fields = wp_figmakit_get_grid_fields();
				?>
				<div class="fk-admin__grid-settings">
					<?php foreach ( $grid_fields as $field ) : ?>
					<div class="fk-admin__field">
						<label for="fk-<?php echo esc_attr( $field['key'] ); ?>">
							<?php echo esc_html( $field['label'] ); ?>
						</label>
						<input
							type="text"
							id="fk-<?php echo esc_attr( $field['key'] ); ?>"
							name="wp_figmakit_options[<?php echo esc_attr( $field['key'] ); ?>]"
							value="<?php echo esc_attr( wp_figmakit_get_option( $field['key'], $field['default'] ) ); ?>"
							placeholder="<?php echo esc_attr( $field['default'] ); ?>"
							class="fk-admin__input"
						/>
						<p class="description"><?php echo esc_html( $field['description'] ); ?> <strong><?php esc_html_e( 'Default:', 'wp-figmakit' ); ?></strong> <code><?php echo esc_html( $field['default'] ); ?></code></p>
					</div>
					<?php endforeach; ?>
				</div>
			</div>

			<div class="fk-admin__section">
				<h2 class="fk-admin__section-title"><?php esc_html_e( 'Content Security Policy (CSP)', 'wp-figmakit' ); ?></h2>

				<label class="fk-admin__toggle" style="margin-bottom: 16px;">
					<input type="checkbox" name="wp_figmakit_options[enable_csp]" value="1"
						<?php checked( wp_figmakit_get_option( 'enable_csp' ), 1 ); ?> />
					<span><?php esc_html_e( 'Enable Content Security Policy', 'wp-figmakit' ); ?></span>
				</label>

				<p class="description" style="margin-bottom: 16px;">
					<?php esc_html_e( 'Configure which external sources are allowed to load scripts, styles, fonts, and other resources. Each directive accepts a space-separated list of sources. Leave empty to use the default.', 'wp-figmakit' ); ?>
				</p>

				<?php
				$csp_directives = wp_figmakit_get_csp_directives();
				foreach ( $csp_directives as $directive => $info ) :
				?>
				<div class="fk-admin__code-block">
					<h3><?php echo esc_html( $directive ); ?></h3>
					<p class="description">
						<?php echo esc_html( $info['description'] ); ?>
						<br />
						<strong><?php esc_html_e( 'Default:', 'wp-figmakit' ); ?></strong>
						<code><?php echo esc_html( $info['default'] ); ?></code>
					</p>
					<textarea name="wp_figmakit_options[csp_<?php echo esc_attr( $directive ); ?>]" rows="3" class="fk-admin__textarea fk-admin__textarea--sm"><?php echo esc_textarea( wp_figmakit_get_option( 'csp_' . $directive, '' ) ); ?></textarea>
				</div>
				<?php endforeach; ?>
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
