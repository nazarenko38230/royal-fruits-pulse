import React from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import theme from '../constants/theme';
import usePressScale from '../hooks/usePressScale';

type Props = {
  Icon: LucideIcon;
  onPress: () => void;
  label: string;
  size?: number;
  tint?: string;
};

/**
 * Icon-only control (back, close). It carries an accessibilityLabel because it
 * has no visible text of its own; buttons WITH a text label deliberately do not,
 * so their <Text> node stays addressable in the view tree.
 */
export function IconButton({ Icon, onPress, label, size = 44, tint = theme.colors.text.primary }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.9);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{ width: size, height: size }}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.inner,
          { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] },
        ]}>
        <Icon size={20} color={tint} strokeWidth={2.6} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,241,221,0.1)',
    borderWidth: 1.5,
    borderColor: theme.colors.ui.hairline,
  },
});

export default IconButton;
