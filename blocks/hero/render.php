<?php
/**
 * Hero block server-side render.
 *
 * @package WP_Figmakit
 */

$variant    = isset( $attributes['variant'] ) ? $attributes['variant'] : 'centered';
$min_height = isset( $attributes['minHeight'] ) ? $attributes['minHeight'] : '60vh';
$overlay    = ! empty( $attributes['showOverlay'] );
$classes    = array( 'fk-hero', 'fk-hero--' . sanitize_html_class( $variant ) );

if ( $overlay ) {
	$classes[] = 'fk-hero--overlay';
}

$wrapper = get_block_wrapper_attributes( array(
	'class' => implode( ' ', $classes ),
	'style' => 'min-height:' . esc_attr( $min_height ),
) );
?>

<div <?php echo $wrapper; ?>>
	<div class="fk-hero__inner">
		<?php echo $content; ?>
	</div>
</div>
