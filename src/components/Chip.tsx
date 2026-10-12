import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import usePressScale from '../hooks/usePressScale';

type Props = {
  label: string;
  active?: boolean;
  dotColor?: string;
  onPress: () => void;
};

/**
 * Difficulty chip. Deliberately icon-free: an 8x8 accent dot carries the
 * semantics, which keeps every chip exactly the same width-per-character and
 * removes any glyph-alignment risk (rule #20 - a clean chip beats a crooked one).
 */
export function Chip({ label, active = false, dotColor = theme.colors.accent.success, onPress }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.press}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.chip,
          active ? styles.chipActive : null,
          { transform: [{ scale }] },
        ]}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: active ? dotColor : theme.colors.text.muted }]} />
          <Text style={[styles.label, active ? styles.labelActive : null]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { height: 40 },
  chip: {
    height: 40,
    minWidth: 94,
    borderRadius: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,241,221,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,241,221,0.16)',
  },
  chipActive: {
    backgroundColor: 'rgba(245,185,75,0.16)',
    borderColor: theme.colors.accent.secondary,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 16,
    color: theme.colors.text.secondary,
  },
  labelActive: { color: theme.colors.text.primary },
});

export default Chip;
