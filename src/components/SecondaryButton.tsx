import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import theme from '../constants/theme';
import usePressScale from '../hooks/usePressScale';

/**
 * Secondary action.
 * The icon is the SAME 24x24 square as PrimaryButton (rule #20: icon sizes are
 * never mixed between button classes on one screen) with a matching lineHeight.
 */
export const SECONDARY_ICON = 24;

type Props = {
  label: string;
  Icon?: LucideIcon;
  tint?: string;
  borderColor?: string;
  background?: string;
  height?: number;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  trailing?: string;
};

export function SecondaryButton({
  label,
  Icon,
  tint = theme.colors.text.primary,
  borderColor = theme.colors.ui.border,
  background = theme.colors.ui.fill,
  height = 52,
  onPress,
  disabled = false,
  style,
  trailing,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.press, { height }, disabled ? styles.disabled : null, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.fill,
          {
            height,
            backgroundColor: background,
            borderColor,
            transform: [{ scale }],
          },
        ]}>
        <View style={styles.row}>
          {Icon ? <Icon size={SECONDARY_ICON} color={tint} strokeWidth={2.4} /> : null}
          <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
            {label}
          </Text>
          {trailing ? (
            <Text style={[styles.trailing, { color: tint }]} numberOfLines={1}>
              {trailing}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: theme.radius.md + 2,
  },
  disabled: { opacity: 0.4 },
  fill: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md + 2,
    borderWidth: 1.5,
    borderTopWidth: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: SECONDARY_ICON,
  },
  trailing: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: SECONDARY_ICON,
    opacity: 0.7,
  },
});

export default SecondaryButton;
