/**
 * Level construction — CONSTRUCTIVE, never generate-then-reject.
 *
 * 1. The target pattern is authored (fixed table below), not random.
 * 2. A seeded solution S is picked: a set of cells, each owing 1..N-1 taps,
 *    summing to the level's tap budget L.
 * 3. The START board is derived by applying the INVERSE of S to the target.
 *
 * Because pulses commute, replaying S on the start board lands exactly on the
 * target in exactly L taps. Solvability is structural, not hoped for.
 */
import { CELLS, LEVELS, LevelCfg } from '../constants/config';
import { applyPulse } from './pulse';
import { mulberry32, seededShuffle } from '../utils/rng';

/** 25-entry colour-index tables, one per level. Authored for visual legibility. */
const TARGETS: number[][] = [
  // 1 — soft checker, 3 colours
  [0, 1, 0, 1, 0, 1, 2, 1, 2, 1, 0, 1, 0, 1, 0, 1, 2, 1, 2, 1, 0, 1, 0, 1, 0],
  // 2 — diagonal stripes, 3 colours
  [0, 1, 2, 0, 1, 1, 2, 0, 1, 2, 2, 0, 1, 2, 0, 0, 1, 2, 0, 1, 1, 2, 0, 1, 2],
  // 3 — framed core, 3 colours
  [2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 0, 1, 0, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2],
  // 4 — quadrants, 4 colours
  [0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 2, 2, 3, 3, 3, 2, 2, 3, 3, 3, 2, 2, 3, 3, 3],
  // 5 — full diagonal ring, 4 colours
  [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0],
  // 6 — royal cross, 4 colours
  [3, 3, 0, 3, 3, 3, 3, 0, 3, 3, 0, 0, 1, 0, 0, 3, 3, 0, 3, 3, 3, 3, 0, 3, 3],
  // 7 — concentric rings, 4 colours
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 2, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  // 8 — crown lattice, 4 colours
  [0, 3, 0, 3, 0, 3, 1, 2, 1, 3, 0, 2, 0, 2, 0, 3, 1, 2, 1, 3, 0, 3, 0, 3, 0],
];

export type Orchard = {
  cfg: LevelCfg;
  board: number[];
  target: number[];
  remaining: number[];
  colours: number;
};

export function levelConfig(level: number): LevelCfg {
  const clamped = Math.min(Math.max(level, 1), LEVELS.length);
  return LEVELS[clamped - 1];
}

export function buildOrchard(level: number): Orchard {
  const cfg = levelConfig(level);
  const colours = cfg.colours;
  const target = TARGETS[cfg.level - 1].slice();
  const rnd = mulberry32(cfg.seed);

  // Step 2 — the solution vector.
  const remaining = new Array<number>(CELLS).fill(0);
  const order = seededShuffle(
    Array.from({ length: CELLS }, (_, i) => i),
    rnd,
  );
  let left = cfg.solutionTaps;
  let k = 0;
  while (left > 0 && k < order.length) {
    const cell = order[k];
    k += 1;
    const maxTaps = Math.min(colours - 1, left);
    const taps = 1 + Math.floor(rnd() * maxTaps);
    remaining[cell] = taps;
    left -= taps;
  }

  // Step 3 — derive the start board by applying the inverse of the solution.
  const board = target.slice();
  for (let cell = 0; cell < CELLS; cell += 1) {
    const taps = remaining[cell];
    if (taps === 0) {
      continue;
    }
    const inverse = (colours - taps) % colours;
    for (let q = 0; q < inverse; q += 1) {
      applyPulse(board, cell, colours);
    }
  }

  return { cfg, board, target, remaining, colours };
}

/** Colour-index table of a level's target — used by the menu preview tiles. */
export const targetOf = (level: number) => TARGETS[levelConfig(level).level - 1];
