import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { MAX_MISTAKES, STRIP_H } from '../constants/config';

type Props = {
  movesLeft: number;
  matched: number;
  total: number;
  mistakes: number;
};

const movesColour = (n: number) => {
  if (n <= 1) {
    return theme.colors.accent.primary;
  }
  if (n <= 3) {
    return theme.colors.accent.secondary;
  }
  return theme.colors.accent.success;
};

/** Live round counters. The number pulses as it drops so the change is legible. */
export function StatStrip({ movesLeft, matched, total, mistakes }: Props) {
  const pop = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const anim = Animated.sequence([
      Animated.timing(pop, { toValue: 1.22, duration: 100, useNativeDriver: true }),
      Animated.timing(pop, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [movesLeft, pop]);

  return (
    <View style={styles.strip}>
      <View style={styles.block}>
        <Text style={styles.label}>MOVES</Text>
        <Animated.Text
          style={[
            styles.value,
            { color: movesColour(movesLeft), transform: [{ scale: pop }] },
          ]}>
          {movesLeft}
        </Animated.Text>
      </View>

      <View style={styles.blockCentre}>
        <Text style={styles.label}>MATCHED</Text>
        <Text style={styles.valueSmall}>
          {matched}/{total}
        </Text>
      </View>

      <View style={styles.blockRight}>
        <Text style={styles.label}>MISTAKES</Text>
        <View style={styles.dots}>
          {Array.from({ length: MAX_MISTAKES }, (_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < mistakes ? styles.dotSpent : styles.dotFree,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: STRIP_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: theme.colors.bg.strip,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,241,221,0.1)',
  },
  block: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  blockCentre: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  blockRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    lineHeight: 13,
    color: theme.colors.text.muted,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  valueSmall: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotSpent: { backgroundColor: theme.colors.accent.primary },
  dotFree: { backgroundColor: 'rgba(255,241,221,0.2)' },
});

export default StatStrip;
