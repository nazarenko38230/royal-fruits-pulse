import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import theme from '../constants/theme';
import { HEADER_H, HEADER_TOP_PAD } from '../constants/config';

type Props = {
  title?: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  /** Transparent variant for screens whose art must reach the status bar. */
  bare?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The one header used by every screen (check #12).
 * Owns the status-bar inset (rule #6: paddingTop 44) so no screen can forget it,
 * and keeps the left/right slot geometry identical across Menu, Game and Result.
 */
export function ScreenHeader({ title, subtitle, leftSlot, rightSlot, bare = false, style }: Props) {
  return (
    <View style={[styles.header, bare ? styles.bare : styles.solid, style]}>
      <View style={styles.side}>{leftSlot ?? null}</View>
      <View style={styles.centre}>
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideRight]}>{rightSlot ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_H + HEADER_TOP_PAD,
    paddingTop: HEADER_TOP_PAD,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  solid: {
    backgroundColor: theme.colors.bg.header,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,241,221,0.1)',
  },
  bare: {
    backgroundColor: 'transparent',
  },
  side: {
    minWidth: 58,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  sideRight: { alignItems: 'flex-end' },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.4,
    lineHeight: 20,
    color: theme.colors.text.primary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    lineHeight: 13,
    color: theme.colors.text.muted,
  },
});

export default ScreenHeader;
