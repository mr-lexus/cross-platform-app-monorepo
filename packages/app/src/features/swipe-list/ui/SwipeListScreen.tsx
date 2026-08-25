import { useCallback } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { ListRenderItemInfo } from "react-native";

import { colors, ROW_HEIGHT } from "../../../shared/theme";
import type { MessageItem } from "../model/types";
import { useSwipeListStore } from "../model/store";
import { SwipeableRow } from "./SwipeableRow";

const SHELL_MAX_WIDTH = 475;

export function SwipeListScreen() {
  // Narrow subscriptions: one selector per slice so the component re-renders
  // only when `items` changes; actions are stable store references.
  const items = useSwipeListStore((state) => state.items);
  const removeItem = useSwipeListStore((state) => state.removeItem);
  const reset = useSwipeListStore((state) => state.reset);
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = Math.min(windowWidth, SHELL_MAX_WIDTH);

  const onDelete = useCallback(
    (id: string) => {
      removeItem(id);
    },
    [removeItem],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<MessageItem>) => (
      <SwipeableRow
        item={item}
        onDelete={onDelete}
        containerWidth={containerWidth}
      />
    ),
    [onDelete, containerWidth],
  );

  const resetList = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Swipe left or right to delete</Text>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * index,
          index,
        })}
        removeClippedSubviews={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState onReset={resetList} />}
      />
    </View>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No messages</Text>
      <Text style={styles.emptyText}>
        You have swiped away all your messages.
      </Text>
      <Pressable style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>Reset List</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.listBackground,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.headerBorder,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  resetButton: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
  },
  resetButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "500",
  },
});
