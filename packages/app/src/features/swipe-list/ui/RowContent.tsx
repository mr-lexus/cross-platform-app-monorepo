import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@ibit/ui';

import { colors, ROW_HEIGHT } from '../../../shared/theme';

type RowContentProps = {
  item: {
    id: string;
    name: string;
    text: string;
    avatarUrl?: string;
  };
};

export function RowContent({ item }: RowContentProps) {
  return (
    <View style={styles.container}>
      <Avatar
        name={item.name}
        source={item.avatarUrl ? { uri: item.avatarUrl } : undefined}
      />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.message} numberOfLines={1}>
          {item.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ROW_HEIGHT,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  text: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
});
