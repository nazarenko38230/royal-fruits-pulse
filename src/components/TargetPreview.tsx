import React from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { COLOUR_RING, COLS } from '../constants/config';

type Props = {
  target: number[];
  onPress?: () => void;
  onLayoutCard?: (e: LayoutChangeEvent) => void;
};

const MINI = 15;
const MINI_GAP = 2;

/** The crown pattern the orchard must match - the player's live reference. */
export function TargetPreview({ target, onPress, onLayoutCard }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      onLayout={onLayoutCard}
      style={styles.card}>
      <Text style={styles.label} numberOfLines={1}>
        CROWN PATTERN
      </Text>
      <View style={styles.grid} pointerEvents="none">
        {target.map((colourIndex, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              {
                backgroundColor: COLOUR_RING[colourIndex] ?? COLOUR_RING[0],
                marginRight: (i + 1) % COLS === 0 ? 0 : MINI_GAP,
              },
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
}

const GRID_W = MINI * COLS + MINI_GAP * (COLS - 1);

const styles = StyleSheet.create({
  card: {
    width: 118,
    height: 118,
    borderRadius: 24,
    backgroundColor: 'rgba(28,10,30,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(245,185,75,0.4)',
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 12,
    color: theme.colors.accent.secondary,
    marginBottom: 5,
  },
  grid: {
    width: GRID_W,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: MINI,
    height: MINI,
    borderRadius: 5,
    marginBottom: MINI_GAP,
  },
});

export default TargetPreview;
