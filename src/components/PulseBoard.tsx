import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import theme from '../constants/theme';
import {
  BOARD_BORDER,
  BOARD_H,
  BOARD_PADDING,
  BOARD_W,
  CELLS,
  COLS,
} from '../constants/config';
import { pulseCells } from '../game/pulse';
import FruitTile from './FruitTile';
import type { PulseEvent } from '../hooks/useOrchard';

type Props = {
  board: number[];
  target: number[];
  hinted: number;
  locked: boolean;
  pulse: PulseEvent;
  shakeSeq: number;
  bloomSeq: number;
  failed: boolean;
  onTapCell: (cell: number) => void;
  onLayoutBoard?: (e: LayoutChangeEvent) => void;
};

/**
 * The 5x5 orchard.
 *
 * Geometry follows rule #4: the frame (padding + border) is subtracted before
 * the tile size is derived, so TILE*COLS + 2*FRAME is exactly BOARD_W and the
 * tiles can never overflow their rounded parent.
 *
 * Every animation here is finite (<= 520ms) and driven on transform/opacity
 * only - there is no Animated.loop anywhere in this app, because the capture
 * harness needs the window to reach an idle state.
 */
export function PulseBoard({
  board,
  target,
  hinted,
  locked,
  pulse,
  shakeSeq,
  bloomSeq,
  failed,
  onTapCell,
  onLayoutBoard,
}: Props) {
  const scales = useRef(
    Array.from({ length: CELLS }, () => new Animated.Value(1)),
  ).current;
  const shake = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const desaturate = useRef(new Animated.Value(0)).current;

  /* Pulse: the tapped cell plus its four neighbours, staggered 45ms out. */
  useEffect(() => {
    if (pulse.cell < 0) {
      return;
    }
    const cells = pulseCells(pulse.cell);
    const anims = cells.map((c, i) =>
      Animated.sequence([
        Animated.delay(i === 0 ? 0 : 45),
        Animated.timing(scales[c], {
          toValue: 1.14,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.spring(scales[c], {
          toValue: 1,
          useNativeDriver: true,
          ...theme.animation.pulse,
        }),
      ]),
    );
    const group = Animated.parallel(anims);
    group.start();
    return () => group.stop();
    // The pulse SEQUENCE number is the trigger: the same cell may be tapped twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulse.seq]);

  /* Mistake: a short horizontal shake plus a red frame flash. */
  useEffect(() => {
    if (shakeSeq === 0) {
      return;
    }
    const group = Animated.parallel([
      Animated.sequence([
        Animated.timing(shake, { toValue: -9, duration: 65, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 9, duration: 65, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -5, duration: 65, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 65, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(flash, { toValue: 0.6, duration: 120, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]),
    ]);
    group.start();
    return () => group.stop();
  }, [shakeSeq, shake, flash]);

  /* Win: the 25 tiles bloom outward from the centre, 40ms apart. */
  useEffect(() => {
    if (bloomSeq === 0) {
      return;
    }
    const centre = { r: 2, c: 2 };
    const anims = scales.map((value, i) => {
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      const ring = Math.max(Math.abs(r - centre.r), Math.abs(c - centre.c));
      return Animated.sequence([
        Animated.delay(ring * 40),
        Animated.timing(value, { toValue: 1.18, duration: 180, useNativeDriver: true }),
        Animated.spring(value, {
          toValue: 1,
          useNativeDriver: true,
          ...theme.animation.pulse,
        }),
      ]);
    });
    const group = Animated.parallel(anims);
    group.start();
    return () => group.stop();
  }, [bloomSeq, scales]);

  /* Loss: the board fades toward a flat tint. */
  useEffect(() => {
    if (!failed) {
      return;
    }
    const anim = Animated.timing(desaturate, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [failed, desaturate]);

  const handleTap = useCallback((cell: number) => onTapCell(cell), [onTapCell]);

  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={onLayoutBoard}
      style={[styles.board, { transform: [{ translateX: shake }] }]}>
      <View style={styles.grid} pointerEvents="box-none">
        {board.map((colourIndex, cell) => (
          <FruitTile
            key={cell}
            cell={cell}
            colourIndex={colourIndex}
            matched={colourIndex === target[cell]}
            hinted={hinted === cell}
            locked={locked}
            scale={scales[cell]}
            onPress={handleTap}
          />
        ))}
      </View>
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
      <Animated.View pointerEvents="none" style={[styles.veil, { opacity: desaturate }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_W,
    height: BOARD_H,
    padding: BOARD_PADDING,
    borderWidth: BOARD_BORDER,
    borderColor: 'rgba(255,241,221,0.16)',
    borderRadius: 30,
    backgroundColor: theme.colors.bg.board,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 26,
    elevation: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: theme.colors.accent.primary,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    backgroundColor: 'rgba(255,241,221,0.12)',
  },
});

export default PulseBoard;
