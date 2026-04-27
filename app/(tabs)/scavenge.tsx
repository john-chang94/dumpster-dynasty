import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { RaccoonSketch, ZoneThumbnail } from '@/components/game/skia-placeholders';
import {
  ActionButton,
  Card,
  CostRow,
  GameScreen,
  gameColors,
  MessageBanner,
  ProgressBar,
  SectionTitle,
  StatLine,
} from '@/components/game/ui';
import {
  formatDuration,
  hasResources,
  RACCOON_CLASSES,
  RACCOONS,
  RESOURCE_CONFIG,
  RESOURCE_KEYS,
  ResourceCost,
  ZoneId,
  ZONES,
} from '@/constants/game';
import {
  getAvailableRaccoons,
  getRunForZone,
  getRunRemainingSeconds,
  isRunReady,
  useGame,
  useRunClock,
} from '@/state/game-store';

export default function ScavengeScreen() {
  const now = useRunClock();
  const { state, startRun, claimRun, unlockZone } = useGame();
  const availableRaccoons = getAvailableRaccoons(state);

  return (
    <GameScreen title="Scavenge Map" subtitle="Send available crew to timed zone runs and claim the haul.">
      <MessageBanner />

      <Card style={styles.summaryCard}>
        <SectionTitle title="Assignment" />
        <View style={styles.summaryGrid}>
          <StatLine icon="account-check" label="Available crew" value={`${availableRaccoons.length}`} />
          <StatLine icon="timer-sand" label="Active runs" value={`${state.runs.length}`} />
          <StatLine icon="map-marker" label="Zones open" value={`${state.unlockedZones.length} / 3`} />
        </View>
      </Card>

      {(Object.keys(ZONES) as ZoneId[]).map((zoneId) => {
        const zone = ZONES[zoneId];
        const unlocked = state.unlockedZones.includes(zoneId);
        const run = getRunForZone(state, zoneId);
        const remainingSeconds = run ? getRunRemainingSeconds(run, now) : 0;
        const ready = run ? isRunReady(run, now) : false;
        const progress = run ? 1 - remainingSeconds / run.durationSec : 0;

        return (
          <Card key={zoneId} style={styles.zoneCard}>
            <View style={styles.zoneTop}>
              <ZoneThumbnail zoneId={zoneId} />
              <View style={styles.zoneCopy}>
                <View style={styles.zoneTitleRow}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={[styles.riskBadge, zone.risk === 'High' && styles.highRisk]}>{zone.risk}</Text>
                </View>
                <Text style={styles.bodyText}>{zone.purpose}</Text>
                <RewardPreview rewards={zone.baseRewards} />
              </View>
            </View>

            <View style={styles.zoneStats}>
              <StatLine icon="clock-outline" label="Base timer" value={formatDuration(zone.durationSec)} />
              <StatLine icon="star-four-points" label="Loot chance" value={`${Math.round(zone.rareChance * 100)}%`} />
            </View>

            {!unlocked ? (
              <View style={styles.lockedPanel}>
                <View style={styles.unlockCopy}>
                  <Text style={styles.lockedTitle}>Unlock this route</Text>
                  <CostRow cost={zone.unlockCost ?? null} resources={state.resources} />
                </View>
                <ActionButton
                  icon="lock-open-variant"
                  disabled={!zone.unlockCost || !hasResources(state.resources, zone.unlockCost)}
                  onPress={() => unlockZone(zoneId)}>
                  Unlock
                </ActionButton>
              </View>
            ) : run ? (
              <View style={styles.activeRunPanel}>
                <RaccoonSketch raccoonId={run.raccoonId} size={64} />
                <View style={styles.activeRunCopy}>
                  <Text style={styles.activeRunTitle}>{RACCOONS[run.raccoonId].name} is on route.</Text>
                  <Text style={styles.bodyText}>
                    {ready ? 'Ready to claim' : `${formatDuration(remainingSeconds)} remaining`}
                  </Text>
                  <ProgressBar value={progress} />
                </View>
                <ActionButton disabled={!ready} icon="package-variant" onPress={() => claimRun(run.id)} style={styles.claimButton}>
                  Claim
                </ActionButton>
              </View>
            ) : (
              <View style={styles.assignmentPanel}>
                <Text style={styles.assignmentTitle}>Send a raccoon</Text>
                {availableRaccoons.length === 0 ? (
                  <Text style={styles.bodyText}>All recruited raccoons are busy. Claim a finished run or wait for one to return.</Text>
                ) : (
                  <View style={styles.crewButtonGrid}>
                    {availableRaccoons.map((raccoonId) => {
                      const raccoon = RACCOONS[raccoonId];
                      const raccoonClass = RACCOON_CLASSES[raccoon.classId];

                      return (
                        <ActionButton
                          key={raccoonId}
                          icon="send"
                          tone={raccoonId === 'scout' ? 'secondary' : 'plain'}
                          onPress={() => startRun(zoneId, raccoonId)}
                          style={styles.crewButton}>
                          {raccoon.name} - {raccoonClass.label}
                        </ActionButton>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </Card>
        );
      })}
    </GameScreen>
  );
}

function RewardPreview({ rewards }: { rewards: ResourceCost }) {
  return (
    <View style={styles.rewardPreview}>
      {RESOURCE_KEYS.filter((key) => (rewards[key] ?? 0) > 0).map((key) => (
        <View key={key} style={styles.rewardPill}>
          <MaterialCommunityIcons name={RESOURCE_CONFIG[key].icon} size={15} color={RESOURCE_CONFIG[key].color} />
          <Text style={styles.rewardText}>{rewards[key]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: 10,
  },
  summaryGrid: {
    gap: 8,
  },
  zoneCard: {
    gap: 12,
  },
  zoneTop: {
    flexDirection: 'row',
    gap: 12,
  },
  zoneCopy: {
    flex: 1,
    gap: 6,
  },
  zoneTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  zoneName: {
    color: gameColors.ink,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  riskBadge: {
    backgroundColor: '#E6D7B8',
    borderRadius: 7,
    color: gameColors.greenDark,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  highRisk: {
    color: '#903A22',
  },
  bodyText: {
    color: gameColors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  rewardPreview: {
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
  zoneStats: {
    gap: 8,
  },
  lockedPanel: {
    alignItems: 'center',
    backgroundColor: '#F5DEB3',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  unlockCopy: {
    flex: 1,
    gap: 6,
  },
  lockedTitle: {
    color: gameColors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  activeRunPanel: {
    alignItems: 'center',
    backgroundColor: '#F9E3BA',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  activeRunCopy: {
    flex: 1,
    gap: 5,
  },
  activeRunTitle: {
    color: gameColors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  claimButton: {
    minWidth: 82,
  },
  assignmentPanel: {
    gap: 9,
  },
  assignmentTitle: {
    color: gameColors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  crewButtonGrid: {
    gap: 8,
  },
  crewButton: {
    justifyContent: 'flex-start',
  },
});
