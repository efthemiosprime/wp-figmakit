<?php
/**
 * Tabs block server-side render.
 *
 * WCAG 2.1 AA compliant — follows WAI-ARIA Authoring Practices Tabs Pattern.
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 *
 * @package WP_Figmakit
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks rendered HTML.
 * @var WP_Block $block      Block instance.
 */

$variant   = isset( $attributes['variant'] ) ? $attributes['variant'] : 'horizontal';
$active    = isset( $attributes['activeTab'] ) ? (int) $attributes['activeTab'] : 0;
$tab_id    = 'fk-tabs-' . wp_unique_id();
$classes   = array( 'fk-tabs', 'fk-tabs--' . sanitize_html_class( $variant ) );
$wrapper   = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classes ), 'id' => $tab_id ) );

// Collect tab metadata from inner blocks.
$tabs = array();
if ( ! empty( $block->inner_blocks ) ) {
	foreach ( $block->inner_blocks as $inner ) {
		if ( 'wp-figmakit/fk-tab-item' !== $inner->name ) {
			continue;
		}
		$a = $inner->attributes;
		$tabs[] = array(
			'label'        => isset( $a['label'] ) ? $a['label'] : 'Tab',
			'icon'         => isset( $a['icon'] ) ? $a['icon'] : '',
			'iconMediaUrl' => isset( $a['iconMediaUrl'] ) ? $a['iconMediaUrl'] : '',
			'superscript'  => isset( $a['superscript'] ) ? $a['superscript'] : '',
			'content'      => $inner->render(),
		);
	}
}

if ( empty( $tabs ) ) {
	return;
}

// Clamp active index.
if ( $active >= count( $tabs ) ) {
	$active = 0;
}

$orientation = ( 'vertical' === $variant ) ? 'vertical' : 'horizontal';
?>

<div <?php echo $wrapper; ?>>
	<div
		class="fk-tabs__nav"
		role="tablist"
		aria-label="<?php esc_attr_e( 'Tabs', 'wp-figmakit' ); ?>"
		aria-orientation="<?php echo esc_attr( $orientation ); ?>"
	>
		<?php foreach ( $tabs as $i => $tab ) :
			$is_active  = ( $i === $active );
			$btn_class  = 'fk-tabs__tab' . ( $is_active ? ' fk-tabs__tab--active' : '' );
			$panel_id   = $tab_id . '-panel-' . $i;
			$btn_id     = $tab_id . '-tab-' . $i;

			// Build accessible label: "Label (superscript)" for screen readers.
			$aria_label = esc_attr( $tab['label'] );
			if ( ! empty( $tab['superscript'] ) ) {
				$aria_label .= ' (' . esc_attr( $tab['superscript'] ) . ')';
			}
		?>
			<button
				type="button"
				role="tab"
				class="<?php echo esc_attr( $btn_class ); ?>"
				id="<?php echo esc_attr( $btn_id ); ?>"
				aria-selected="<?php echo $is_active ? 'true' : 'false'; ?>"
				aria-controls="<?php echo esc_attr( $panel_id ); ?>"
				aria-label="<?php echo $aria_label; ?>"
				tabindex="<?php echo $is_active ? '0' : '-1'; ?>"
			>
				<?php if ( ! empty( $tab['icon'] ) ) : ?>
					<span class="fk-tabs__tab-icon" aria-hidden="true"><?php echo wp_kses_post( $tab['icon'] ); ?></span>
				<?php elseif ( ! empty( $tab['iconMediaUrl'] ) ) : ?>
					<span class="fk-tabs__tab-icon" aria-hidden="true"><img src="<?php echo esc_url( $tab['iconMediaUrl'] ); ?>" alt="" role="presentation" /></span>
				<?php endif; ?>
				<span class="fk-tabs__tab-label"><?php echo esc_html( $tab['label'] ); ?></span>
				<?php if ( ! empty( $tab['superscript'] ) ) : ?>
					<sup class="fk-tabs__tab-sup" aria-hidden="true"><?php echo esc_html( $tab['superscript'] ); ?></sup>
				<?php endif; ?>
			</button>
		<?php endforeach; ?>
	</div>

	<div class="fk-tabs__panels">
		<?php foreach ( $tabs as $i => $tab ) :
			$is_active = ( $i === $active );
			$panel_cls = 'fk-tabs__panel' . ( $is_active ? ' fk-tabs__panel--active' : '' );
			$panel_id  = $tab_id . '-panel-' . $i;
			$btn_id    = $tab_id . '-tab-' . $i;
		?>
			<div
				role="tabpanel"
				class="<?php echo esc_attr( $panel_cls ); ?>"
				id="<?php echo esc_attr( $panel_id ); ?>"
				aria-labelledby="<?php echo esc_attr( $btn_id ); ?>"
				tabindex="0"
				<?php echo $is_active ? '' : 'hidden'; ?>
			>
				<?php echo $tab['content']; ?>
			</div>
		<?php endforeach; ?>
	</div>
</div>
