<?php
/**
 * Security Hardening for WP Figmakit Theme.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// =========================================================================
// 1. CORS — Restrict REST API to same origin
// =========================================================================

add_action( 'init', 'wp_figmakit_disable_default_cors', 1 );
function wp_figmakit_disable_default_cors() {
	remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
}

add_filter( 'rest_pre_serve_request', 'wp_figmakit_restrict_cors', 999, 4 );
function wp_figmakit_restrict_cors( $served, $result, $request, $server ) {
	// Allow logged-in editors/admins (Gutenberg needs CORS)
	if ( is_user_logged_in() && current_user_can( 'edit_posts' ) ) {
		return $served;
	}

	if ( ! headers_sent() ) {
		header_remove( 'Access-Control-Allow-Origin' );
		header_remove( 'Access-Control-Allow-Credentials' );
		header_remove( 'Access-Control-Allow-Methods' );
		header_remove( 'Access-Control-Allow-Headers' );
	}

	$allowed_origin = home_url();
	$request_origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? $_SERVER['HTTP_ORIGIN'] : '';

	if ( ! empty( $request_origin ) && $request_origin === $allowed_origin ) {
		header( 'Access-Control-Allow-Origin: ' . $request_origin );
		header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
		header( 'Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce' );
		header( 'Access-Control-Allow-Credentials: true' );
	}

	return $served;
}

// =========================================================================
// 2. Security Headers
// =========================================================================

add_action( 'send_headers', 'wp_figmakit_security_headers', 999 );
function wp_figmakit_security_headers() {
	// Skip in admin to avoid breaking Gutenberg
	if ( is_admin() ) {
		return;
	}

	// HSTS — Force HTTPS for 1 year
	header( 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' );

	// Prevent clickjacking
	header( 'X-Frame-Options: SAMEORIGIN' );

	// Prevent MIME sniffing
	header( 'X-Content-Type-Options: nosniff' );

	// XSS protection
	header( 'X-XSS-Protection: 1; mode=block' );

	// Referrer policy
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );

	// Permissions policy
	header( 'Permissions-Policy: geolocation=(), microphone=(), camera=()' );

	// Content Security Policy — from admin settings
	if ( wp_figmakit_get_option( 'enable_csp' ) ) {
		$csp = wp_figmakit_build_csp_header();
		if ( $csp ) {
			header( 'Content-Security-Policy: ' . $csp );
		}
	}
}

// =========================================================================
// 3. Disable XML-RPC (prevents brute force attacks)
// =========================================================================

add_filter( 'xmlrpc_enabled', '__return_false' );

// =========================================================================
// 4. Remove WordPress version from headers and feeds
// =========================================================================

remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );

// =========================================================================
// 5. Disable file editing from admin (wp-config.php should also set this)
// =========================================================================

if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
	define( 'DISALLOW_FILE_EDIT', true );
}

// =========================================================================
// 6. Block access to sensitive files
// =========================================================================

add_action( 'template_redirect', 'wp_figmakit_block_sensitive_files' );
function wp_figmakit_block_sensitive_files() {
	if ( is_admin() ) {
		return;
	}

	$request_uri    = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
	$sensitive_files = array(
		'/license.txt',
		'/readme.html',
		'/readme.txt',
		'/wp-config.php',
		'/wp-config-sample.php',
		'/.htaccess',
		'/error_log',
		'/debug.log',
	);

	foreach ( $sensitive_files as $file ) {
		if ( stripos( $request_uri, $file ) !== false ) {
			status_header( 403 );
			die( 'Access denied' );
		}
	}
}

// =========================================================================
// 7. Sanitize comment input to prevent XSS
// =========================================================================

add_filter( 'preprocess_comment', 'wp_figmakit_sanitize_comment' );
function wp_figmakit_sanitize_comment( $commentdata ) {
	$commentdata['comment_author']       = sanitize_text_field( $commentdata['comment_author'] );
	$commentdata['comment_author_email'] = sanitize_email( $commentdata['comment_author_email'] );
	$commentdata['comment_author_url']   = esc_url_raw( $commentdata['comment_author_url'] );
	$commentdata['comment_content']      = wp_kses_post( $commentdata['comment_content'] );

	return $commentdata;
}

// =========================================================================
// 8. Secure cookies — HttpOnly, Secure, SameSite
// =========================================================================

add_action( 'set_auth_cookie', 'wp_figmakit_secure_auth_cookie', 10, 5 );
function wp_figmakit_secure_auth_cookie( $auth_cookie, $expire, $expiration, $user_id, $scheme ) {
	if ( PHP_VERSION_ID < 70300 ) {
		return;
	}

	$secure   = is_ssl();
	$httponly  = true;
	$samesite = 'Lax';

	setcookie(
		( 'secure_auth' === $scheme ? SECURE_AUTH_COOKIE : AUTH_COOKIE ),
		$auth_cookie,
		array(
			'expires'  => $expire,
			'path'     => COOKIEPATH,
			'domain'   => COOKIE_DOMAIN,
			'secure'   => $secure,
			'httponly'  => $httponly,
			'samesite' => $samesite,
		)
	);
}

// =========================================================================
// 9. Disable REST API user enumeration for non-logged-in users
// =========================================================================

add_filter( 'rest_endpoints', 'wp_figmakit_disable_user_endpoints' );
function wp_figmakit_disable_user_endpoints( $endpoints ) {
	if ( ! is_user_logged_in() ) {
		if ( isset( $endpoints['/wp/v2/users'] ) ) {
			unset( $endpoints['/wp/v2/users'] );
		}
		if ( isset( $endpoints['/wp/v2/users/(?P<id>[\d]+)'] ) ) {
			unset( $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
		}
	}

	return $endpoints;
}

// =========================================================================
// 10. Disable author archive user enumeration
// =========================================================================

add_action( 'template_redirect', 'wp_figmakit_disable_author_enum' );
function wp_figmakit_disable_author_enum() {
	if ( ! is_admin() && isset( $_GET['author'] ) && ! is_user_logged_in() ) {
		wp_safe_redirect( home_url(), 301 );
		exit;
	}
}
