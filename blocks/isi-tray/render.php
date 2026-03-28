<?php
/**
 * ISI Tray block server-side render.
 *
 * @package WP_Figmakit
 */

$variant          = isset( $attributes['variant'] ) ? sanitize_html_class( $attributes['variant'] ) : 'one-col';
$collapsed_h      = isset( $attributes['collapsedHeight'] ) ? intval( $attributes['collapsedHeight'] ) : 116;
$expanded_h       = isset( $attributes['expandedHeight'] ) ? intval( $attributes['expandedHeight'] ) : 300;
$tray_title       = isset( $attributes['trayTitle'] ) ? esc_html( $attributes['trayTitle'] ) : 'Important Safety Information';
$col_ratio        = isset( $attributes['colRatio'] ) ? esc_attr( $attributes['colRatio'] ) : '65-35';
$full_isi_sel     = ! empty( $attributes['fullIsiSelector'] ) ? esc_attr( $attributes['fullIsiSelector'] ) : '#full-isi';

$ratio_map = array(
	'65-35' => '65% 35%',
	'50-50' => '50% 50%',
	'70-30' => '70% 30%',
);
$grid_cols = isset( $ratio_map[ $col_ratio ] ) ? $ratio_map[ $col_ratio ] : '65% 35%';
$style_var = 'one-col' !== $variant ? ' style="--fk-isi-cols:' . esc_attr( $grid_cols ) . '"' : '';
?>

<aside
	class="fk-isi-wrap tray-visible"
	id="fk-isi-wrap"
	role="complementary"
	aria-label="<?php echo $tray_title; ?>"
	data-fk-isi-tray
	data-collapsed-height="<?php echo $collapsed_h; ?>"
	data-expanded-height="<?php echo $expanded_h; ?>"
	data-variant="<?php echo $variant; ?>"
	data-full-isi-selector="<?php echo $full_isi_sel; ?>"
	<?php echo $style_var; ?>>
	<div class="fk-isi collapsed" id="fk-isi">
		<div class="fk-isi__bar fk-row">
			<h2 class="fk-isi__title" id="fk-isi-title"><?php echo $tray_title; ?></h2>
			<div class="fk-isi__bar-right">
				<button
					type="button"
					class="fk-isi__btn fk-isi__btn--expand"
					aria-expanded="false"
					aria-controls="fk-isi-body"
					aria-label="<?php esc_attr_e( 'Expand safety information', 'wp-figmakit' ); ?>">
					+ Expand
				</button>
				<button
					type="button"
					class="fk-isi__btn fk-isi__btn--collapse"
					style="display:none"
					aria-expanded="true"
					aria-controls="fk-isi-body"
					aria-label="<?php esc_attr_e( 'Collapse safety information', 'wp-figmakit' ); ?>">
					&minus; Collapse
				</button>
			</div>
		</div>
		<div class="fk-isi__body" id="fk-isi-body" role="region" aria-labelledby="fk-isi-title" tabindex="-1">
			<div class="fk-isi__cols fk-row fk-isi__cols--<?php echo $variant; ?>">
				<?php echo $content; ?>
			</div>
		</div>
	</div>
</aside>
