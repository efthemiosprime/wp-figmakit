<?php
/**
 * Modal block server-side render.
 *
 * @package WP_Figmakit
 */

$modal_id       = ! empty( $attributes['modalId'] ) ? sanitize_html_class( $attributes['modalId'] ) : 'fk-modal-' . wp_unique_id();
$variant        = isset( $attributes['variant'] ) ? sanitize_html_class( $attributes['variant'] ) : 'hash';
$max_width      = isset( $attributes['maxWidth'] ) ? esc_attr( $attributes['maxWidth'] ) : '640px';
$show_backdrop  = isset( $attributes['showBackdrop'] ) ? $attributes['showBackdrop'] : true;
$close_escape   = isset( $attributes['closeOnEscape'] ) ? $attributes['closeOnEscape'] : true;
$close_backdrop = isset( $attributes['closeOnBackdrop'] ) ? $attributes['closeOnBackdrop'] : true;

// HCP Gate forces no escape/backdrop close
if ( 'hcp-gate' === $variant ) {
	$close_escape   = false;
	$close_backdrop = false;
}

// Data attributes for frontend JS
$data_attrs = array(
	'data-fk-modal'        => '',
	'data-variant'         => $variant,
	'data-close-escape'    => $close_escape ? 'true' : 'false',
	'data-close-backdrop'  => $close_backdrop ? 'true' : 'false',
);

if ( 'exit-intent' === $variant && ! empty( $attributes['whitelistUrls'] ) ) {
	$data_attrs['data-whitelist-urls'] = wp_json_encode( $attributes['whitelistUrls'] );
}

if ( 'hcp-gate' === $variant ) {
	$data_attrs['data-hcp-cookie-expiry'] = isset( $attributes['hcpCookieExpiry'] ) ? intval( $attributes['hcpCookieExpiry'] ) : 30;
	$data_attrs['data-hcp-deny-url']      = ! empty( $attributes['hcpDenyUrl'] ) ? esc_url( $attributes['hcpDenyUrl'] ) : '';
}

$data_string = '';
foreach ( $data_attrs as $key => $val ) {
	$data_string .= ' ' . $key . '="' . esc_attr( $val ) . '"';
}

$classes = array( 'fk-modal', 'fk-modal--' . $variant );
$wrapper = get_block_wrapper_attributes( array(
	'id'              => $modal_id,
	'class'           => implode( ' ', $classes ),
	'role'            => 'dialog',
	'aria-modal'      => 'true',
	'aria-labelledby' => $modal_id . '-title',
) );

$close_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
?>

<div <?php echo $wrapper; ?><?php echo $data_string; ?> style="--fk-modal-max-width:<?php echo esc_attr( $max_width ); ?>">
	<?php if ( $show_backdrop ) : ?>
		<div class="fk-modal__backdrop"></div>
	<?php endif; ?>
	<div class="fk-modal__content">
		<?php if ( 'hcp-gate' !== $variant ) : ?>
			<button type="button" class="fk-modal__close" aria-label="<?php esc_attr_e( 'Close dialog', 'wp-figmakit' ); ?>">
				<?php echo $close_svg; ?>
			</button>
		<?php endif; ?>
		<?php echo $content; ?>
	</div>
</div>
