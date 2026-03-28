<?php
/**
 * Accordion Item block server-side render.
 * WCAG 2.1 AA: button trigger, aria-expanded, aria-controls, role="region", aria-labelledby
 *
 * @package WP_Figmakit
 */

$title          = isset( $attributes['title'] ) ? wp_kses_post( $attributes['title'] ) : '';
$icon_url       = ! empty( $attributes['iconMediaUrl'] ) ? esc_url( $attributes['iconMediaUrl'] ) : '';
$is_open        = ! empty( $attributes['isOpenByDefault'] );
$uid            = wp_unique_id( 'fk-acc-' );
$header_id      = $uid . '-header';
$panel_id       = $uid . '-panel';
$open_class     = $is_open ? ' is-open' : '';
$aria_expanded  = $is_open ? 'true' : 'false';
$hidden_attr    = $is_open ? '' : ' hidden';
?>

<div class="fk-accordion-item<?php echo $open_class; ?>" data-fk-accordion-item>
	<h3 class="fk-accordion-item__heading">
		<button
			type="button"
			class="fk-accordion-item__header"
			id="<?php echo $header_id; ?>"
			aria-expanded="<?php echo $aria_expanded; ?>"
			aria-controls="<?php echo $panel_id; ?>">
			<?php if ( $icon_url ) : ?>
				<span class="fk-accordion-item__icon" aria-hidden="true">
					<img src="<?php echo $icon_url; ?>" alt="" loading="lazy" />
				</span>
			<?php endif; ?>
			<span class="fk-accordion-item__title"><?php echo $title; ?></span>
			<span class="fk-accordion-item__toggle" aria-hidden="true"></span>
		</button>
	</h3>
	<div
		class="fk-accordion-item__panel"
		id="<?php echo $panel_id; ?>"
		role="region"
		aria-labelledby="<?php echo $header_id; ?>"
		<?php echo $hidden_attr; ?>>
		<div class="fk-accordion-item__panel-inner">
			<?php echo $content; ?>
		</div>
	</div>
</div>
