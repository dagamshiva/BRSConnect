import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, WebViewProps } from 'react-native-webview';
import { colors } from '../../theme/colors';

interface Props {
	source: WebViewProps['source'];
	height: number;
	testID?: string;
	userAgent?: string;
}

const DEFAULT_DESKTOP_UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const EmbeddedWebView = ({
	source,
	height,
	testID,
	userAgent = DEFAULT_DESKTOP_UA,
}: Props): React.ReactElement => {
	const [isLoading, setIsLoading] = useState(true);

	// Safety timeout: if WebView doesn't fire load events (some widgets),
	// hide the spinner after a few seconds so it doesn't stay forever.
	useEffect(() => {
		if (!isLoading) return;
		const timeout = setTimeout(() => {
			setIsLoading(false);
		}, 6000);
		return () => clearTimeout(timeout);
	}, [isLoading]);

	return (
		<View style={[styles.container, { height }]} testID={testID}>
			<WebView
				originWhitelist={['*']}
				allowsInlineMediaPlayback
				mediaPlaybackRequiresUserAction={false}
				mixedContentMode="always"
				thirdPartyCookiesEnabled
				javaScriptEnabled
				domStorageEnabled
				scrollEnabled={false}
				setSupportMultipleWindows={false}
				userAgent={userAgent}
				source={source}
				style={styles.webview}
				pointerEvents="none"
				onLoadStart={() => setIsLoading(true)}
				onLoadEnd={() => setIsLoading(false)}
				onError={() => setIsLoading(false)}
			/>
			{isLoading && (
				<View style={styles.loaderOverlay}>
					<ActivityIndicator size="small" color={colors.primary} />
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 12,
		overflow: 'hidden',
	},
	webview: {
		flex: 1,
	},
	loaderOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.02)',
	},
});


