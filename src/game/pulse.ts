/**
 * The pulse operator.
 *
 * Tapping cell c adds +1 (mod N) to c and to its four orthogonal neighbours.
 * Addition over Z_N is commutative, so tap ORDER never matters — only tap COUNTS.
 * That single property is what makes `remaining` (below) an exact oracle for
 * mistakes, hints and "moves still needed", with no heuristic distance metric.
 */
import { COLS, ROWS, CELLS } from '../constants/config';

export const idx = (row: number, col: number) => row * COLS + col;

/** The tapped cell plus its orthogonal neighbours, clipped at the edges. */
export function pulseCells(cell: number): number[] {
  const row = Math.floor(cell / COLS);
  const col = cell % COLS;
  const out = [cell];
  if (row > 0) {
    out.push(idx(row - 1, col));
  }
  if (row < ROWS - 1) {
    out.push(idx(row + 1, col));
  }
  if (col > 0) {
    out.push(idx(row, col - 1));
  }
  if (col < COLS - 1) {
    out.push(idx(row, col + 1));
  }
  return out;
}

/** Applies one pulse in place. */
export function applyPulse(board: number[], cell: number, colours: number): void {
  const cells = pulseCells(cell);
  for (let i = 0; i < cells.length; i += 1) {
    const c = cells[i];
    board[c] = (board[c] + 1) % colours;
  }
}

/** Pure variant — returns a new board. */
export function withPulse(board: number[], cell: number, colours: number): number[] {
  const next = board.slice();
  applyPulse(next, cell, colours);
  return next;
}

export function countMatched(board: number[], target: number[]): number {
  let n = 0;
  for (let i = 0; i < CELLS; i += 1) {
    if (board[i] === target[i]) {
      n += 1;
    }
  }
  return n;
}

export const isSolved = (remaining: number[]) => remaining.every(v => v === 0);

/** The next cell that still owes taps — exact, never a guess. */
export const hintCell = (remaining: number[]) => remaining.findIndex(v => v > 0);

export type TapOutcome = {
  board: number[];
  remaining: number[];
  mistake: boolean;
};

/**
 * Resolves one tap against the residual vector.
 * `remaining[c] > 0`  -> the tap was owed, one less to go.
 * `remaining[c] === 0` -> the tap was NOT owed; undoing it now costs N-1 more taps.
 */
export function resolveTap(
  board: number[],
  remaining: number[],
  cell: number,
  colours: number,
): TapOutcome {
  const nextRemaining = remaining.slice();
  let mistake = false;
  if (nextRemaining[cell] > 0) {
    nextRemaining[cell] -= 1;
  } else {
    nextRemaining[cell] = colours - 1;
    mistake = true;
  }
  return { board: withPulse(board, cell, colours), remaining: nextRemaining, mistake };
}
