import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getBaseThemeSource } from '@/components/game/asset-sources';
import { AnimatedRaccoonArt, BuildingArt, RaccoonArt } from '@/components/game/art';
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
  BASE_THEMES,
  BaseThemeId,
  BuildingId,
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

const baseBuildingPositions: { id: BuildingId; left: `${number}%`; top: `${number}%`; size: number }[] = [
  { id: 'snack', left: '6%', top: '42%', size: 66 },
  { id: 'sort', left: '58%', top: '39%', size: 70 },
  { id: 'nest', left: '28%', top: '54%', size: 72 },
  { id: 'vault', left: '71%', top: '55%', size: 68 },
  { id: 'training', left: '43%', top: '68%', size: 62 },
];

const baseRaccoonPositions: {
  id: RaccoonId;
  left?: `${number}%`;
  right?: `${number}%`;
  top: `${number}%`;
  size: number;
  animation: 'idle' | 'walk' | 'tap';
}[] = [
  { id: 'scout', left: '17%', top: '63%', size: 76, animation: 'idle' },
  { id: 'hauler', right: '17%', top: '64%', size: 70, animation: 'walk' },
  { id: 'sniffer', left: '45%', top: '58%', size: 66, animation: 'tap' },
  { id: 'sneak', right: '36%', top: '72%', size: 58, animation: 'idle' },
];

export default function BaseScreen() {
  const router = useRouter();
  useMusicTrack('base');
  const now = useRunClock();
  const { state, claimOfflineRewards, tapLootPile, claimRun, selectBaseTheme } = useGame();
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
      <View style={styles.sceneLayer}>
        <View style={[styles.sceneGlow, state.selectedBaseThemeId !== 'day' && styles.sceneGlowNight]} />
        <View style={[styles.sparkle, styles.sparkleOne]} />
        <View style={[styles.sparkle, styles.sparkleTwo]} />
        <View style={[styles.sparkle, styles.sparkleThree]} />
        {baseBuildingPositions.map(({ id, left, top, size }) => (
          <Pressable
            accessibilityRole="button"
            key={id}
            onPress={() => router.push('/build')}
            style={[styles.sceneBuilding, { left, top }]}>
            <BuildingArt buildingId={id} level={state.buildings[id].level} size={size} />
            <Text style={styles.sceneTag}>Lv {state.buildings[id].level}</Text>
          </Pressable>
        ))}
        {baseRaccoonPositions
          .filter(({ id }) => id === 'scout' || state.raccoons[id].unlocked)
          .map(({ id, left, right, top, size, animation }) => (
            <View key={id} style={[styles.sceneRaccoon, { left, right, top }]}>
              <AnimatedRaccoonArt animation={animation} intervalMs={id === 'hauler' ? 320 : 520} raccoonId={id} size={size} />
            </View>
          ))}
      </View>

      <View style={styles.bottomStack}>
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
            </View>
          </View>

          {activeRun ? (
            <View style={styles.activeRunRow}>
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
            <ActionButton icon="magnify" onPress={() => router.push('/scavenge')} style={styles.primaryAction}>
              Start Loot Run
            </ActionButton>
            <ActionButton icon="basket-fill" tone="secondary" onPress={tapLootPile} style={styles.secondaryAction}>
              Quick Sort
            </ActionButton>
          </View>
        </OverlayPanel>
      </View>
    </SceneScreen>
  );
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
    bottom: 170,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sceneGlow: {
    backgroundColor: 'rgba(255, 213, 128, 0.18)',
    borderRadius: 8,
    bottom: 56,
    left: '11%',
    position: 'absolute',
    right: '11%',
    top: '36%',
  },
  sceneGlowNight: {
    backgroundColor: 'rgba(71, 124, 184, 0.16)',
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
  actionRow: {
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
