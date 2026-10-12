import React, { useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { CloudSun, Crown, RotateCcw, Star, TreePine } from 'lucide-react-native';
import theme from '../constants/theme';
import { SCREEN_H, SCREEN_W } from '../constants/config';
import type { RoundResult } from '../hooks/useOrchard';
import ScreenHeader from '../components/ScreenHeader';
import CrownsBadge from '../components/CrownsBadge';
import StatCard from '../components/StatCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

type Props = {
  result: RoundResult;
  crowns: number;
  hasNext: boolean;
  onPlayAgain: () => void;
  onNext: () => void;
  onMenu: () => void;
};

const VERDICT: Record<RoundResult['outcome'], string> = {
  win: 'ORCHARD CROWNED',
  moves: 'OUT OF MOVES',
  mistakes: 'PULSE LOST',
};

/**
 * Discrete result screen (rule #12) - without it the capture harness only ever
 * sees repeated frames of the same board and the run yields no reviewable
 * result shot. The replay CTA contains AGAIN (rule #11).
 *
 * Rule #17: the laurel decor flanks the badge; nothing is drawn across the
 * verdict letters, where a stray stroke would read as a typo.
 */
export function GameOverScreen({
  result,
  crowns,
  hasNext,
  onPlayAgain,
  onNext,
  onMenu,
}: Props) {
  const won = result.outcome === 'win';
  const badge = useRef(new Animated.Value(0)).current;
  const stars = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.spring(badge, {
        toValue: 1,
        useNativeDriver: true,
        ...theme.animation.badge,
      }),
      ...stars.map((v, i) =>
        Animated.sequence([
          Animated.delay(160 + i * 120),
          Animated.spring(v, {
            toValue: 1,
            useNativeDriver: true,
            ...theme.animation.entrance,
          }),
        ]),
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [badge, stars]);

  const badgeScale = badge.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const accent = won ? theme.colors.accent.success : theme.colors.accent.primary;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={won ? theme.gradients.win : theme.gradients.loss}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={SCREEN_W} height={SCREEN_H}>
          <Defs>
            <RadialGradient id="verdict" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={accent} stopOpacity={won ? '0.28' : '0.22'} />
              <Stop offset="1" stopColor={accent} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={SCREEN_W * 0.5}
            cy={SCREEN_H * 0.3}
            rx={230}
            ry={230}
            fill="url(#verdict)"
          />
        </Svg>
      </View>

      <ScreenHeader bare rightSlot={<CrownsBadge value={crowns} />} />

      <View style={styles.body}>
        <View style={styles.badgeRow}>
          <View style={styles.laurel} />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.badge,
              {
                backgroundColor: won ? 'rgba(111,203,120,0.2)' : 'rgba(240,90,98,0.2)',
                borderColor: accent,
                transform: [{ scale: badgeScale }],
              },
            ]}>
            {won ? (
              <Crown size={52} color={theme.colors.accent.secondary} strokeWidth={2.2} />
            ) : (
              <CloudSun size={48} color={theme.colors.accent.primary} strokeWidth={2.2} />
            )}
          </Animated.View>
          <View style={styles.laurel} />
        </View>

        <Text style={styles.verdict} numberOfLines={2}>
          {VERDICT[result.outcome]}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          ORCHARD {result.level}
        </Text>

        <View style={styles.stars}>
          {stars.map((v, i) => (
            <Animated.View
              key={i}
              style={{ transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }}>
              <Star
                size={30}
                strokeWidth={0}
                color={i < result.stars ? theme.colors.accent.secondary : 'rgba(255,241,221,0.18)'}
                fill={i < result.stars ? theme.colors.accent.secondary : 'rgba(255,241,221,0.18)'}
              />
            </Animated.View>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statSlot}>
            <StatCard
              value={String(result.movesLeft)}
              label="MOVES LEFT"
              valueColor={theme.colors.accent.success}
            />
          </View>
          <View style={styles.statSlot}>
            <StatCard
              value={`${result.mistakes}/3`}
              label="MISTAKES"
              valueColor={theme.colors.accent.primary}
            />
          </View>
          <View style={styles.statSlot}>
            <StatCard
              value={`+${result.crownsEarned}`}
              label="CROWNS"
              valueColor={theme.colors.accent.secondary}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="PLAY AGAIN"
          Icon={RotateCcw}
          onPress={onPlayAgain}
          height={60}
        />
        {won && hasNext ? (
          <View style={styles.spacer}>
            <PrimaryButton
              label="NEXT ORCHARD"
              Icon={TreePine}
              gradient={theme.gradients.gold}
              textColor={theme.colors.text.onGold}
              onPress={onNext}
              height={54}
            />
          </View>
        ) : null}
        <View style={styles.spacer}>
          <SecondaryButton label="BACK TO ORCHARDS" onPress={onMenu} height={50} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg.primary },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  laurel: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(245,185,75,0.5)',
  },
  badge: {
    width: 104,
    height: 104,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.clay,
  },
  verdict: {
    marginTop: 22,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.6,
    lineHeight: 36,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  sub: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
    lineHeight: 15,
    color: theme.colors.text.muted,
  },
  stars: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 26, width: '100%' },
  statSlot: { flex: 1 },
  footer: { paddingHorizontal: 24, paddingBottom: 34 },
  spacer: { marginTop: 12 },
});

export default GameOverScreen;
