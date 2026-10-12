import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import theme from '../constants/theme';
import { COLOUR_RING, TILE, TILE_GAP, TILE_SPRITE, TILE_VISUAL } from '../constants/config';
import { FRUIT_SPRITES } from '../assets';

type Props = {
  cell: number;
  colourIndex: number;
  matched: boolean;
  hinted: boolean;
  locked: boolean;
  scale: Animated.Value;
  onPress: (cell: number) => void;
};

/**
 * One clay fruit block.
 *
 * Rule #8: Pressable is the PARENT; the Animated.View that scales lives inside.
 * The wrapper carries pointerEvents="box-none" so the animated layer can never
 * swallow the press on an Android release build.
 *
 * Rule #7: the sprite is a plain <Image> laid over the fill - it arrives with a
 * transparent background, so wrapping it in an overflow:hidden circle would only
 * add a visible bubble around the fruit.
 */
function FruitTileBase({ cell, colourIndex, matched, hinted, locked, scale, onPress }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const lastRef = useRef(colourIndex);
  const [previous, setPrevious] = useState<number | null>(null);

  useEffect(() => {
    if (lastRef.current === colourIndex) {
      return;
    }
    setPrevious(lastRef.current);
    lastRef.current = colourIndex;
    fade.setValue(1);
    const anim = Animated.timing(fade, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished) {
        setPrevious(null);
      }
    });
    return () => anim.stop();
  }, [colourIndex, fade]);

  const fill = COLOUR_RING[colourIndex] ?? COLOUR_RING[0];
  const sprite = FRUIT_SPRITES[colourIndex] ?? FRUIT_SPRITES[0];

  return (
    <Pressable
      onPress={() => onPress(cell)}
      disabled={locked}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      style={styles.slot}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.tile,
          {
            backgroundColor: fill,
            borderColor: hinted
              ? theme.colors.accent.secondary
              : matched
              ? 'rgba(255,241,221,0.55)'
              : 'transparent',
            borderWidth: hinted ? 3 : matched ? 2 : 0,
            transform: [{ scale }],
          },
        ]}>
        {previous !== null ? (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.cross,
              { backgroundColor: COLOUR_RING[previous], opacity: fade },
            ]}
          />
        ) : null}
        <View style={styles.highlight} pointerEvents="none" />
        <Image source={sprite} style={styles.sprite} />
        {matched ? (
          <View style={styles.checkBadge} pointerEvents="none">
            <Check size={12} color={theme.colors.text.primary} strokeWidth={3.4} />
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: TILE,
    height: TILE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    width: TILE_VISUAL,
    height: TILE_VISUAL,
    margin: TILE_GAP / 2,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...theme.shadows.tile,
  },
  cross: { borderRadius: 20 },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  sprite: {
    width: TILE_SPRITE,
    height: TILE_SPRITE,
    resizeMode: 'contain',
  },
  checkBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const FruitTile = React.memo(FruitTileBase);
export default FruitTile;
