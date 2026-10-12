import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';

type Props = {
  value: string;
  label: string;
  valueColor: string;
};

/**
 * Text-only stat pill (rule #21 / check #15).
 *
 * There is deliberately NO raster icon here: three AI sprites in one row each
 * carry a different internal object aspect ratio, so no resizeMode can make
 * them look the same size. Colour carries the semantics instead, and every
 * pill is therefore pixel-identical in shape.
 *
 * Check #17: the card uses width:'100%', NEVER flex:1 - its parent slot is
 * already flex:1 inside a row, and flex-in-flex collapses the card to ~0px.
 */
export function StatCard({ value, label, valueColor }: Props) {
  return (
    <View style={[styles.card, { borderColor: valueColor + '55' }]}>
      <View style={[styles.accentDot, { backgroundColor: valueColor }]} />
      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    borderTopWidth: 1.5,
    backgroundColor: 'rgba(28,10,30,0.55)',
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.text.muted,
  },
});

export default StatCard;
