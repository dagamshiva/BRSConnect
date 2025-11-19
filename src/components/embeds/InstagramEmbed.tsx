import React from 'react';
import { EmbeddedWebView } from './EmbeddedWebView';

interface Props {
	url: string; // full instagram post/reel URL
	height?: number; // default 420
}

export const InstagramEmbed = ({ url, height = 420 }: Props): React.ReactElement => {
	// Normalize to embed endpoint and render via iframe HTML to minimize login prompts
	const match = url.match(/instagram\.com\/(?:p|reel|reels)\/([^/?#]+)/i);
	const id = match?.[1];
	const embedUrl = id
		? `https://www.instagram.com/reel/${id}/embed`
		: url.endsWith('/embed')
		? url
		: `${url.replace(/\/$/, '')}/embed`;

	const html = `
	<html>
		<head>
			<meta name="viewport" content="initial-scale=1, maximum-scale=1">
			<style>html,body{margin:0;padding:0;background:transparent;height:100%}</style>
		</head>
		<body>
			<iframe
				width="100%"
				height="100%"
				src="${embedUrl}"
				frameborder="0"
				allowtransparency="true"
				allowfullscreen
			></iframe>
		</body>
	</html>`;

	return (
		<EmbeddedWebView source={{ html }} height={height} testID="InstagramEmbed" />
	);
};


