/**
 * RoyalFruitsPulse - app shell.
 *
 * A plain state machine (rule #2), no @react-navigation: the four surfaces are
 * conditional renders of one `screen` value. The 'gameover' member is not
 * optional - without a discrete result screen the capture harness only ever
 * collects repeated frames of the same board (rule #12).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import theme from './src/constants/theme';
import { TOTAL_LEVELS } from './src/constants/config';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import type { RoundResult } from './src/hooks/useOrchard';

type Screen = 'loader' | 'menu' | 'game' | 'gameover';

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('loader');
  const [crowns, setCrowns] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [starsByLevel, setStarsByLevel] = useState<Record<number, number>>({});
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [tutorialSeen, setTutorialSeen] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  const screenRef = useRef<Screen>(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  /* Hardware back never drops out to the launcher. */
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const at = screenRef.current;
      if (at === 'game' || at === 'gameover') {
        setScreen('menu');
        return true;
      }
      return true;
    });
    return () => sub.remove();
  }, []);

  const startLevel = useCallback((level: number) => {
    const clamped = Math.min(Math.max(1, level), TOTAL_LEVELS);
    setCurrentLevel(clamped);
    setRoundKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleGameOver = useCallback((result: RoundResult) => {
    setLastResult(result);
    if (result.outcome === 'win') {
      setCrowns(c => c + result.crownsEarned);
      setUnlockedLevel(u => Math.max(u, Math.min(result.level + 1, TOTAL_LEVELS)));
      setStarsByLevel(prev => {
        const best = Math.max(prev[result.level] ?? 0, result.stars);
        if (best === prev[result.level]) {
          return prev;
        }
        return { ...prev, [result.level]: best };
      });
    }
    setScreen('gameover');
  }, []);

  const playAgain = useCallback(() => {
    setRoundKey(k => k + 1);
    setScreen('game');
  }, []);

  const nextOrchard = useCallback(() => {
    setCurrentLevel(l => Math.min(l + 1, TOTAL_LEVELS));
    setRoundKey(k => k + 1);
    setScreen('game');
  }, []);

  const openTutorial = useCallback(() => {
    setTutorialSeen(false);
    setCurrentLevel(1);
    setRoundKey(k => k + 1);
    setScreen('game');
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg.deep} translucent />

      {screen === 'loader' ? <LoaderScreen onDone={() => setScreen('menu')} /> : null}

      {screen === 'menu' ? (
        <MenuScreen
          crowns={crowns}
          unlockedLevel={unlockedLevel}
          starsByLevel={starsByLevel}
          onStart={startLevel}
          onOpenTutorial={openTutorial}
        />
      ) : null}

      {screen === 'game' ? (
        <GameScreen
          key={roundKey}
          level={currentLevel}
          crowns={crowns}
          showTutorial={currentLevel === 1 && !tutorialSeen}
          onTutorialDone={() => setTutorialSeen(true)}
          onGameOver={handleGameOver}
          onExit={() => setScreen('menu')}
        />
      ) : null}

      {screen === 'gameover' && lastResult ? (
        <GameOverScreen
          result={lastResult}
          crowns={crowns}
          hasNext={lastResult.level < TOTAL_LEVELS}
          onPlayAgain={playAgain}
          onNext={nextOrchard}
          onMenu={() => setScreen('menu')}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg.deep },
});

export default App;
