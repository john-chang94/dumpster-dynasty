import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BaseBackdrop, BuildingSketch, RaccoonSketch } from '@/components/game/skia-placeholders';
import {
  ActionButton,
  Card,
  GameScreen,
  gameColors,
  MessageBanner,
  ProgressBar,
  SectionTitle,
  StatLine,
} from '@/components/game/ui';
import { BuildingId, formatDuration, RACCOONS, RESOURCE_CONFIG, RESOURCE_KEYS, ResourceCost, ZONES } from '@/constants/game';
import {
  getResourceTotal,
  getRunRemainingSeconds,
  isRunReady,
  useGame,
  useRunClock,
} from '@/state/game-store';

const baseBuildingPositions: { id: BuildingId; left: `${number}%`; top: number }[] = [
  { id: 'nest', left: '11%', top: 168 },
  { id: 'snack', left: '3%', top: 78 },
  { id: 'sort', left: '59%', top: 74 },
  { id: 'vault', left: '70%', top: 174 },
  { id: 'training', left: '36%', top: 214 },
];

export default function BaseScreen() {
  const router = useRouter();
  const now = useRunClock();
  const { state, claimOfflineRewards, tapLootPile, claimRun } = useGame();
  const pendingOfflineTotal = getResourceTotal(state.pendingOfflineRewards);
  const claimableRuns = state.runs.filter((run) => isRunReady(run, now));
  const objective =
    state.totalRunsClaimed === 0
      ? 'Send Scout to Alley Dumpster and claim the first run.'
      : state.buildings.snack.level === 1
        ? 'Upgrade Snack Stash to make food runs stronger.'
        : state.unlockedZones.includes('backlot')
          ? 'Recruit more crew and push toward Convenience Store.'
          : 'Unlock Apartment Backlot for better scrap.';

  return (
    <GameScreen title="Home Base" subtitle="Prototype foundations for the core idle loop.">
      <MessageBanner />

      {pendingOfflineTotal > 0 ? (
        <Card style={styles.offlineCard}>
          <View style={styles.offlineCopy}>
            <Text style={styles.cardKicker}>Offline Stash</Text>
            <Text style={styles.cardTitle}>The base kept sorting while you were away.</Text>
            <RewardSummary rewards={state.pendingOfflineRewards} />
          </View>
          <ActionButton icon="package-variant-closed-check" onPress={claimOfflineRewards} style={styles.offlineButton}>
            Claim
          </ActionButton>
        </Card>
      ) : null}

      <View style={styles.sceneShell}>
        <BaseBackdrop height={326} />
        {baseBuildingPositions.map(({ id, left, top }) => (
          <Pressable
            key={id}
            onPress={() => router.push('/build')}
            style={[styles.sceneBuilding, { left, top }]}
            accessibilityRole="button">
            <BuildingSketch buildingId={id} level={state.buildings[id].level} size={72} />
            <Text style={styles.sceneTag}>Lv {state.buildings[id].level}</Text>
          </Pressable>
        ))}
        <View style={[styles.sceneRaccoon, styles.sceneRaccoonLeft]}>
          <RaccoonSketch raccoonId="scout" size={76} />
        </View>
        <View style={[styles.sceneRaccoon, styles.sceneRaccoonRight]}>
          <RaccoonSketch raccoonId="hauler" size={68} locked={!state.raccoons.hauler.unlocked} />
        </View>
      </View>

      <Card style={styles.objectiveCard}>
        <View style={styles.objectiveIcon}>
          <MaterialCommunityIcons name="target" size={24} color="#FFF7DD" />
        </View>
        <View style={styles.objectiveCopy}>
          <Text style={styles.cardKicker}>Current Goal</Text>
          <Text style={styles.objectiveText}>{objective}</Text>
        </View>
      </Card>

      <View style={styles.quickGrid}>
        <Card style={styles.quickCard}>
          <SectionTitle title="Loot Pile" />
          <Text style={styles.bodyText}>Tap to get a small starter drip of food and scrap between runs.</Text>
          <ActionButton icon="basket-fill" onPress={tapLootPile}>
            Sort Pile
          </ActionButton>
        </Card>

        <Card style={styles.quickCard}>
          <SectionTitle title="Crew" />
          <StatLine icon="account-group" label="Recruited" value={`${getRecruitCount(state.raccoons)} / 4`} />
          <StatLine icon="run-fast" label="Out scavenging" value={`${state.runs.length}`} />
          <ActionButton icon="book-open-variant" tone="plain" onPress={() => router.push('/collection')}>
            View Crew
          </ActionButton>
        </Card>
      </View>

      <Card>
        <SectionTitle
          title="Scavenge Runs"
          action={
            <ActionButton icon="magnify" tone="plain" onPress={() => router.push('/scavenge')} style={styles.smallButton}>
              Map
            </ActionButton>
          }
        />
        {state.runs.length === 0 ? (
          <View style={styles.emptyRunState}>
            <Text style={styles.bodyText}>No active runs yet. The first loop starts at Alley Dumpster.</Text>
            <ActionButton icon="send" tone="secondary" onPress={() => router.push('/scavenge')}>
              Start a Run
            </ActionButton>
          </View>
        ) : (
          <View style={styles.runList}>
            {state.runs.map((run) => {
              const remainingSeconds = getRunRemainingSeconds(run, now);
              const ready = claimableRuns.some((claimableRun) => claimableRun.id === run.id);
              const progress = 1 - remainingSeconds / run.durationSec;

              return (
                <View key={run.id} style={styles.runRow}>
                  <View style={styles.runCopy}>
                    <Text style={styles.runTitle}>
                      {RACCOONS[run.raccoonId].name} at {ZONES[run.zoneId].name}
                    </Text>
                    <Text style={styles.bodyText}>
                      {ready ? 'Ready to claim' : `${formatDuration(remainingSeconds)} remaining`}
                    </Text>
                    <ProgressBar value={progress} />
                  </View>
                  <ActionButton
                    disabled={!ready}
                    icon="package-variant"
                    onPress={() => claimRun(run.id)}
                    style={styles.claimButton}>
                    Claim
                  </ActionButton>
                </View>
              );
            })}
          </View>
        )}
      </Card>
    </GameScreen>
  );
}

function RewardSummary({ rewards }: { rewards: ResourceCost }) {
  return (
    <View style={styles.rewardRow}>
      {RESOURCE_KEYS.filter((key) => (rewards[key] ?? 0) > 0).map((key) => (
        <View key={key} style={styles.rewardPill}>
          <MaterialCommunityIcons name={RESOURCE_CONFIG[key].icon} size={15} color={RESOURCE_CONFIG[key].color} />
          <Text style={styles.rewardText}>{rewards[key]}</Text>
        </View>
      ))}
    </View>
  );
}

function getRecruitCount(raccoons: Record<string, { unlocked: boolean }>) {
  return Object.values(raccoons).filter((raccoon) => raccoon.unlocked).length;
}

const styles = StyleSheet.create({
  offlineCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  offlineCopy: {
    flex: 1,
    gap: 6,
  },
  offlineButton: {
    minWidth: 92,
  },
  cardKicker: {
    color: gameColors.greenDark,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: gameColors.ink,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },
  sceneShell: {
    borderColor: 'rgba(84, 52, 25, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    height: 326,
    overflow: 'hidden',
    position: 'relative',
  },
  sceneBuilding: {
    alignItems: 'center',
    position: 'absolute',
  },
  sceneTag: {
    backgroundColor: '#F8E4B8',
    borderColor: 'rgba(84, 52, 25, 0.25)',
    borderRadius: 6,
    borderWidth: 1,
    color: gameColors.ink,
    fontSize: 11,
    fontWeight: '900',
    marginTop: -8,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sceneRaccoon: {
    position: 'absolute',
  },
  sceneRaccoonLeft: {
    left: '22%',
    top: 196,
  },
  sceneRaccoonRight: {
    right: '17%',
    top: 194,
  },
  objectiveCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  objectiveIcon: {
    alignItems: 'center',
    backgroundColor: gameColors.green,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  objectiveCopy: {
    flex: 1,
    gap: 2,
  },
  objectiveText: {
    color: gameColors.ink,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    gap: 10,
  },
  bodyText: {
    color: gameColors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  smallButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  emptyRunState: {
    gap: 10,
    paddingTop: 10,
  },
  runList: {
    gap: 10,
    paddingTop: 10,
  },
  runRow: {
    alignItems: 'center',
    backgroundColor: '#F9E3BA',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  runCopy: {
    flex: 1,
    gap: 6,
  },
  runTitle: {
    color: gameColors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  claimButton: {
    minWidth: 84,
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rewardPill: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.16)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  rewardText: {
    color: gameColors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
});
