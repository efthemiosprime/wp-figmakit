<?php
/**
 * Title: Hero
 * Slug: wp-figmakit/hero
 * Categories: featured
 * Keywords: hero, banner
 */
?>

<!-- wp:cover {"dimRatio":50,"minHeight":500,"isDark":true,"layout":{"type":"constrained"}} -->
<div class="wp-block-cover is-dark" style="min-height:500px">
	<span aria-hidden="true" class="wp-block-cover__background has-background-dim"></span>
	<div class="wp-block-cover__inner-container">
		<!-- wp:heading {"textAlign":"center","level":1,"textColor":"surface"} -->
		<h1 class="wp-block-heading has-text-align-center has-surface-color has-text-color">Your Heading Here</h1>
		<!-- /wp:heading -->
		<!-- wp:paragraph {"align":"center","textColor":"surface"} -->
		<p class="has-text-align-center has-surface-color has-text-color">A brief description or tagline goes here.</p>
		<!-- /wp:paragraph -->
		<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
		<div class="wp-block-buttons">
			<!-- wp:button -->
			<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Get Started</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
</div>
<!-- /wp:cover -->
