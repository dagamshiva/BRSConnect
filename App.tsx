import "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { CombinedDefaultTheme } from "./src/theme/theme";
import { store } from "./src/store";
import { colors } from "./src/theme/colors";
import { LocalPollsProvider } from "./src/context/LocalPollsContext";
import { LocalSuggestionsProvider } from "./src/context/LocalSuggestionsContext";
import { BRSLogo } from "./src/components/BRSLogo";

const LoadingOverlay = ({ onFinish }: { onFinish: () => void }) => {
  const translate = useRef(new Animated.Value(-80)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(translate, {
          toValue: 80,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: -80,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.current.start();

    const timeout = setTimeout(onFinish, 1600);
    return () => {
      clearTimeout(timeout);
      animation.current?.stop();
    };
  }, [onFinish, translate]);

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[styles.carWrapper, { transform: [{ translateX: translate }] }]}
      >
        <BRSLogo size={100} showText={false} variant="icon" />
      </Animated.View>
      <Text style={styles.overlayTitle}>BRS Connect</Text>
      <Text style={styles.overlaySubtitle}>Powering the Pink Car movement…</Text>
    </View>
  );
};

export default function App(): JSX.Element {
  const [booted, setBooted] = useState(false);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer theme={CombinedDefaultTheme}>
          <StatusBar barStyle="light-content" backgroundColor="#0d0d13" />
          <LocalPollsProvider>
            <LocalSuggestionsProvider>
              <RootNavigator />
            </LocalSuggestionsProvider>
          </LocalPollsProvider>
          {!booted && <LoadingOverlay onFinish={() => setBooted(true)} />}
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
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
  carWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
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
