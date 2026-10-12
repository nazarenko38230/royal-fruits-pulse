import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Crown } from 'lucide-react-native';
import theme from '../constants/theme';

type Props = {
  value: number;
  compact?: boolean;
};

/** Cosmetic progress counter. A plain integer - never a currency symbol. */
export function CrownsBadge({ value, compact = false }: Props) {
  const h = compact ? 36 : 40;
  return (
    <View style={[styles.pill, { height: h, borderRadius: h / 2 }]}>
      <Crown size={18} color={theme.colors.accent.secondary} strokeWidth={2.4} />
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(42,15,42,0.74)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,185,75,0.5)',
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
});

export default CrownsBadge;
