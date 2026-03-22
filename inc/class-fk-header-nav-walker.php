<?php
/**
 * Custom nav walker for the header block.
 *
 * Outputs BEM-style classes and chevron icons for dropdown items.
 *
 * @package WP_Figmakit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FK_Header_Nav_Walker extends Walker_Nav_Menu {

	/**
	 * Navigation type: 'utility' or 'primary'.
	 *
	 * @var string
	 */
	private $type;

	/**
	 * CSS class for links.
	 *
	 * @var string
	 */
	private $link_class;

	/**
	 * @param string $type       Navigation type ('utility' or 'primary').
	 * @param string $link_class CSS class for anchor elements.
	 */
	public function __construct( $type = 'primary', $link_class = 'nav-link' ) {
		$this->type       = $type;
		$this->link_class = $link_class;
	}

	/**
	 * Open the list item element.
	 */
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$has_children = in_array( 'menu-item-has-children', $item->classes, true );
		$li_class     = 'fk-header__' . $this->type . '-item';

		if ( $has_children ) {
			$li_class .= ' fk-header__' . $this->type . '-item--has-children';
		}

		$output .= '<li class="' . esc_attr( $li_class ) . '">';

		// Build link attributes.
		$atts = array(
			'href'  => esc_url( $item->url ),
			'class' => $this->link_class,
		);

		if ( ! empty( $item->target ) ) {
			$atts['target'] = $item->target;
		}

		if ( '_blank' === $item->target ) {
			$atts['rel'] = 'noopener noreferrer';
		}

		if ( $has_children && 0 === $depth ) {
			$atts['aria-expanded'] = 'false';
		}

		$attr_string = '';
		foreach ( $atts as $key => $val ) {
			$attr_string .= ' ' . $key . '="' . esc_attr( $val ) . '"';
		}

		$output .= '<a' . $attr_string . '>';

		if ( 'primary' === $this->type ) {
			$output .= '<span>' . esc_html( $item->title ) . '</span>';
		} else {
			$output .= esc_html( $item->title );
		}

		if ( $has_children && 0 === $depth ) {
			$output .= '<span class="fk-header__chevron" aria-hidden="true"></span>';
		}

		$output .= '</a>';
	}

	/**
	 * Open sub-menu list.
	 */
	public function start_lvl( &$output, $depth = 0, $args = null ) {
		$sub_class = 'fk-header__' . $this->type . '-sub';
		$output   .= '<ul class="' . esc_attr( $sub_class ) . '">';
	}

	/**
	 * Close sub-menu list.
	 */
	public function end_lvl( &$output, $depth = 0, $args = null ) {
		$output .= '</ul>';
	}

	/**
	 * Close list item.
	 */
	public function end_el( &$output, $item, $depth = 0, $args = null ) {
		$output .= '</li>';
	}
}
