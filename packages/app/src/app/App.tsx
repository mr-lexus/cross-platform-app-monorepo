import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../shared/theme";
import { SwipeListScreen } from "../features/swipe-list/ui/SwipeListScreen";

export function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.shell}>
            <SwipeListScreen />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.pageBackground },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: 475,
    alignSelf: "center",
    backgroundColor: colors.pageBackground,
  },
});
