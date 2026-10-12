import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronLeft, Lightbulb, RotateCcw } from 'lucide-react-native';
import theme from '../constants/theme';
import {
  BOARD_FRAME,
  CELLS,
  CONTROLS_H,
  SCREEN_H,
  SCREEN_W,
  TILE,
} from '../constants/config';
import { IMAGES } from '../assets';
import useOrchard from '../hooks/useOrchard';
import type { RoundResult } from '../hooks/useOrchard';
import ScreenHeader from '../components/ScreenHeader';
import IconButton from '../components/IconButton';
import CrownsBadge from '../components/CrownsBadge';
import PulseBoard from '../components/PulseBoard';
import StatStrip from '../components/StatStrip';
import TargetPreview from '../components/TargetPreview';
import SecondaryButton from '../components/SecondaryButton';
import TutorialPanel from '../components/TutorialPanel';
import type { Spotlight } from '../components/TutorialPanel';

type Rect = { x: number; y: number; width: number; height: number };

type Props = {
  level: number;
  crowns: number;
  showTutorial: boolean;
  onTutorialDone: () => void;
  onGameOver: (result: RoundResult) => void;
  onExit: () => void;
};

const CENTRE_CELL = 12; // row 2, col 2 of the 5x5 grid
const TUTORIAL_STEPS = 2;

/**
 * G3 - Split Panel.
 * Header (72 + 44 status inset) -> board area (flex) -> stat strip -> controls.
 * No ScrollView wrapper anywhere (rule #3).
 */
export function GameScreen({
  level,
  crowns,
  showTutorial,
  onTutorialDone,
  onGameOver,
  onExit,
}: Props) {
  const orchard = useOrchard(level, onGameOver);
  const enter = useRef(new Animated.Value(0)).current;

  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialOpen, setTutorialOpen] = useState(showTutorial);
  const stepRef = useRef(0);

  const [areaY, setAreaY] = useState(0);
  const [controlsY, setControlsY] = useState(0);
  const [boardRect, setBoardRect] = useState<Rect | null>(null);
  const [previewRect, setPreviewRect] = useState<Rect | null>(null);

  useEffect(() => {
    const anim = Animated.timing(enter, {
      toValue: 1,
      duration: 340,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [enter]);

  const closeTutorial = useCallback(() => {
    setTutorialOpen(false);
    onTutorialDone();
  }, [onTutorialDone]);

  /* The step lives in a ref as well, so advancing never runs a side effect
     inside a state updater (React may invoke an updater more than once). */
  const advanceTutorial = useCallback(() => {
    const next = stepRef.current + 1;
    if (next >= TUTORIAL_STEPS) {
      setTutorialOpen(false);
      onTutorialDone();
      return;
    }
    stepRef.current = next;
    setTutorialStep(next);
  }, [onTutorialDone]);

  const onLayoutArea = (e: LayoutChangeEvent) => setAreaY(e.nativeEvent.layout.y);
  const onLayoutControls = (e: LayoutChangeEvent) => setControlsY(e.nativeEvent.layout.y);
  const onLayoutBoard = (e: LayoutChangeEvent) => setBoardRect(e.nativeEvent.layout);
  const onLayoutPreview = (e: LayoutChangeEvent) => setPreviewRect(e.nativeEvent.layout);

  let spotlight: Spotlight = null;
  if (tutorialStep === 0 && boardRect) {
    const col = CENTRE_CELL % 5;
    const row = Math.floor(CENTRE_CELL / 5);
    spotlight = {
      x: boardRect.x + BOARD_FRAME + col * TILE,
      y: areaY + boardRect.y + BOARD_FRAME + row * TILE,
      width: TILE,
      height: TILE,
    };
  } else if (tutorialStep === 1 && previewRect) {
    spotlight = {
      x: previewRect.x + 16,
      y: controlsY + previewRect.y + 16,
      width: previewRect.width,
      height: previewRect.height,
    };
  }

  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const settling = orchard.status !== 'playing';
  const failed = settling && orchard.outcome !== null && orchard.outcome !== 'win';

  const handleTap = useCallback(
    (cell: number) => {
      if (tutorialOpen) {
        advanceTutorial();
      }
      orchard.tap(cell);
    },
    [advanceTutorial, orchard, tutorialOpen],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Image source={IMAGES.bgGame} style={styles.bg} />
      <LinearGradient
        colors={theme.gradients.gameVeil}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader
        title={`ORCHARD ${orchard.cfg.level}`}
        subtitle={orchard.cfg.label}
        leftSlot={<IconButton Icon={ChevronLeft} onPress={onExit} label="Back to menu" />}
        rightSlot={<CrownsBadge value={crowns} compact />}
      />

      <Animated.View
        pointerEvents="box-none"
        onLayout={onLayoutArea}
        style={[styles.area, { opacity: enter, transform: [{ translateY: rise }] }]}>
        <PulseBoard
          board={orchard.board}
          target={orchard.target}
          hinted={orchard.hinted}
          locked={settling}
          pulse={orchard.pulse}
          shakeSeq={orchard.shakeSeq}
          bloomSeq={orchard.bloomSeq}
          failed={failed}
          onTapCell={handleTap}
          onLayoutBoard={onLayoutBoard}
        />
      </Animated.View>

      <StatStrip
        movesLeft={orchard.movesLeft}
        matched={orchard.matched}
        total={CELLS}
        mistakes={orchard.mistakes}
      />

      <View style={styles.controls} onLayout={onLayoutControls}>
        <TargetPreview
          target={orchard.target}
          onPress={tutorialOpen ? advanceTutorial : undefined}
          onLayoutCard={onLayoutPreview}
        />

        <View style={styles.actions}>
          <SecondaryButton
            label="HINT"
            Icon={Lightbulb}
            tint={theme.colors.accent.secondary}
            background="rgba(245,185,75,0.18)"
            borderColor={theme.colors.accent.secondary}
            trailing={`${orchard.hintsLeft}/3`}
            height={52}
            disabled={orchard.hintsLeft <= 0 || settling}
            onPress={orchard.hint}
          />
          <View style={styles.actionGap} />
          <SecondaryButton
            label="RESTART"
            Icon={RotateCcw}
            height={52}
            onPress={orchard.restart}
          />
        </View>
      </View>

      <TutorialPanel
        visible={tutorialOpen}
        step={tutorialStep}
        spotlight={spotlight}
        onAdvance={advanceTutorial}
        onSkip={closeTutorial}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg.primary },
  bg: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_W,
    height: SCREEN_H,
    resizeMode: 'cover',
  },
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    height: CONTROLS_H,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    backgroundColor: theme.colors.bg.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,241,221,0.14)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 14,
  },
  /* flex:1 on the SLOT only - the buttons inside use width:'100%' (rule #19a). */
  actions: { flex: 1, justifyContent: 'center' },
  actionGap: { height: 10 },
});

export default GameScreen;
