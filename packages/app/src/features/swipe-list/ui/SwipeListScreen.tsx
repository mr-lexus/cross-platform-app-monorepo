import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../shared/theme';
import { RowContent } from './RowContent';

// Hardcoded 10 items for the todo-6 placeholder; the deterministic 1000-item
// model arrives in todo 8 (`createMockItems`).
const PLACEHOLDER_ITEMS = [
  { id: 'ph-1', name: 'Alice Johnson', text: 'Hey, are we still on for tomorrow?', avatarUrl: 'https://i.pravatar.cc/150?u=ph-1' },
  { id: 'ph-2', name: 'Bob Smith', text: 'Attached the final design files.' },
  { id: 'ph-3', name: 'Charlie Davis', text: 'Can you review my PR when you have a sec?', avatarUrl: 'https://i.pravatar.cc/150?u=ph-3' },
  { id: 'ph-4', name: 'Diana Prince', text: 'Lunch is here! Come down.' },
  { id: 'ph-5', name: 'Ethan Hunt', text: 'Mission accomplished.' },
  { id: 'ph-6', name: 'Fiona Gallagher', text: "Don't forget to pay the utility bill." },
  { id: 'ph-7', name: 'George Miller', text: 'Mad Max screening this weekend?' },
  { id: 'ph-8', name: 'Hannah Lee', text: 'See you at the team offsite next week.' },
  { id: 'ph-9', name: 'Ivan Petrov', text: 'Pushed the hotfix to staging.' },
  { id: 'ph-10', name: 'Julia Chen', text: 'Thanks for the help yesterday!' },
];

export function SwipeListScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Swipe left or right to delete</Text>
      </View>
      <View style={styles.list}>
        {PLACEHOLDER_ITEMS.map((item) => (
          <RowContent key={item.id} item={item} />
        ))}
      </View>
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
});
