import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Info, TreePine, Zap } from 'lucide-react-native';
import theme from '../constants/theme';
import { DIFFICULTIES, SCREEN_H, SCREEN_W, TOTAL_LEVELS } from '../constants/config';
import { IMAGES } from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import CrownsBadge from '../components/CrownsBadge';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Chip from '../components/Chip';
import LevelSelectPanel from '../components/LevelSelectPanel';

type Props = {
  crowns: number;
  unlockedLevel: number;
  starsByLevel: Record<number, number>;
  onStart: (level: number) => void;
  onOpenTutorial: () => void;
};

/**
 * M2 - Bottom-Sheet.
 *
 * The top of the screen is pure character art; every control lives in a clay
 * sheet anchored to the bottom. START PULSE is the ONLY node on this screen
 * containing PLAY or START (rule #11a), and it sits low on the screen where
 * the capture harness sweeps for a CTA.
 */
export function MenuScreen({
  crowns,
  unlockedLevel,
  starsByLevel,
  onStart,
  onOpenTutorial,
}: Props) {
  const hero = useRef(new Animated.Value(0)).current;
  const sheet = useRef(new Animated.Value(0)).current;
  const cta = useRef(new Animated.Value(0.94)).current;
  const [levelsOpen, setLevelsOpen] = useState(false);

  const activeDifficulty = useMemo(() => {
    let key = DIFFICULTIES[0].key;
    for (let i = 0; i < DIFFICULTIES.length; i += 1) {
      if (unlockedLevel >= DIFFICULTIES[i].startLevel) {
        key = DIFFICULTIES[i].key;
      }
    }
    return key;
  }, [unlockedLevel]);

  const [difficulty, setDifficulty] = useState(activeDifficulty);

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(hero, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(180),
        Animated.spring(sheet, {
          toValue: 1,
          useNativeDriver: true,
          ...theme.animation.sheet,
        }),
      ]),
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(cta, {
          toValue: 1,
          useNativeDriver: true,
          ...theme.animation.entrance,
        }),
      ]),
    ]);
    anim.start();
    return () => anim.stop();
  }, [hero, sheet, cta]);

  const heroRise = hero.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });
  const sheetRise = sheet.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });

  /** Resume at the furthest orchard the player has reached INSIDE the chosen
   *  band, so START never drops someone back to level 1 once they are past it. */
  const startLevel = () => {
    const i = DIFFICULTIES.findIndex(d => d.key === difficulty);
    const band = DIFFICULTIES[i < 0 ? 0 : i];
    const next = DIFFICULTIES[i + 1];
    const bandEnd = next ? next.startLevel - 1 : TOTAL_LEVELS;
    const target = Math.min(Math.max(unlockedLevel, band.startLevel), bandEnd);
    onStart(Math.min(target, unlockedLevel));
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground source={IMAGES.bgMenu} style={styles.bg} resizeMode="cover">
        <LinearGradient
          colors={theme.gradients.menuVeil}
          locations={[0, 0.46, 0.72]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <ScreenHeader bare rightSlot={<CrownsBadge value={crowns} />} />

        <Animated.View
          pointerEvents="none"
          style={[styles.heroZone, { opacity: hero, transform: [{ translateY: heroRise }] }]}
        />

        <Animated.View
          pointerEvents="box-none"
          style={[styles.sheet, { transform: [{ translateY: sheetRise }] }]}>
          <Text style={styles.title} numberOfLines={2}>
            ROYAL FRUITS PULSE
          </Text>
          <Text style={styles.tagline} numberOfLines={1}>
            PASS THE PULSE - MATCH THE CROWN
          </Text>

          <View style={styles.chips} pointerEvents="box-none">
            {DIFFICULTIES.map(d => (
              <Chip
                key={d.key}
                label={d.label}
                active={difficulty === d.key}
                dotColor={
                  d.key === 'GENTLE'
                    ? theme.colors.accent.success
                    : d.key === 'ROYAL'
                    ? theme.colors.accent.secondary
                    : theme.colors.accent.primary
                }
                onPress={() => {
                  if (unlockedLevel >= d.startLevel) {
                    setDifficulty(d.key);
                  }
                }}
              />
            ))}
          </View>

          {/* Hint sits ABOVE the CTA (rule #19) - a button shadow below would clip it. */}
          <Text style={styles.hint} numberOfLines={2}>
            TAP A FRUIT - IT SHIFTS ITSELF AND 4 NEIGHBOURS
          </Text>

          <Animated.View pointerEvents="box-none" style={{ transform: [{ scale: cta }] }}>
            <PrimaryButton label="START PULSE" Icon={Zap} onPress={startLevel} height={62} />
          </Animated.View>

          <View style={styles.secondaryRow} pointerEvents="box-none">
            <View style={styles.secondarySlot}>
              <SecondaryButton
                label="ORCHARDS"
                Icon={TreePine}
                tint={theme.colors.text.primary}
                onPress={() => setLevelsOpen(true)}
                height={52}
              />
            </View>
            <View style={styles.secondarySlot}>
              <SecondaryButton
                label="HOW IT WORKS"
                Icon={Info}
                tint={theme.colors.text.primary}
                onPress={onOpenTutorial}
                height={52}
              />
            </View>
          </View>
        </Animated.View>
      </ImageBackground>

      <LevelSelectPanel
        visible={levelsOpen}
        unlockedLevel={unlockedLevel}
        starsByLevel={starsByLevel}
        onSelect={level => {
          setLevelsOpen(false);
          onStart(level);
        }}
        onClose={() => setLevelsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg.primary },
  bg: { flex: 1, width: SCREEN_W, height: SCREEN_H },
  heroZone: { flex: 1 },
  sheet: {
    backgroundColor: theme.colors.bg.surface,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,241,221,0.14)',
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.2,
    lineHeight: 36,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  tagline: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    lineHeight: 16,
    textAlign: 'center',
    color: 'rgba(255,241,221,0.6)',
  },
  chips: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 18,
  },
  hint: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 15,
    textAlign: 'center',
    color: 'rgba(255,241,221,0.45)',
  },
  secondaryRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  secondarySlot: { flex: 1 },
});

export default MenuScreen;
