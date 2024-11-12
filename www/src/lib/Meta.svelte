<script>
	import { page } from '$app/stores';

	$: title = $page.data.meta?.title || 'Data Stories Archive';
	$: description = $page.data.meta?.description || 'Data Stories Archive';

	$: baseURL = $page.url.origin;
</script>

<svelte:head>
	<title>{title}</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="description" content={description} />
	<meta name="author" content="Moritz Stefaner, Enrico Bertini" />
	<meta name="news_keywords" content="" />

	<meta property="og:title" content={title} />
	<meta property="og:site_name" content="Data Stories Archive" />
	<meta property="og:url" content={$page.url} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:locale" content="en_US" />

	<meta property="og:image" content="{baseURL}/images/social-facebook.png" />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="600" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={baseURL} />
	<meta name="twitter:creator" content="@example" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image:src" content="{baseURL}/images/social-twitter.png" />

	<meta name="theme-color" content="#694486" />

	<meta name="robots" content="max-image-preview:large" />
</svelte:head>
