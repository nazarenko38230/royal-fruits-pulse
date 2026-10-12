import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ASSIST_STEP_MS,
  CELLS,
  ENGAGED_MS,
  HINTS_PER_LEVEL,
  IDLE_BACKSTOP_MS,
  INPUT_LOCK_MS,
  MAX_MISTAKES,
  MIN_MS_FROM_MOUNT,
  RESULT_COMMIT_FLOOR_MS,
  SETTLE_FLOURISH_MS,
  crownsFor,
  starsFor,
} from '../constants/config';
import { buildOrchard } from '../game/levels';
import { countMatched, hintCell, isSolved, resolveTap } from '../game/pulse';

export type Outcome = 'win' | 'moves' | 'mistakes';
export type Status = 'playing' | 'settling' | 'done';

export type RoundResult = {
  outcome: Outcome;
  level: number;
  stars: number;
  movesLeft: number;
  mistakes: number;
  crownsEarned: number;
};

export type PulseEvent = { cell: number; seq: number };

type TimerRef = React.MutableRefObject<ReturnType<typeof setTimeout> | null>;

const clearTimer = (ref: TimerRef) => {
  if (ref.current) {
    clearTimeout(ref.current);
    ref.current = null;
  }
};

/**
 * Owns the whole round: the residual vector, the counters, and the three
 * headless-capture timers (assist / idle backstop / result-commit floor).
 *
 * Every value a timer reads lives in a ref, never in state (rule #8) - a
 * setTimeout closure created on mount would otherwise capture stale counters.
 */
export function useOrchard(level: number, onGameOver: (r: RoundResult) => void) {
  const initial = useMemo(() => buildOrchard(level), [level]);

  const [board, setBoard] = useState<number[]>(initial.board);
  const [remaining, setRemaining] = useState<number[]>(initial.remaining);
  const [movesLeft, setMovesLeft] = useState(initial.cfg.moves);
  const [mistakes, setMistakes] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(HINTS_PER_LEVEL);
  const [status, setStatus] = useState<Status>('playing');
  const [hinted, setHinted] = useState(-1);
  const [pulse, setPulse] = useState<PulseEvent>({ cell: -1, seq: 0 });
  const [shakeSeq, setShakeSeq] = useState(0);
  const [bloomSeq, setBloomSeq] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const boardRef = useRef<number[]>(initial.board);
  const remainingRef = useRef<number[]>(initial.remaining);
  const movesRef = useRef(initial.cfg.moves);
  const mistakesRef = useRef(0);
  const hintsRef = useRef(HINTS_PER_LEVEL);
  const statusRef = useRef<Status>('playing');
  const lockedRef = useRef(false);
  const mountedAtRef = useRef(Date.now());
  const coloursRef = useRef(initial.colours);

  const assistRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backstopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const clearAll = useCallback(() => {
    clearTimer(assistRef);
    clearTimer(backstopRef);
    clearTimer(lockRef);
    clearTimer(hintRef);
  }, []);

  /* ------------------------------------------------------------------ */
  /* Round termination                                                   */
  /* ------------------------------------------------------------------ */

  const finish = useCallback(
    (result: Outcome) => {
      if (statusRef.current !== 'playing') {
        return;
      }
      statusRef.current = 'settling';
      setStatus('settling');
      setOutcome(result);
      setHinted(-1);
      clearAll();

      if (result === 'win') {
        setBloomSeq(s => s + 1);
      }

      const cfg = initial.cfg;
      const mv = Math.max(0, movesRef.current);
      const ms = mistakesRef.current;
      const payload: RoundResult = {
        outcome: result,
        level: cfg.level,
        stars: result === 'win' ? starsFor(mv, ms, cfg.slack) : 0,
        movesLeft: mv,
        mistakes: ms,
        crownsEarned: result === 'win' ? crownsFor(mv, ms) : 0,
      };

      // Hold the finished board on screen until the round is old enough for the
      // capture window - otherwise a fast blind loss replaces the only gameplay
      // frame with a result card a few seconds after launch.
      const age = Date.now() - mountedAtRef.current;
      const hold = Math.max(SETTLE_FLOURISH_MS, RESULT_COMMIT_FLOOR_MS - age);
      clearTimer(settleRef);
      settleRef.current = setTimeout(() => {
        statusRef.current = 'done';
        setStatus('done');
        onGameOverRef.current(payload);
      }, hold);
    },
    [clearAll, initial.cfg],
  );

  /* ------------------------------------------------------------------ */
  /* Timers                                                              */
  /* ------------------------------------------------------------------ */

  const armBackstop = useCallback(
    (human: boolean) => {
      clearTimer(backstopRef);
      const sinceMount = Date.now() - mountedAtRef.current;
      const delay = human
        ? Math.max(ENGAGED_MS, MIN_MS_FROM_MOUNT - sinceMount)
        : Math.max(ENGAGED_MS, IDLE_BACKSTOP_MS - sinceMount);
      backstopRef.current = setTimeout(() => {
        if (statusRef.current === 'playing') {
          finish('moves');
        }
      }, delay);
    },
    [finish],
  );

  /**
   * Assist: after this much input silence, play ONE correct tap and re-arm.
   * A real player taps every 1-3s so it never fires for a human; a passive
   * capture run sees the board visibly progress instead of sitting frozen.
   */
  const armAssistRef = useRef<() => void>(() => {});
  const applyTapRef = useRef<(cell: number, human: boolean) => void>(() => {});

  const applyTap = useCallback(
    (cell: number, human: boolean) => {
      if (statusRef.current !== 'playing') {
        return;
      }
      if (human && lockedRef.current) {
        return;
      }
      if (cell < 0 || cell >= CELLS) {
        return;
      }

      const colours = coloursRef.current;
      const res = resolveTap(boardRef.current, remainingRef.current, cell, colours);
      boardRef.current = res.board;
      remainingRef.current = res.remaining;
      movesRef.current -= 1;

      setBoard(res.board);
      setRemaining(res.remaining);
      setMovesLeft(movesRef.current);
      setHinted(-1);
      setPulse(p => ({ cell, seq: p.seq + 1 }));

      if (res.mistake) {
        mistakesRef.current += 1;
        setMistakes(mistakesRef.current);
        setShakeSeq(s => s + 1);
        lockedRef.current = true;
        clearTimer(lockRef);
        lockRef.current = setTimeout(() => {
          lockedRef.current = false;
        }, INPUT_LOCK_MS);
      }

      if (isSolved(res.remaining)) {
        finish('win');
        return;
      }
      if (mistakesRef.current >= MAX_MISTAKES) {
        finish('mistakes');
        return;
      }
      if (movesRef.current <= 0) {
        finish('moves');
        return;
      }

      armBackstop(human);
      armAssistRef.current();
    },
    [armBackstop, finish],
  );

  useEffect(() => {
    applyTapRef.current = applyTap;
  }, [applyTap]);

  const armAssist = useCallback(() => {
    clearTimer(assistRef);
    assistRef.current = setTimeout(() => {
      if (statusRef.current !== 'playing') {
        return;
      }
      const next = hintCell(remainingRef.current);
      if (next >= 0) {
        applyTapRef.current(next, false);
      }
    }, ASSIST_STEP_MS);
  }, []);

  useEffect(() => {
    armAssistRef.current = armAssist;
  }, [armAssist]);

  /* ------------------------------------------------------------------ */
  /* Public API                                                          */
  /* ------------------------------------------------------------------ */

  const tap = useCallback((cell: number) => applyTapRef.current(cell, true), []);

  const hint = useCallback(() => {
    if (statusRef.current !== 'playing' || hintsRef.current <= 0) {
      return;
    }
    const cell = hintCell(remainingRef.current);
    if (cell < 0) {
      return;
    }
    hintsRef.current -= 1;
    setHintsLeft(hintsRef.current);
    setHinted(cell);
    clearTimer(hintRef);
    hintRef.current = setTimeout(() => setHinted(-1), 1400);
    armBackstop(true);
    armAssist();
  }, [armAssist, armBackstop]);

  const restart = useCallback(() => {
    clearAll();
    clearTimer(settleRef);
    const fresh = buildOrchard(level);
    boardRef.current = fresh.board;
    remainingRef.current = fresh.remaining;
    movesRef.current = fresh.cfg.moves;
    mistakesRef.current = 0;
    coloursRef.current = fresh.colours;
    lockedRef.current = false;
    statusRef.current = 'playing';
    // RESTART re-arms every failsafe, mount clock included.
    mountedAtRef.current = Date.now();

    setBoard(fresh.board);
    setRemaining(fresh.remaining);
    setMovesLeft(fresh.cfg.moves);
    setMistakes(0);
    hintsRef.current = HINTS_PER_LEVEL;
    setHintsLeft(HINTS_PER_LEVEL);
    setStatus('playing');
    setHinted(-1);
    setOutcome(null);
    setPulse(p => ({ cell: -1, seq: p.seq + 1 }));

    armBackstop(false);
    armAssist();
  }, [armAssist, armBackstop, clearAll, level]);

  /* Mount / level change -------------------------------------------- */
  useEffect(() => {
    boardRef.current = initial.board;
    remainingRef.current = initial.remaining;
    movesRef.current = initial.cfg.moves;
    mistakesRef.current = 0;
    coloursRef.current = initial.colours;
    lockedRef.current = false;
    statusRef.current = 'playing';
    mountedAtRef.current = Date.now();

    setBoard(initial.board);
    setRemaining(initial.remaining);
    setMovesLeft(initial.cfg.moves);
    setMistakes(0);
    hintsRef.current = HINTS_PER_LEVEL;
    setHintsLeft(HINTS_PER_LEVEL);
    setStatus('playing');
    setHinted(-1);
    setOutcome(null);

    armBackstop(false);
    armAssist();

    return () => {
      clearAll();
      clearTimer(settleRef);
    };
  }, [armAssist, armBackstop, clearAll, initial]);

  const matched = useMemo(
    () => countMatched(board, initial.target),
    [board, initial.target],
  );

  return {
    cfg: initial.cfg,
    colours: initial.colours,
    target: initial.target,
    board,
    remaining,
    movesLeft,
    mistakes,
    hintsLeft,
    status,
    outcome,
    hinted,
    pulse,
    shakeSeq,
    bloomSeq,
    matched,
    tap,
    hint,
    restart,
  };
}

export default useOrchard;
