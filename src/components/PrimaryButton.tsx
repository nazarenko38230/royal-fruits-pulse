import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import theme from '../constants/theme';
import usePressScale from '../hooks/usePressScale';

export const PRIMARY_ICON = 24;

type Props = {
  label: string;
  Icon?: LucideIcon;
  gradient?: string[];
  textColor?: string;
  iconColor?: string;
  height?: number;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Primary CTA.
 * Rule #20: the icon is a FIXED 24x24 square, the label lineHeight equals it,
 * gap is always 10, and nothing inside is absolutely positioned.
 * Rule #8: Pressable is the PARENT, the Animated.View lives inside it.
 */
export function PrimaryButton({
  label,
  Icon,
  gradient = theme.gradients.cta,
  textColor = theme.colors.text.primary,
  iconColor,
  height = 62,
  onPress,
  disabled = false,
  style,
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
        style={[styles.fill, { height, transform: [{ scale }] }]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.grad, { height }]}>
          <View style={styles.row}>
            {Icon ? (
              <Icon size={PRIMARY_ICON} color={iconColor || textColor} strokeWidth={2.4} />
            ) : null}
            <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: theme.radius.lg,
    ...theme.shadows.cta,
  },
  disabled: { opacity: 0.45 },
  fill: {
    width: '100%',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  grad: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255,241,221,0.22)',
    borderRadius: theme.radius.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: PRIMARY_ICON,
  },
});

export default PrimaryButton;
