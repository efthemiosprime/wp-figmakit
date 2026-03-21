<?php
/**
 * Template part for displaying a message when no posts are found.
 *
 * @package WP_Figmakit
 */
?>

<section class="no-results not-found">
	<header class="page-header">
		<h1 class="page-title">Nothing Found</h1>
	</header>

	<div class="page-content">
		<?php if ( is_search() ) : ?>
			<p>Sorry, no results matched your search. Please try again with different keywords.</p>
		<?php else : ?>
			<p>It seems we can&rsquo;t find what you&rsquo;re looking for.</p>
		<?php endif; ?>
	</div>
</section>
