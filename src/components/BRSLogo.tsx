import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { colors } from '../theme/colors';

// Import logo image - make sure to add brs-logo.jpg to src/assets/
// You can use require() for local images or a URL for remote images
// If the image doesn't exist, you can pass a source prop or use a URL
// Note: React Native requires require() to be a direct statement, not in try-catch
const BRS_LOGO_IMAGE: ImageSourcePropType = require('../assets/brs-logo.jpg');

interface BRSLogoProps {
  size?: number; // Size of the logo container
  showText?: boolean; // Whether to show the text below
  variant?: 'full' | 'icon'; // Full logo with text or just icon
  source?: ImageSourcePropType; // Optional custom image source
}

export const BRSLogo = ({
  size = 120,
  showText = true,
  variant = 'icon',
  source,
}: BRSLogoProps): React.ReactElement => {
  // Use custom source if provided, otherwise use the default logo
  const logoSource = source || BRS_LOGO_IMAGE;

  if (variant === 'icon') {
    return (
      <View style={[styles.logoContainer, { width: size, height: size }]}>
        <Image
          source={logoSource}
          style={[styles.logoImage, { width: size, height: size }]}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, { width: size, height: size }]}>
        <Image
          source={logoSource}
          style={[styles.logoImage, { width: size, height: size }]}
          resizeMode="contain"
        />
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.englishText}>BHARAT RASHTRA SAMITHI</Text>
          <Text style={styles.teluguText}>భారత రాష్ట్ర సమితి</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    // Image will be sized by width/height props
  },
  textContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  englishText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  teluguText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
