<?php
/**
 * Card block server-side render.
 *
 * @package WP_Figmakit
 */

$variant    = isset( $attributes['variant'] ) ? $attributes['variant'] : 'vstack';
$classes    = array( 'fk-card', 'fk-card--' . sanitize_html_class( $variant ) );
$wrapper    = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classes ) ) );
?>

<div <?php echo $wrapper; ?>>
	<?php echo $content; ?>
</div>
