<?php
/**
 * Tab Item block server-side render.
 *
 * The panel content is rendered here; the tab button is built by the parent
 * fk-tabs block using this block's attributes.
 *
 * @package WP_Figmakit
 *
 * @var array  $attributes Block attributes.
 * @var string $content    Inner blocks rendered HTML.
 */

// Output panel content only — the parent wraps it in <div role="tabpanel">.
echo $content;
