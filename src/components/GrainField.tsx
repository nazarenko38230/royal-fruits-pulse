import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { mulberry32 } from '../utils/rng';

type Props = {
  width: number;
  height: number;
  count?: number;
  seed?: number;
};

/**
 * Static decor for the loader: a seeded grain field plus one soft radial blob.
 *
 * Mounts once, never animates, and is memoised on its props - a perpetual
 * animation here would keep the window busy and block `uiautomator dump`.
 * It is also what gives the splash its own texture band, so the loader frame
 * can never hash-match the menu frame.
 */
export const GrainField = React.memo(function GrainField({
  width,
  height,
  count = 420,
  seed = 90210,
}: Props) {
  const dots = useMemo(() => {
    const rnd = mulberry32(seed);
    const out: { cx: number; cy: number; r: number; o: number }[] = [];
    for (let i = 0; i < count; i += 1) {
      out.push({
        cx: rnd() * width,
        cy: rnd() * height,
        r: 0.8 + rnd() * 0.8,
        o: 0.03 + rnd() * 0.06,
      });
    }
    return out;
  }, [count, height, seed, width]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="blob" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#A23E68" stopOpacity="0.30" />
            <Stop offset="1" stopColor="#A23E68" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx={width * 0.5} cy={height * 0.38} rx={210} ry={210} fill="url(#blob)" />
        {dots.map((d, i) => (
          <Circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill="#FFF1DD"
            fillOpacity={d.o}
          />
        ))}
      </Svg>
    </View>
  );
});

export default GrainField;
