<?php
/**
 * Header block server-side render.
 *
 * @package WP_Figmakit
 */

require_once WP_FIGMAKIT_DIR . '/inc/class-fk-header-nav-walker.php';

$variant         = isset( $attributes['variant'] ) ? $attributes['variant'] : 'default';
$utility_menu_id = isset( $attributes['utilityMenuId'] ) ? absint( $attributes['utilityMenuId'] ) : 0;
$main_menu_id    = isset( $attributes['mainMenuId'] ) ? absint( $attributes['mainMenuId'] ) : 0;
$show_utility    = ! empty( $attributes['showUtilityMenu'] );
$show_skip       = ! empty( $attributes['showSkipLink'] );

$classes = array( 'fk-header', 'fk-header--' . sanitize_html_class( $variant ) );
$wrapper = get_block_wrapper_attributes( array(
	'class' => implode( ' ', $classes ),
	'role'  => 'banner',
) );

/**
 * Render a nav menu with BEM classes.
 *
 * @param int    $menu_id Menu term ID.
 * @param string $type    'utility' or 'primary'.
 */
$render_nav = function ( $menu_id, $type ) {
	if ( ! $menu_id ) {
		return;
	}

	$aria_label = ( 'utility' === $type )
		? __( 'Utility navigation', 'wp-figmakit' )
		: __( 'Main navigation', 'wp-figmakit' );

	$link_class = ( 'utility' === $type ) ? 'utility-nav-link' : 'nav-link';

	wp_nav_menu( array(
		'menu'                 => $menu_id,
		'container'            => 'nav',
		'container_class'      => 'fk-header__' . $type,
		'container_aria_label' => $aria_label,
		'menu_class'           => 'fk-header__' . $type . '-list',
		'items_wrap'           => '<ul class="%2$s">%3$s</ul>',
		'depth'                => 2,
		'fallback_cb'          => false,
		'walker'               => new FK_Header_Nav_Walker( $type, $link_class ),
	) );
};

if ( $show_skip ) : ?>
<a class="fk-header__skip-link screen-reader-text" href="#main-content">
	<?php esc_html_e( 'Skip to main content', 'wp-figmakit' ); ?>
</a>
<?php endif; ?>

<header <?php echo $wrapper; ?>>
	<div class="fk-header__inner">

		<?php if ( 'default' === $variant ) : ?>

			<div class="fk-header__row fk-header__row--main">
				<div class="fk-header__logo">
					<?php echo $content; ?>
				</div>
				<div class="fk-header__menus">
					<?php if ( $show_utility ) : ?>
					<div class="fk-header__menus-row">
						<?php $render_nav( $utility_menu_id, 'utility' ); ?>
					</div>
					<?php endif; ?>
					<div class="fk-header__menus-row">
						<?php $render_nav( $main_menu_id, 'primary' ); ?>
					</div>
				</div>
				<button class="fk-header__toggle" aria-expanded="false" aria-controls="fk-header-mobile-menu" aria-label="<?php esc_attr_e( 'Toggle menu', 'wp-figmakit' ); ?>">
					<span class="fk-header__toggle-bar"></span>
					<span class="fk-header__toggle-bar"></span>
					<span class="fk-header__toggle-bar"></span>
				</button>
			</div>

		<?php else : ?>

			<div class="fk-header__row fk-header__row--top">
				<?php
				if ( $show_utility ) {
					$render_nav( $utility_menu_id, 'utility' );
				}
				?>
			</div>

			<div class="fk-header__row fk-header__row--main">
				<div class="fk-header__logo">
					<?php echo $content; ?>
				</div>
				<?php $render_nav( $main_menu_id, 'primary' ); ?>
				<button class="fk-header__toggle" aria-expanded="false" aria-controls="fk-header-mobile-menu" aria-label="<?php esc_attr_e( 'Toggle menu', 'wp-figmakit' ); ?>">
					<span class="fk-header__toggle-bar"></span>
					<span class="fk-header__toggle-bar"></span>
					<span class="fk-header__toggle-bar"></span>
				</button>
			</div>

		<?php endif; ?>

	</div>
</header>
