/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "./App";
import appConfig from "./app.json";

const appName =
  (appConfig && typeof appConfig === "object" && "expo" in appConfig
    ? appConfig.expo?.name
    : appConfig?.name) || "BRSConnect";

AppRegistry.registerComponent(appName, () => App);
