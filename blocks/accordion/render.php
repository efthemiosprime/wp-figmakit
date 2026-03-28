<?php
/**
 * Accordion block server-side render.
 *
 * @package WP_Figmakit
 */

$allow_multiple = ! empty( $attributes['allowMultiple'] ) ? 'true' : 'false';
$default_open   = isset( $attributes['defaultOpen'] ) ? intval( $attributes['defaultOpen'] ) : -1;

$classes = array( 'fk-accordion' );
$wrapper = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classes ) ) );
?>

<div <?php echo $wrapper; ?>
	data-fk-accordion
	data-allow-multiple="<?php echo $allow_multiple; ?>"
	data-default-open="<?php echo $default_open; ?>"
	role="presentation">
	<?php echo $content; ?>
</div>
