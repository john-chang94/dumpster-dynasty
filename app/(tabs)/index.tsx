import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { environmentSources } from '@/components/game/asset-sources';
import { BuildingArt, RaccoonArt } from '@/components/game/art';
import {
  ActionButton,
  gameColors,
  MessageBanner,
  OverlayPanel,
  ProgressBar,
  ResourceAmount,
  SceneScreen,
} from '@/components/game/ui';
import { BuildingId, formatDuration, RACCOONS, RESOURCE_KEYS, ResourceCost, ZONES } from '@/constants/game';
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

export default function BaseScreen() {
  const router = useRouter();
  const now = useRunClock();
  const { state, claimOfflineRewards, tapLootPile, claimRun } = useGame();
  const pendingOfflineTotal = getResourceTotal(state.pendingOfflineRewards);
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
    <SceneScreen background={environmentSources.baseDay} title="Home Base" subtitle={`Crew ${getRecruitCount(state.raccoons)} / 4`}>
      <View style={styles.sceneLayer}>
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
        <View style={[styles.sceneRaccoon, styles.sceneRaccoonScout]}>
          <RaccoonArt raccoonId="scout" size={76} />
        </View>
        <View style={[styles.sceneRaccoon, styles.sceneRaccoonHauler]}>
          <RaccoonArt raccoonId="hauler" size={70} locked={!state.raccoons.hauler.unlocked} />
        </View>
      </View>

      <View style={styles.bottomStack}>
        <MessageBanner scope="base" />
        {pendingOfflineTotal > 0 ? (
          <OverlayPanel style={styles.offlinePanel}>
            <View style={styles.panelCopy}>
              <Text style={styles.panelKicker}>Offline Stash</Text>
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

          <View style={styles.actionRow}>
            <ActionButton icon="magnify" onPress={() => router.push('/scavenge')} style={styles.primaryAction}>
              Start Loot Run
            </ActionButton>
            <ActionButton icon="basket-fill" tone="secondary" onPress={tapLootPile} style={styles.secondaryAction}>
              Sort
            </ActionButton>
          </View>
        </OverlayPanel>
      </View>
    </SceneScreen>
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
  sceneRaccoonScout: {
    left: '18%',
    top: '63%',
  },
  sceneRaccoonHauler: {
    right: '17%',
    top: '64%',
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
  primaryAction: {
    flex: 1,
    minHeight: 38,
    paddingVertical: 8,
  },
  secondaryAction: {
    minHeight: 38,
    minWidth: 92,
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
