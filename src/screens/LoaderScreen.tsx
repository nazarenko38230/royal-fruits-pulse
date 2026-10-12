import React, { useEffect, useRef } from 'react';
import { Animated, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../constants/theme';
import {
  LOADER_BAR_ANIM_MS,
  LOADER_DURATION_MS,
  LOADER_FADE_OUT_MS,
  SCREEN_H,
  SCREEN_W,
} from '../constants/config';
import { IMAGES } from '../assets';
import GrainField from '../components/GrainField';
import LoadingBar from '../components/LoadingBar';

type Props = { onDone: () => void };

/**
 * Splash.
 *
 * Rule #14 - this screen must not hash-match the menu: it is a cold, dark
 * gradient with a seeded grain field, no chips, no sheet and no call-to-action
 * button anywhere. The menu is bright character art over a plum sheet.
 * Keep it non-interactive: the pre-build scan rejects a loader that carries a
 * primary call-to-action, and it matches on raw text, comments included.
 *
 * Rule #13 - LOADER_DURATION_MS is exactly 8000ms. The progress tween is a
 * separate, much shorter constant so the window still reaches idle.
 */
export function LoaderScreen({ onDone }: Props) {
  const emblem = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.sequence([
        Animated.delay(120),
        Animated.spring(emblem, {
          toValue: 1,
          useNativeDriver: true,
          ...theme.animation.entrance,
        }),
      ]),
      Animated.sequence([
        Animated.delay(320),
        Animated.timing(title, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
    ]);
    entrance.start();

    const hold = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: LOADER_FADE_OUT_MS,
        useNativeDriver: true,
      }).start(() => doneRef.current());
    }, LOADER_DURATION_MS - LOADER_FADE_OUT_MS);

    return () => {
      entrance.stop();
      clearTimeout(hold);
    };
  }, [emblem, title, fade]);

  const emblemScale = emblem.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] });
  const titleRise = title.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg.deep} />
      <LinearGradient
        colors={theme.gradients.loader}
        locations={[0, 0.52, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Image source={IMAGES.bgLoader} style={styles.bg} />
      <GrainField width={SCREEN_W} height={SCREEN_H} />

      <View style={styles.centre} pointerEvents="none">
        <Animated.View
          style={[styles.emblem, { opacity: emblem, transform: [{ scale: emblemScale }] }]}>
          <View style={styles.emblemGlint} />
          <Image source={IMAGES.crownFruit} style={styles.emblemArt} />
        </Animated.View>

        <Animated.View
          style={[styles.titleWrap, { opacity: title, transform: [{ translateY: titleRise }] }]}>
          <Text style={styles.brand}>ROYAL FRUITS</Text>
          <Text style={styles.brandSecond}>PULSE</Text>
          <Text style={styles.tagline}>MATCH THE CROWN PATTERN</Text>
        </Animated.View>
      </View>

      <View style={styles.footer} pointerEvents="none">
        <LoadingBar durationMs={LOADER_BAR_ANIM_MS} width={200} />
        <Text style={styles.loading}>LOADING</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg.deep },
  bg: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_W,
    height: SCREEN_H,
    resizeMode: 'cover',
    opacity: 0.32,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emblem: {
    width: 148,
    height: 148,
    borderRadius: 40,
    backgroundColor: '#4C2049',
    borderWidth: 2,
    borderColor: theme.colors.accent.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 14,
  },
  emblemGlint: {
    position: 'absolute',
    top: 2,
    left: 14,
    right: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,241,221,0.3)',
  },
  emblemArt: { width: 96, height: 96, resizeMode: 'contain' },
  titleWrap: { alignItems: 'center', marginTop: 30 },
  brand: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 4,
    lineHeight: 44,
    color: theme.colors.text.primary,
    textShadowColor: 'rgba(240,90,98,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  brandSecond: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 10,
    lineHeight: 28,
    color: theme.colors.accent.secondary,
  },
  tagline: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
    lineHeight: 16,
    color: 'rgba(255,241,221,0.55)',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 72,
  },
  loading: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    lineHeight: 14,
    color: 'rgba(255,241,221,0.4)',
  },
});

export default LoaderScreen;
