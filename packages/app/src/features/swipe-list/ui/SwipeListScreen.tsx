import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { colors, ROW_HEIGHT } from '../../../shared/theme';
import { createMockItems } from '../model/mockData';
import { deleteItem } from '../model/deleteItem';
import type { MessageItem } from '../model/types';
import { SwipeableRow } from './SwipeableRow';

const SHELL_MAX_WIDTH = 475;
const ITEM_COUNT = 1000;

export function SwipeListScreen() {
  const [items, setItems] = useState(() => createMockItems(ITEM_COUNT));
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = Math.min(windowWidth, SHELL_MAX_WIDTH);

  const onDelete = useCallback((id: string) => {
    setItems((prev) => deleteItem(prev, id));
  }, []);

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
    setItems(() => createMockItems(ITEM_COUNT));
  }, []);

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
      <Text style={styles.emptyText}>You have swiped away all your messages.</Text>
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
    fontWeight: '700',
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  resetButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '500',
  },
});
