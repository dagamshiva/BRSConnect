import React from 'react';
import { EmbeddedWebView } from './EmbeddedWebView';

interface Props {
	url: string; // full tweet URL
	height?: number; // default 500
}

export const TweetEmbed = ({ url, height = 520 }: Props): React.ReactElement => {
	// Normalize x.com → twitter.com for better compatibility with widgets.js
	const normalized = url.replace('x.com', 'twitter.com');
	const html = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; }
    </style>
    <script async src="https://platform.twitter.com/widgets.js"></script>
  </head>
  <body>
    <blockquote class="twitter-tweet">
      <a href="${normalized}"></a>
    </blockquote>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
        }
      });
    </script>
  </body>
</html>`;

	return <EmbeddedWebView source={{ html, baseUrl: 'https://twitter.com' as any }} height={height} testID="TweetEmbed" />;
};


