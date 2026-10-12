import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import theme from '../constants/theme';

type Tone = 'surface' | 'deep' | 'gold';

type Props = {
  children?: React.ReactNode;
  radius?: number;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
};

/**
 * The single source of the CLAYMORPHISM surface treatment:
 * dense fill + outer drop shadow + an inner top highlight border.
 * Every card in the app goes through here so the surfaces cannot drift.
 */
export function ClayCard({ children, radius = theme.radius.lg, tone = 'surface', style }: Props) {
  const toneStyle =
    tone === 'deep' ? styles.deep : tone === 'gold' ? styles.gold : styles.surface;
  return (
    <View style={[styles.base, toneStyle, { borderRadius: radius }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderTopWidth: 2,
    borderTopColor: theme.colors.ui.highlight,
    ...theme.shadows.clay,
  },
  surface: {
    backgroundColor: theme.colors.bg.surface,
  },
  deep: {
    backgroundColor: theme.colors.bg.board,
    borderWidth: 2,
    borderColor: theme.colors.ui.hairline,
    borderTopColor: theme.colors.ui.highlight,
  },
  gold: {
    backgroundColor: 'rgba(245,185,75,0.14)',
    borderWidth: 2,
    borderColor: 'rgba(245,185,75,0.5)',
    borderTopColor: 'rgba(245,185,75,0.7)',
  },
});

export default ClayCard;
