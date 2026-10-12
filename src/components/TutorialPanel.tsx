import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { SCREEN_H, SCREEN_W, TUTORIAL_STEP_AUTO_MS } from '../constants/config';

export type Spotlight = { x: number; y: number; width: number; height: number } | null;

type Props = {
  visible: boolean;
  step: number;
  spotlight: Spotlight;
  onAdvance: () => void;
  onSkip: () => void;
};

const STEPS = [
  {
    title: 'TAP THE GLOWING FRUIT',
    body: 'IT SHIFTS ITSELF AND ITS 4 NEIGHBOURS ONE COLOUR FORWARD',
  },
  {
    title: 'MATCH THE CROWN PATTERN',
    body: 'WRONG PULSES COST MISTAKES - THREE ENDS THE ROUND',
  },
];

/**
 * Brief screen 3 (tutorial) as an in-game overlay.
 *
 * Every step ALSO advances by itself after TUTORIAL_STEP_AUTO_MS. A tutorial
 * that can only be dismissed by hitting one exact cell would trap the blind
 * capture runner on the scrim and cost the run its gameplay frame.
 */
export function TutorialPanel({ visible, step, spotlight, onAdvance, onSkip }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const advanceRef = useRef(onAdvance);

  useEffect(() => {
    advanceRef.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    if (!visible) {
      fade.setValue(0);
      return;
    }
    const anim = Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    });
    anim.start();
    const timer = setTimeout(() => advanceRef.current(), TUTORIAL_STEP_AUTO_MS);
    return () => {
      anim.stop();
      clearTimeout(timer);
    };
  }, [visible, step, fade]);

  if (!visible) {
    return null;
  }

  const copy = STEPS[Math.min(step, STEPS.length - 1)];

  return (
    <Animated.View style={[styles.root, { opacity: fade }]} pointerEvents="box-none">
      <Pressable style={styles.scrim} onPress={onAdvance} />

      {spotlight ? (
        <View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              left: spotlight.x - 6,
              top: spotlight.y - 6,
              width: spotlight.width + 12,
              height: spotlight.height + 12,
            },
          ]}
        />
      ) : null}

      <View style={styles.cardWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.stepLabel}>STEP {step + 1} OF {STEPS.length}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.body}>{copy.body}</Text>

          <View style={styles.footer}>
            <View style={styles.dots}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === step ? styles.dotActive : null]}
                />
              ))}
            </View>
            <Pressable
              onPress={onSkip}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.skip}>
              <Text style={styles.skipText}>SKIP</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,10,30,0.82)',
  },
  ring: {
    position: 'absolute',
    borderRadius: 26,
    borderWidth: 3,
    borderColor: theme.colors.accent.secondary,
    backgroundColor: 'rgba(245,185,75,0.12)',
  },
  cardWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: Math.max(120, SCREEN_H * 0.16),
    width: SCREEN_W - 48,
  },
  card: {
    borderRadius: 26,
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 2,
    borderColor: theme.colors.accent.primary,
    borderTopColor: theme.colors.accent.primary,
    padding: 18,
    ...theme.shadows.clay,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    lineHeight: 13,
    color: theme.colors.accent.secondary,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 21,
    color: theme.colors.text.primary,
  },
  body: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    lineHeight: 17,
    color: theme.colors.text.secondary,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,241,221,0.25)',
  },
  dotActive: { backgroundColor: theme.colors.accent.secondary },
  skip: { height: 32, justifyContent: 'center', paddingHorizontal: 8 },
  skipText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 18,
    color: theme.colors.text.secondary,
  },
});

export default TutorialPanel;
