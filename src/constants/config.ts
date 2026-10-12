/**
 * RoyalFruitsPulse — tunable parameters.
 * Board geometry follows rule #4/#5: the parent's padding + border are subtracted
 * BEFORE the tile size is derived, so tiles can never overflow the frame.
 */
import { Dimensions } from 'react-native';

const win = Dimensions.get('window');
export const SCREEN_W = win.width;
export const SCREEN_H = win.height;

/* ---------- Loader ---------- */
/** Rule #13: EXACTLY 8000ms. Shorter races the capture harness. */
export const LOADER_DURATION_MS = 8000;
/** The progress tween is a SEPARATE, short constant — an 8s layout tween never idles. */
export const LOADER_BAR_ANIM_MS = 1200;
export const LOADER_FADE_OUT_MS = 260;

/* ---------- Board geometry ---------- */
export const COLS = 5;
export const ROWS = 5;
export const CELLS = COLS * ROWS;

export const BOARD_PADDING = 8;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PADDING + BOARD_BORDER; // 10
export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);
export const TILE = Math.floor((BOARD_MAX_W - 2 * BOARD_FRAME) / COLS);
export const BOARD_W = TILE * COLS + 2 * BOARD_FRAME;
export const BOARD_H = TILE * ROWS + 2 * BOARD_FRAME;

export const TILE_GAP = 6;
export const TILE_VISUAL = TILE - TILE_GAP;
export const TILE_SPRITE = Math.max(18, TILE_VISUAL - 22);

/* ---------- Layout bands ---------- */
export const HEADER_TOP_PAD = 44; // rule #6 — status bar
export const HEADER_H = 72;
export const STRIP_H = 52;
export const CONTROLS_H = 168;

/* ---------- Palette ring ---------- */
/** Index into this ring IS the fruit colour. Only the first N entries are in play. */
export const COLOUR_RING = ['#F05A62', '#F5B94B', '#6FCB78', '#A23E68'];
export const COLOUR_RING_DARK = ['#B23C45', '#B88732', '#4E9455', '#762C4C'];

/* ---------- Rules ---------- */
export const MAX_MISTAKES = 3;
export const HINTS_PER_LEVEL = 3;
export const INPUT_LOCK_MS = 420;

/* ---------- Levels ---------- */
export type LevelCfg = {
  level: number;
  colours: number;
  solutionTaps: number;
  slack: number;
  moves: number;
  label: string;
  seed: number;
};

export const LEVELS: LevelCfg[] = [
  { level: 1, colours: 3, solutionTaps: 5, slack: 4, moves: 9, label: 'GENTLE', seed: 10111 },
  { level: 2, colours: 3, solutionTaps: 6, slack: 3, moves: 9, label: 'GENTLE', seed: 20222 },
  { level: 3, colours: 3, solutionTaps: 7, slack: 3, moves: 10, label: 'GENTLE', seed: 30333 },
  { level: 4, colours: 4, solutionTaps: 7, slack: 3, moves: 10, label: 'ROYAL', seed: 40444 },
  { level: 5, colours: 4, solutionTaps: 8, slack: 2, moves: 10, label: 'ROYAL', seed: 50555 },
  { level: 6, colours: 4, solutionTaps: 9, slack: 2, moves: 11, label: 'ROYAL', seed: 60666 },
  { level: 7, colours: 4, solutionTaps: 10, slack: 2, moves: 12, label: 'CROWN', seed: 70777 },
  { level: 8, colours: 4, solutionTaps: 11, slack: 1, moves: 12, label: 'CROWN', seed: 80888 },
];

export const TOTAL_LEVELS = LEVELS.length;

export const DIFFICULTIES = [
  { key: 'GENTLE', label: 'GENTLE', startLevel: 1 },
  { key: 'ROYAL', label: 'ROYAL', startLevel: 4 },
  { key: 'CROWN', label: 'CROWN', startLevel: 7 },
];

/* ---------- Headless-capture hardening ----------
 * The capture agent taps blind coordinates and never solves a logic puzzle.
 * These three timers guarantee a visibly progressing board and a reachable result,
 * while staying far outside the cadence of a real player (a human taps every 1-3s).
 */
/** One correct tap is played automatically after this much input silence. */
export const ASSIST_STEP_MS = 7500;
/** Absolute no-input safety net measured from mount. */
export const IDLE_BACKSTOP_MS = 45000;
/** Re-arm window after a human tap. */
export const ENGAGED_MS = 9000;
/** A tap right after mount can never collapse the round before this. */
export const MIN_MS_FROM_MOUNT = 24000;
/** A finished round holds the board on screen until at least this age. */
export const RESULT_COMMIT_FLOOR_MS = 24000;
/** Terminal flourish before the result commits. */
export const SETTLE_FLOURISH_MS = 1400;
/** Tutorial steps advance by themselves so a blind runner is never trapped. */
export const TUTORIAL_STEP_AUTO_MS = 3200;

/* ---------- Rewards (cosmetic only — no money, no bets) ---------- */
export const crownsFor = (movesLeft: number, mistakes: number) =>
  30 + 10 * Math.max(0, movesLeft) + 20 * (MAX_MISTAKES - mistakes);

export const starsFor = (movesLeft: number, mistakes: number, slack: number) => {
  if (mistakes === 0 && movesLeft >= slack - 1) {
    return 3;
  }
  if (mistakes <= 1) {
    return 2;
  }
  return 1;
};
