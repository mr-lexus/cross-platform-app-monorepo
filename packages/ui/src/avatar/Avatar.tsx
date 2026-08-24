import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { getAvatarColor } from './lib/colors';
import { getInitials } from './lib/initials';

export type AvatarProps = {
  name: string;
  source?: { uri: string };
  size?: number;
};

const DEFAULT_SIZE = 48;
const INITIALS_FONT_RATIO = 0.4;

export function Avatar({ name, source, size = DEFAULT_SIZE }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const backgroundColor = getAvatarColor(name);
  const initials = getInitials(name);
  const showImage = Boolean(source?.uri) && !failed;

  return (
    <View
      accessibilityLabel={name}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        accessibilityElementsHidden
        importantForAccessibility={showImage ? 'no-hide-descendants' : 'auto'}
        style={[styles.initials, { fontSize: size * INITIALS_FONT_RATIO }]}
      >
        {initials}
      </Text>
      {showImage && source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          onError={() => setFailed(true)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
