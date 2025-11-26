import "react-native-gesture-handler";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { store } from "./src/store";
import { useTheme } from "./src/theme/useTheme";
import { loadTheme } from "./src/store/slices/themeSlice";
import { LocalPollsProvider } from "./src/context/LocalPollsContext";
import { LocalSuggestionsProvider } from "./src/context/LocalSuggestionsContext";
import { BRSLogo } from "./src/components/BRSLogo";
import { LightTheme } from "@react-navigation/native";

const LoadingOverlay = ({ onFinish, colors }: { onFinish: () => void; colors: ReturnType<typeof useTheme> }) => {
  useEffect(() => {
    const timeout = setTimeout(onFinish, 1600);
    return () => {
      clearTimeout(timeout);
    };
  }, [onFinish]);

  const overlayStyles = StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.overlay,
    },
    logoWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60, // Perfect circle
      backgroundColor: "transparent", // Transparent background
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      overflow: "hidden", // Ensure circular clipping
    },
    overlayTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    overlaySubtitle: {
      marginTop: 8,
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={overlayStyles.overlay}>
      <View style={overlayStyles.logoWrapper}>
        <BRSLogo size={120} showText={false} variant="icon" />
      </View>
      <Text style={overlayStyles.overlayTitle}>BRS Connect</Text>
      <Text style={overlayStyles.overlaySubtitle}>Powering the Pink Car movement…</Text>
    </View>
  );
};

const AppContent = (): JSX.Element => {
  const [booted, setBooted] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  
  console.log("AppContent: Starting render");
  
  // Get theme with error handling
  let colors;
  try {
    console.log("AppContent: Calling useTheme");
    colors = useTheme();
    console.log("AppContent: Theme loaded successfully", colors.background);
  } catch (error) {
    console.error("Theme hook error:", error);
    setHasError("Theme initialization failed");
    // Fallback colors
    colors = {
      background: "#FFFFFF",
      surface: "#F5F5F5",
      card: "#FFFFFF",
      primary: "#E91E63",
      textPrimary: "#000000",
      textSecondary: "#666666",
      border: "#E0E0E0",
      accent: "#FFC107",
      overlay: "rgba(0, 0, 0, 0.3)",
    };
  }
  
  // Get navigation theme - create directly to avoid import issues
  console.log("AppContent: Creating navigation theme");
  console.log("AppContent: LightTheme available?", !!LightTheme);
  
  // Ensure LightTheme is available with all required properties
  const baseTheme = LightTheme && LightTheme.colors ? LightTheme : {
    dark: false,
    colors: {
      primary: "#E91E63",
      background: "#FFFFFF",
      card: "#FFFFFF",
      text: "#000000",
      border: "#E0E0E0",
      notification: "#FFC107",
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '800' as const,
      },
    },
  };
  
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...(baseTheme.colors || {}),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.accent,
    },
    fonts: baseTheme.fonts || {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '800' as const,
      },
    },
  };
  console.log("AppContent: Navigation theme created");

  // Error boundary fallback
  if (hasError) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
            App Error
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 10 }}>
            {hasError}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
            Please restart the app or check the console for details.
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  console.log("AppContent: Rendering main UI");

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar 
          barStyle={colors.background === "#FFFFFF" ? "dark-content" : "light-content"} 
          backgroundColor={colors.background} 
        />
        <NavigationContainer 
          theme={navigationTheme}
          onReady={() => {
            console.log("NavigationContainer: Ready");
          }}
          onError={(error) => {
            console.error('Navigation error:', error);
            setHasError(`Navigation error: ${error?.message || 'Unknown error'}`);
          }}
        >
          <LocalPollsProvider>
            <LocalSuggestionsProvider>
              <RootNavigator />
            </LocalSuggestionsProvider>
          </LocalPollsProvider>
          {!booted && <LoadingOverlay onFinish={() => {
            console.log("LoadingOverlay: Finished");
            setBooted(true);
          }} colors={colors} />}
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
};

// Component to load theme on app start
const ThemeLoader = () => {
  React.useEffect(() => {
    store.dispatch(loadTheme());
  }, []);
  return null;
};

export default function App(): JSX.Element {
  console.log("App: Component mounting");
  
  // Wrap in error boundary
  try {
    return (
      <Provider store={store}>
        <ThemeLoader />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Provider>
    );
  } catch (error) {
    console.error("App: Fatal error in render:", error);
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20 }}>
          <Text style={{ color: '#000000', fontSize: 18, fontWeight: '700', marginBottom: 10 }}>Fatal App Error</Text>
          <Text style={{ color: '#666666', fontSize: 14, marginTop: 10, textAlign: 'center' }}>{String(error)}</Text>
          <Text style={{ color: '#FF0000', fontSize: 12, marginTop: 20, textAlign: 'center' }}>
            Check Metro bundler console for details
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20 }}>
            <Text style={{ color: '#000000', fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
              App Crashed
            </Text>
            <Text style={{ color: '#666666', fontSize: 14, textAlign: 'center', marginBottom: 10 }}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
            <Text style={{ color: '#666666', fontSize: 12, textAlign: 'center' }}>
              Check the console for details
            </Text>
          </View>
        </SafeAreaProvider>
      );
    }

    return this.props.children;
  }
}
