import React from 'react';
import YoutubeIframe from 'react-native-youtube-iframe';

interface Props {
  videoId: string; // e.g., t7jx5atCWLs
  height?: number; // default 230
  play?: boolean;
}

export const YouTubePlayer = ({
  videoId,
  height = 40,
  play = false,
}: Props): React.ReactElement => {
  return (
    <YoutubeIframe
      height={height}
      play={play}
      videoId={videoId}
      webViewProps={{
        allowsInlineMediaPlayback: true,
        mediaPlaybackRequiresUserAction: false,
        originWhitelist: ['*'],
      }}
    />
  );
};
