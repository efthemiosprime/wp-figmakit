<?php
/**
 * CTA block server-side render.
 *
 * @package WP_Figmakit
 */

$variant   = isset( $attributes['variant'] ) ? $attributes['variant'] : 'centered';
$alignment = isset( $attributes['alignment'] ) ? $attributes['alignment'] : 'center';
$classes   = array(
	'fk-cta',
	'fk-cta--' . sanitize_html_class( $variant ),
	'has-text-align-' . sanitize_html_class( $alignment ),
);
$wrapper   = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classes ) ) );
?>

<div <?php echo $wrapper; ?>>
	<div class="fk-cta__inner">
		<?php echo $content; ?>
	</div>
</div>
