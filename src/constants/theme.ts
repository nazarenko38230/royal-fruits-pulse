/**
 * RoyalFruitsPulse — design system.
 * Preset: CANDY_SWEET (rule #11b — the `name` key is the preset key verbatim).
 * Only the colour VALUES are overridden to the brief's royal-plum set.
 * Style: CLAYMORPHISM — puffy surfaces, radii 20-34, double shadow, no glass.
 */

export const theme = {
  name: 'CANDY_SWEET',

  colors: {
    bg: {
      deep: '#1C0A1E',
      primary: '#3A1838',
      surface: '#4C2049',
      surfaceAlt: '#A23E68',
      board: 'rgba(28,10,30,0.62)',
      strip: 'rgba(28,10,30,0.72)',
      header: 'rgba(28,10,30,0.55)',
      scrim: 'rgba(28,10,30,0.86)',
    },
    accent: {
      primary: '#F05A62',
      secondary: '#F5B94B',
      success: '#6FCB78',
      plum: '#A23E68',
      goldDark: '#D99B2E',
    },
    text: {
      primary: '#FFF1DD',
      secondary: 'rgba(255,241,221,0.62)',
      muted: 'rgba(255,241,221,0.42)',
      onGold: '#3A1838',
    },
    ui: {
      hairline: 'rgba(255,241,221,0.14)',
      border: 'rgba(255,241,221,0.18)',
      fill: 'rgba(255,241,221,0.09)',
      fillSoft: 'rgba(255,241,221,0.06)',
      highlight: 'rgba(255,241,221,0.26)',
    },
  },

  gradients: {
    loader: ['#1C0A1E', '#3A1838', '#240F26'],
    menuVeil: ['rgba(58,24,56,0)', 'rgba(58,24,56,0.45)', 'rgba(42,15,42,0.96)'],
    gameVeil: ['rgba(42,15,42,0.72)', 'rgba(58,24,56,0.88)'],
    cta: ['#F05A62', '#A23E68'],
    gold: ['#F5B94B', '#D99B2E'],
    bar: ['#F05A62', '#F5B94B'],
    tile: ['#A23E68', '#F05A62'],
    win: ['#3A1838', '#6B2A52', '#2A0F2A'],
    loss: ['#2A0F2A', '#4A1C3C', '#1C0A1E'],
  },

  typography: {
    hero: { fontSize: 38, fontWeight: '900' as const, letterSpacing: 4 },
    title: { fontSize: 30, fontWeight: '900' as const, letterSpacing: 1.6 },
    button: { fontSize: 19, fontWeight: '900' as const, letterSpacing: 2 },
    body: { fontSize: 15, fontWeight: '700' as const, letterSpacing: 0.2 },
    caption: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 2 },
    number: {
      fontSize: 22,
      fontWeight: '900' as const,
      fontVariant: ['tabular-nums' as const],
    },
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },

  radius: { sm: 12, md: 20, lg: 26, xl: 32, pill: 100 },

  shadows: {
    clay: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.45,
      shadowRadius: 24,
      elevation: 10,
    },
    clayUp: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.45,
      shadowRadius: 22,
      elevation: 12,
    },
    tile: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.38,
      shadowRadius: 8,
      elevation: 5,
    },
    cta: {
      shadowColor: '#F05A62',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 18,
      elevation: 12,
    },
    gold: {
      shadowColor: '#F5B94B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
      elevation: 10,
    },
  },

  animation: {
    entrance: { tension: 42, friction: 7 },
    sheet: { tension: 50, friction: 9 },
    press: { tension: 300, friction: 12 },
    pulse: { tension: 220, friction: 9 },
    badge: { tension: 40, friction: 6 },
  },
};

export type Theme = typeof theme;
export default theme;
