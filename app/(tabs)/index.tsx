import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { getBaseThemeSource, RaccoonAnimationId } from '@/components/game/asset-sources';
import { AnimatedRaccoonArt, BuildingArt, RaccoonAnimationFrameArt, RaccoonArt } from '@/components/game/art';
import {
  ActionButton,
  gameColors,
  OverlayPanel,
  ProgressBar,
  ResourceAmount,
  SceneScreen,
} from '@/components/game/ui';
import { useMusicTrack } from '@/hooks/use-audio-events';
import {
  BASE_BUILDING_LAYOUT,
  BASE_RACCOON_LAYOUT,
  playfieldToPercent,
} from '@/constants/base-playfield';
import {
  BASE_THEMES,
  BaseThemeId,
  formatDuration,
  RACCOONS,
  RaccoonId,
  RESOURCE_KEYS,
  ResourceCost,
  ZONES,
} from '@/constants/game';
import {
  getResourceTotal,
  getRunRemainingSeconds,
  isRunReady,
  useGame,
  useRunClock,
} from '@/state/game-store';

function tutorialTipLine(phase: number): string | null {
  switch (phase) {
    case 0:
      return 'Guide: Tap Quick Sort below once.';
    case 1:
      return 'Guide: Jump to Scavenge and deploy a loot run.';
    case 2:
      return 'Guide: Claim your haul here when ready.';
    case 3:
      return 'Guide: Spend scrap to upgrade anything in Build.';
    case 4:
      return 'Guide: Peek the Collection tab for quests.';
    default:
      return null;
  }
}

export default function BaseScreen() {
  const router = useRouter();
  useMusicTrack('home');
  const now = useRunClock();
  const { state, claimOfflineRewards, tapLootPile, claimRun, selectBaseTheme } = useGame();
  const [hudHeight, setHudHeight] = useState(300);
  const tutorTip = tutorialTipLine(state.tutorialPhase);
  const pendingOfflineTotal = getResourceTotal(state.pendingOfflineRewards);
  const offlineSummary = state.offlineSummary;
  const offlineElapsed = offlineSummary ? formatDuration(Math.ceil(offlineSummary.elapsedMs / 1000)) : null;
  const readyRun = state.runs.find((run) => isRunReady(run, now));
  const activeRun = readyRun ?? state.runs[0];
  const activeRunReady = activeRun ? isRunReady(activeRun, now) : false;
  const objective = (() => {
    if (readyRun) {
      return `Claim ${RACCOONS[readyRun.raccoonId].name}'s haul from ${ZONES[readyRun.zoneId].name}.`;
    }

    if (state.runs.length > 0) {
      return 'A run is underway. Sort the pile or plan the next upgrade.';
    }

    if (state.totalRunsClaimed === 0) {
      return 'Send Scout to Alley Dumpster and claim the first run.';
    }

    if (state.buildings.snack.level === 1) {
      return 'Upgrade Snack Stash to make food runs stronger.';
    }

    return state.unlockedZones.includes('backlot')
      ? 'Recruit more crew and push toward Convenience Store.'
      : 'Unlock Apartment Backlot for better scrap.';
  })();

  return (
    <SceneScreen
      background={getBaseThemeSource(state.selectedBaseThemeId)}
      title="Home Base"
      subtitle={`Crew ${getRecruitCount(state.raccoons)} / 4`}>
      <View style={[styles.sceneLayer, { bottom: hudHeight }]}>
        <View style={[styles.sparkle, styles.sparkleOne]} />
        <View style={[styles.sparkle, styles.sparkleTwo]} />
        <View style={[styles.sparkle, styles.sparkleThree]} />
        {BASE_BUILDING_LAYOUT.map(({ id, nx, ny, size }) => {
          const pos = playfieldToPercent(nx, ny);

          return (
            <Pressable
              accessibilityRole="button"
              key={id}
              onPress={() =>
                router.push({
                  pathname: '/build',
                  params: { focus: id },
                })
              }
              style={[styles.sceneBuilding, pos]}>
              <BuildingArt buildingId={id} level={state.buildings[id].level} size={size} />
              <Text style={styles.sceneTag}>Lv {state.buildings[id].level}</Text>
            </Pressable>
          );
        })}
        {BASE_RACCOON_LAYOUT.filter(({ id }) => id === 'scout' || state.raccoons[id].unlocked).map(
          ({ id, nx, ny, size, route }) => {
            const pos = playfieldToPercent(nx, ny);

            return <HomeBaseRaccoon key={id} home={pos} raccoonId={id} route={route} size={size} />;
          },
        )}
      </View>

      <View
        onLayout={(event) => setHudHeight(Math.ceil(event.nativeEvent.layout.height) + 10)}
        style={styles.bottomStack}>
        {pendingOfflineTotal > 0 ? (
          <OverlayPanel style={styles.offlinePanel}>
            <View style={styles.panelCopy}>
              <Text style={styles.panelKicker}>Offline Stash</Text>
              {offlineElapsed ? <Text style={styles.bodyText}>Away for {offlineElapsed}</Text> : null}
              <RewardSummary rewards={state.pendingOfflineRewards} />
            </View>
            <ActionButton icon="package-variant-closed-check" onPress={claimOfflineRewards} style={styles.claimButton}>
              Claim
            </ActionButton>
          </OverlayPanel>
        ) : null}

        <OverlayPanel style={styles.objectivePanel}>
          <View style={styles.objectiveTop}>
            <View style={styles.objectiveIcon}>
              <MaterialCommunityIcons name="target" size={18} color="#FFF7DD" />
            </View>
            <View style={styles.panelCopy}>
              <Text style={styles.panelKicker}>Objective</Text>
              <Text style={styles.objectiveText}>{objective}</Text>
              {tutorTip ? <Text style={styles.tutorialBanner}>{tutorTip}</Text> : null}
            </View>
          </View>

          {activeRun ? (
            <View
              style={[
                styles.activeRunRow,
                state.tutorialPhase === 2 ? styles.tutorialRingPadding : undefined,
              ]}>
              <RaccoonArt raccoonId={activeRun.raccoonId} size={40} />
              <View style={styles.panelCopy}>
                <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.activeRunTitle}>
                  {RACCOONS[activeRun.raccoonId].name} at {ZONES[activeRun.zoneId].name}
                  {state.runs.length > 1 ? ` + ${state.runs.length - 1} more` : ''}
                </Text>
                <Text style={styles.bodyText}>
                  {activeRunReady ? 'Ready to claim' : `${formatDuration(getRunRemainingSeconds(activeRun, now))} remaining`}
                </Text>
                <ProgressBar value={1 - getRunRemainingSeconds(activeRun, now) / activeRun.durationSec} />
              </View>
              <ActionButton
                icon={activeRunReady ? 'package-variant' : 'eye'}
                onPress={() => (activeRunReady ? claimRun(activeRun.id, 'base') : router.push('/scavenge'))}
                style={styles.claimButton}>
                {activeRunReady ? 'Claim' : 'View'}
              </ActionButton>
            </View>
          ) : null}

          <View style={styles.quickSortHint}>
            <MaterialCommunityIcons name="basket-fill" size={14} color={gameColors.greenDark} />
            <Text style={styles.quickSortHintText}>Quick Sort gives a small +3 food / +3 scrap tap bonus.</Text>
          </View>

          <View style={styles.themeStrip}>
            <Text style={styles.themeStripLabel}>Base Theme</Text>
            {state.ownedBaseThemeIds.map((themeId) => (
              <ThemeChip
                active={state.selectedBaseThemeId === themeId}
                key={themeId}
                onPress={() => selectBaseTheme(themeId)}
                themeId={themeId}
              />
            ))}
          </View>

          <View style={styles.actionRow}>
            <View style={[styles.actionPrimaryWrap, state.tutorialPhase === 1 && styles.tutorialRing]}>
              <ActionButton icon="magnify" onPress={() => router.push('/scavenge')} style={styles.primaryAction}>
                Start Loot Run
              </ActionButton>
            </View>
            <View style={[styles.actionSecondaryWrap, state.tutorialPhase === 0 && styles.tutorialRing]}>
              <ActionButton icon="basket-fill" tone="secondary" onPress={tapLootPile} style={styles.secondaryAction}>
                Quick Sort
              </ActionButton>
            </View>
          </View>
        </OverlayPanel>
      </View>
    </SceneScreen>
  );
}

function HomeBaseRaccoon({
  raccoonId,
  home,
  size,
  route,
}: {
  raccoonId: RaccoonId;
  home: { left: `${number}%`; top: `${number}%` };
  size: number;
  route: {
    dx: number;
    dy: number;
    moveAnimation: 'walk' | 'carry';
  }[];
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef({ x: 0, y: 0 });
  const routeIndex = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [animation, setAnimation] = useState<RaccoonAnimationId>('idle');
  const [facing, setFacing] = useState(1);
  const [tapFrameIndex, setTapFrameIndex] = useState<number | undefined>();
  const firstDelayMs = useMemo(() => getIdleDelayMs(), []);

  function clearIdleTimer() {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);

      idleTimerRef.current = undefined;
    }
  }

  /** Snap currentOffset and Animated values to the raccoon's actual position after stopping motion. */
  function freezeWanderPosition() {
    let settledX = currentOffset.current.x;
    let settledY = currentOffset.current.y;
    let pending = 2;

    const finishAxis = () => {
      pending -= 1;

      if (pending === 0) {
        currentOffset.current = { x: settledX, y: settledY };
        translateX.setValue(settledX);
        translateY.setValue(settledY);
      }
    };

    translateX.stopAnimation((value) => {
      settledX = value;
      finishAxis();
    });
    translateY.stopAnimation((value) => {
      settledY = value;
      finishAxis();
    });
  }

  useEffect(() => {
    if (tapFrameIndex !== undefined) {
      return;
    }

    let cancelled = false;

    const scheduleNextWander = (delayMs: number) => {
      clearIdleTimer();

      idleTimerRef.current = setTimeout(() => {
        idleTimerRef.current = undefined;

        if (cancelled) {
          return;
        }

        const target = route[routeIndex.current % route.length];
        const targetOffset = { x: target.dx, y: target.dy };
        routeIndex.current += 1;
        setFacing(targetOffset.x >= currentOffset.current.x ? 1 : -1);
        setAnimation(target.moveAnimation);

        Animated.parallel([
          Animated.timing(translateX, {
            duration: getMoveDurationMs(currentOffset.current, target),
            easing: Easing.inOut(Easing.quad),
            toValue: targetOffset.x,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            duration: getMoveDurationMs(currentOffset.current, target),
            easing: Easing.inOut(Easing.quad),
            toValue: targetOffset.y,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (!finished || cancelled) {
            return;
          }

          currentOffset.current = targetOffset;
          setAnimation('idle');
          scheduleNextWander(getIdleDelayMs());
        });
      }, delayMs);
    };

    if (route.length > 0) {
      scheduleNextWander(firstDelayMs);
    }

    return () => {
      cancelled = true;
      clearIdleTimer();
      freezeWanderPosition();
    };
  }, [firstDelayMs, route, tapFrameIndex, translateX, translateY]);

  useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
    };
  }, []);

  const handleRaccoonTap = () => {
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }

    clearIdleTimer();
    freezeWanderPosition();
    setAnimation('idle');
    setTapFrameIndex(getTapFrameIndex());

    tapTimeout.current = setTimeout(() => {
      setTapFrameIndex(undefined);
    }, 2000);
  };

  return (
    <Animated.View
      style={[
        styles.sceneRaccoon,
        {
          ...home,
          transform: [{ translateX }, { translateY }],
        },
      ]}>
      <Pressable
        accessibilityLabel={`${RACCOONS[raccoonId].name} reaction`}
        accessibilityRole="button"
        hitSlop={12}
        onPress={handleRaccoonTap}
        style={({ pressed }) => [styles.raccoonButton, pressed && styles.raccoonButtonPressed]}>
        {tapFrameIndex === undefined ? (
          <AnimatedRaccoonArt
            animation={animation}
            intervalMs={animation === 'idle' ? undefined : 105}
            raccoonId={raccoonId}
            size={size}
            style={{ transform: [{ scaleX: facing }] }}
          />
        ) : (
          <RaccoonAnimationFrameArt
            animation="tap"
            frameIndex={tapFrameIndex}
            raccoonId={raccoonId}
            size={size}
            style={{ transform: [{ scaleX: facing }] }}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

function getMoveDurationMs(
  current: { x: number; y: number },
  target: { dx: number; dy: number },
) {
  const distance = Math.hypot(target.dx - current.x, target.dy - current.y);

  return Math.max(1700, Math.min(3200, Math.round(distance * 24)));
}

function getIdleDelayMs() {
  return 4000 + Math.round(Math.random() * 4000);
}

function getTapFrameIndex() {
  return Math.floor(Math.random() * 3);
}

function ThemeChip({
  themeId,
  active,
  onPress,
}: {
  themeId: BaseThemeId;
  active: boolean;
  onPress: () => void;
}) {
  const theme = BASE_THEMES[themeId];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.themeChip,
        active && styles.themeChipActive,
        { borderColor: theme.accentColor },
        pressed && styles.themeChipPressed,
      ]}>
      <View style={[styles.themeDot, { backgroundColor: theme.accentColor }]} />
      <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>{theme.label}</Text>
    </Pressable>
  );
}

function RewardSummary({ rewards }: { rewards: ResourceCost }) {
  return (
    <View style={styles.rewardRow}>
      {RESOURCE_KEYS.filter((key) => (rewards[key] ?? 0) > 0).map((key) => (
        <ResourceAmount key={key} amount={rewards[key] ?? 0} resourceKey={key} />
      ))}
    </View>
  );
}

function getRecruitCount(raccoons: Record<string, { unlocked: boolean }>) {
  return Object.values(raccoons).filter((raccoon) => raccoon.unlocked).length;
}

const styles = StyleSheet.create({
  sceneLayer: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sparkle: {
    backgroundColor: '#FFE59A',
    borderColor: '#B87923',
    borderRadius: 8,
    borderWidth: 1,
    height: 8,
    opacity: 0.78,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 8,
  },
  sparkleOne: {
    left: '26%',
    top: '36%',
  },
  sparkleTwo: {
    right: '28%',
    top: '47%',
  },
  sparkleThree: {
    left: '54%',
    top: '70%',
  },
  sceneBuilding: {
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
  sceneTag: {
    backgroundColor: '#F8E4B8',
    borderColor: 'rgba(84, 52, 25, 0.35)',
    borderRadius: 6,
    borderWidth: 1,
    color: gameColors.ink,
    fontSize: 10,
    fontWeight: '900',
    marginTop: -8,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sceneRaccoon: {
    position: 'absolute',
    zIndex: 2,
  },
  raccoonButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  raccoonButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  bottomStack: {
    bottom: 8,
    gap: 6,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  offlinePanel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  objectivePanel: {
    gap: 7,
    padding: 9,
  },
  objectiveTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  objectiveIcon: {
    alignItems: 'center',
    backgroundColor: gameColors.green,
    borderRadius: 7,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  panelCopy: {
    flex: 1,
    gap: 3,
  },
  panelKicker: {
    color: gameColors.greenDark,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  objectiveText: {
    color: gameColors.ink,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
  },
  bodyText: {
    color: gameColors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  activeRunRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(249, 227, 186, 0.75)',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    padding: 6,
  },
  activeRunTitle: {
    color: gameColors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  tutorialBanner: {
    color: '#FFE8BF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    marginTop: 6,
  },
  tutorialRing: {
    borderColor: '#E8B547',
    borderRadius: 10,
    borderWidth: 2,
    padding: 2,
  },
  tutorialRingPadding: {
    borderColor: '#E8B547',
    borderRadius: 10,
    borderWidth: 2,
    padding: 8,
  },
  actionPrimaryWrap: {
    flex: 1,
    minWidth: 0,
  },
  actionSecondaryWrap: {
    flexShrink: 0,
  },
  actionRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 8,
  },
  quickSortHint: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  quickSortHintText: {
    color: gameColors.muted,
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  themeStrip: {
    alignItems: 'center',
    backgroundColor: 'rgba(249, 227, 186, 0.78)',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 6,
  },
  themeStripLabel: {
    color: gameColors.greenDark,
    fontSize: 10,
    fontWeight: '900',
    marginRight: 2,
    textTransform: 'uppercase',
  },
  themeChip: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  themeChipActive: {
    backgroundColor: '#3B2614',
  },
  themeChipPressed: {
    opacity: 0.78,
  },
  themeDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  themeChipText: {
    color: gameColors.ink,
    fontSize: 10,
    fontWeight: '900',
  },
  themeChipTextActive: {
    color: '#FFF9E9',
  },
  primaryAction: {
    flex: 1,
    minHeight: 38,
    paddingVertical: 8,
  },
  secondaryAction: {
    minHeight: 38,
    minWidth: 112,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  claimButton: {
    minHeight: 36,
    minWidth: 82,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
