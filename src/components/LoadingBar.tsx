import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../constants/theme';

type Props = {
  durationMs: number;
  width?: number;
};

/**
 * Loader progress bar.
 *
 * `width` is a LAYOUT prop, so useNativeDriver must stay false here - and that
 * is exactly why the tween is short (LOADER_BAR_ANIM_MS, ~1.2s) rather than the
 * full 8s splash: a JS-driven tween running for the whole life of the screen
 * keeps the window non-idle and wedges the capture agent. It finishes early and
 * the window goes idle well before the first screenshot.
 */
export function LoadingBar({ durationMs, width = 200 }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [durationMs, progress]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  return (
    <View style={[styles.track, { width }]}>
      <Animated.View style={[styles.fillWrap, { width: barWidth }]}>
        <LinearGradient
          colors={theme.gradients.bar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,241,221,0.14)',
    overflow: 'hidden',
  },
  fillWrap: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { flex: 1, borderRadius: 4 },
});

export default LoadingBar;
