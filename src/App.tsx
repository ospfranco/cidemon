import "react-native-get-random-values";
import { decode, encode } from "base-64";
//@ts-ignore
if (!global.btoa) {
  //@ts-ignore
  global.btoa = encode;
}

//@ts-ignore
if (!global.atob) {
  //@ts-ignore
  global.atob = decode;
}

import "Theme";
import { NavigationContainer } from "@react-navigation/native";
import { ToastContainer } from "container";
import React, { useEffect, useState } from "react";
import { LogBox, Platform } from "react-native";
import { createRootStore, IRootStore, StoreProvider } from "Root.store";
import { Routes } from "Route";

LogBox.ignoreLogs([
  `Warning: componentWillReceiveProps`,
  `Calling \`getNode`,
  `Module RNBackgroundFetch`,
  `RCTBridge required dispatch_sync`,
  `currentlyFocusedField is deprecated`,
  `focusTextInput must be called with a host component`,
]);

let os = Platform.OS;
global.os = os;
global.isMacOS = os === `macos`;

export function App() {
  let [rootStore, setRootStore] = useState<IRootStore | null>(null);
  useEffect(() => {
    createRootStore().then(setRootStore);
  }, []);

  if (!rootStore) {
    return null;
  }

  return (
    <StoreProvider value={rootStore}>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
      <ToastContainer />
    </StoreProvider>
  );
}
