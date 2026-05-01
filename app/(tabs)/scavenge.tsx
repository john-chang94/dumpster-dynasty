import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { environmentSources } from '@/components/game/asset-sources';
import { RaccoonArt, ZoneThumbnail } from '@/components/game/art';
import {
  ActionButton,
  Card,
  CostRow,
  GameScreen,
  gameColors,
  MessageBanner,
  OverlayPanel,
  ProgressBar,
  ResourceAmount,
  SceneScreen,
  SectionTitle,
  StatLine,
} from '@/components/game/ui';
import {
  formatDuration,
  hasResources,
  RACCOON_CLASSES,
  RACCOONS,
  RESOURCE_KEYS,
  ResourceBundle,
  RaccoonId,
  ZoneId,
  ZONES,
} from '@/constants/game';
import {
  getAvailableRaccoons,
  getRunForZone,
  getRunRemainingSeconds,
  isRunReady,
  ScavengeRun,
  useGame,
  useRunClock,
} from '@/state/game-store';

type ScavengeView = 'map' | 'active';

export default function ScavengeScreen() {
  const now = useRunClock();
  const { state, startRun, claimRun, unlockZone } = useGame();
  const [view, setView] = useState<ScavengeView>('active');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const activeRun = state.runs.find((run) => run.id === selectedRunId) ?? state.runs[0];
  const availableRaccoons = getAvailableRaccoons(state);

  if (activeRun && view === 'active') {
    return (
      <SceneScreen
        background={environmentSources[activeRun.zoneId]}
        title="Active Scavenge"
        subtitle={`${state.runs.length} ${state.runs.length === 1 ? 'run' : 'runs'} underway`}>
        <ActiveRunView
          activeRuns={state.runs}
          claimRun={claimRun}
          now={now}
          onMap={() => setView('map')}
          onSelectRun={setSelectedRunId}
          run={activeRun}
        />
      </SceneScreen>
    );
  }

  function viewRun(runId: string) {
    setSelectedRunId(runId);
    setView('active');
  }

  return (
    <GameScreen title="Scavenge Map" subtitle="Pick a route, assign an available raccoon, then return for the haul.">
      <MessageBanner scope="scavenge" />

      <Card style={styles.summaryCard}>
        <SectionTitle
          title="Assignment"
          action={
            activeRun ? (
              <ActionButton icon="run-fast" tone="plain" onPress={() => viewRun(activeRun.id)} style={styles.smallButton}>
                Active Runs
              </ActionButton>
            ) : null
          }
        />
        <View style={styles.summaryGrid}>
          <StatLine icon="account-check" label="Available crew" value={`${availableRaccoons.length}`} />
          <StatLine icon="timer-sand" label="Active runs" value={`${state.runs.length}`} />
          <StatLine icon="map-marker" label="Zones open" value={`${state.unlockedZones.length} / 3`} />
        </View>
      </Card>

      {(Object.keys(ZONES) as ZoneId[]).map((zoneId) => (
        <ZoneCard
          availableRaccoons={availableRaccoons}
          claimRun={claimRun}
          key={zoneId}
          now={now}
          resources={state.resources}
          run={getRunForZone(state, zoneId)}
          startRun={startRun}
          unlocked={state.unlockedZones.includes(zoneId)}
          unlockZone={unlockZone}
          viewRun={viewRun}
          zoneId={zoneId}
        />
      ))}
    </GameScreen>
  );
}

function ZoneCard({
  zoneId,
  unlocked,
  availableRaccoons,
  resources,
  run,
  now,
  startRun,
  claimRun,
  unlockZone,
  viewRun,
}: {
  zoneId: ZoneId;
  unlocked: boolean;
  availableRaccoons: RaccoonId[];
  resources: ResourceBundle;
  run?: ScavengeRun;
  now: number;
  startRun: (zoneId: ZoneId, raccoonId: RaccoonId) => void;
  claimRun: (runId: string) => void;
  unlockZone: (zoneId: ZoneId) => void;
  viewRun: (runId: string) => void;
}) {
  const zone = ZONES[zoneId];
  const ready = run ? isRunReady(run, now) : false;
  const canUnlock = Boolean(zone.unlockCost && hasResources(resources, zone.unlockCost));

  return (
    <Card style={styles.zoneCard}>
      <View style={styles.zoneTop}>
        <ZoneThumbnail height={82} width={96} zoneId={zoneId} />
        <View style={styles.zoneCopy}>
          <View style={styles.zoneTitleRow}>
            <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.zoneName}>
              {zone.name}
            </Text>
            <Text style={[styles.riskBadge, zone.risk === 'High' && styles.highRisk]}>{zone.risk}</Text>
          </View>
          <Text numberOfLines={2} style={styles.bodyText}>{zone.purpose}</Text>
          <View style={styles.rewardPreview}>
            {RESOURCE_KEYS.filter((key) => zone.baseRewards[key] > 0).map((key) => (
              <ResourceAmount key={key} amount={zone.baseRewards[key]} resourceKey={key} />
            ))}
          </View>
          <View style={styles.zoneMetaRow}>
            <InlineStat icon="clock-outline" value={formatDuration(zone.durationSec)} />
            <InlineStat icon="star-four-points" value={`${Math.round(zone.rareChance * 100)}% rare`} />
          </View>
        </View>
      </View>

      {!unlocked ? (
        <View style={styles.assignmentPanel}>
          <View style={styles.assignmentCopy}>
            <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.assignmentTitle}>
              Unlock route
            </Text>
            <CostRow cost={zone.unlockCost ?? null} resources={resources} />
          </View>
          <ActionButton disabled={!canUnlock} icon="lock-open-variant" onPress={() => unlockZone(zoneId)} style={styles.zoneButton}>
            Unlock
          </ActionButton>
        </View>
      ) : run ? (
        <View style={styles.assignmentPanel}>
          <RaccoonArt raccoonId={run.raccoonId} size={58} />
          <View style={styles.assignmentCopy}>
            <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.assignmentTitle}>
              {RACCOONS[run.raccoonId].name} is on route.
            </Text>
            <Text style={styles.bodyText}>{ready ? 'Ready to claim' : `${formatDuration(getRunRemainingSeconds(run, now))} remaining`}</Text>
            <ProgressBar value={1 - getRunRemainingSeconds(run, now) / run.durationSec} />
          </View>
          <View style={styles.runActions}>
            <ActionButton icon="eye" tone="plain" onPress={() => viewRun(run.id)} style={styles.zoneButton}>
              View
            </ActionButton>
            <ActionButton disabled={!ready} icon="package-variant" onPress={() => claimRun(run.id)} style={styles.zoneButton}>
              Claim
            </ActionButton>
          </View>
        </View>
      ) : (
        <View style={styles.crewStrip}>
          <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.assignmentTitle}>
            Assign crew
          </Text>
          {availableRaccoons.length > 0 ? (
            <View style={styles.crewChoices}>
              {availableRaccoons.map((raccoonId) => {
                const raccoon = RACCOONS[raccoonId];
                const raccoonClass = RACCOON_CLASSES[raccoon.classId];

                return (
                  <ActionButton
                    icon="send"
                    key={raccoonId}
                    onPress={() => startRun(zoneId, raccoonId)}
                    tone="secondary"
                    style={styles.crewButton}>
                    {raccoon.name} - {raccoonClass.label}
                  </ActionButton>
                );
              })}
            </View>
          ) : (
            <Text style={styles.bodyText}>All recruited raccoons are busy.</Text>
          )}
        </View>
      )}
    </Card>
  );
}

function ActiveRunView({
  run,
  activeRuns,
  now,
  claimRun,
  onMap,
  onSelectRun,
}: {
  run: ScavengeRun;
  activeRuns: ScavengeRun[];
  now: number;
  claimRun: (runId: string) => void;
  onMap: () => void;
  onSelectRun: (runId: string) => void;
}) {
  const remainingSeconds = getRunRemainingSeconds(run, now);
  const ready = isRunReady(run, now);
  const zone = ZONES[run.zoneId];
  const raccoon = RACCOONS[run.raccoonId];

  return (
    <View style={styles.activeContent}>
      <View style={styles.activeBadge}>
        <RaccoonArt raccoonId={run.raccoonId} size={50} />
        <View style={styles.activeBadgeCopy}>
          <Text style={styles.activeName}>{raccoon.name}</Text>
          <Text style={styles.activeMeta}>{ready ? 'Ready' : formatDuration(remainingSeconds)}</Text>
        </View>
      </View>

      <View style={styles.activeRaccoon}>
        <RaccoonArt raccoonId={run.raccoonId} size={130} />
      </View>

      <View style={styles.bottomStack}>
        <OverlayPanel style={styles.activePanel}>
          {activeRuns.length > 1 ? (
            <View style={styles.runSwitcher}>
              {activeRuns.map((candidate) => (
                <Pressable
                  accessibilityRole="button"
                  key={candidate.id}
                  onPress={() => onSelectRun(candidate.id)}
                  style={[styles.runSwitchChip, candidate.id === run.id && styles.runSwitchChipActive]}>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.76}
                    numberOfLines={1}
                    style={[styles.runSwitchText, candidate.id === run.id && styles.runSwitchTextActive]}>
                    {getZoneShortName(candidate.zoneId)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Text style={styles.panelKicker}>Loot Run</Text>
          <Text style={styles.panelTitle}>{zone.name}</Text>
          <Text style={styles.bodyText}>{ready ? 'The crew is back with a haul.' : `${raccoon.name} is still scouting the route.`}</Text>
          <ProgressBar value={1 - remainingSeconds / run.durationSec} />
          <View style={styles.rewardPreview}>
            {RESOURCE_KEYS.filter((key) => zone.baseRewards[key] > 0).map((key) => (
              <ResourceAmount key={key} amount={zone.baseRewards[key]} resourceKey={key} />
            ))}
            <View style={styles.rareBadge}>
              <MaterialCommunityIcons name="star-four-points" size={15} color={gameColors.orangeDark} />
              <Text style={styles.rareText}>{Math.round(zone.rareChance * 100)}%</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <ActionButton disabled={!ready} icon="package-variant" onPress={() => claimRun(run.id)} style={styles.primaryAction}>
              {ready ? 'Claim Haul' : 'Scavenging'}
            </ActionButton>
            <ActionButton icon="map" tone="plain" onPress={onMap} style={styles.secondaryAction}>
              Map
            </ActionButton>
          </View>
        </OverlayPanel>
      </View>
    </View>
  );
}

function getZoneShortName(zoneId: ZoneId) {
  switch (zoneId) {
    case 'alley':
      return 'Alley';
    case 'backlot':
      return 'Backlot';
    case 'store':
      return 'Store';
  }
}

function InlineStat({
  icon,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.inlineStat}>
      <MaterialCommunityIcons name={icon} size={13} color={gameColors.greenDark} />
      <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.inlineStatText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: 10,
  },
  smallButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  summaryGrid: {
    gap: 8,
  },
  zoneCard: {
    gap: 10,
  },
  zoneTop: {
    flexDirection: 'row',
    gap: 10,
  },
  zoneCopy: {
    flex: 1,
    gap: 6,
    minWidth: 0,
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
    fontWeight: '800',
    lineHeight: 18,
  },
  rewardPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  zoneMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  inlineStat: {
    alignItems: 'center',
    backgroundColor: '#F8E3B8',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    minHeight: 25,
    paddingHorizontal: 7,
  },
  inlineStatText: {
    color: gameColors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  assignmentPanel: {
    alignItems: 'center',
    backgroundColor: '#F9E3BA',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  assignmentCopy: {
    flex: 1,
    gap: 6,
  },
  assignmentTitle: {
    color: gameColors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  zoneButton: {
    minHeight: 34,
    minWidth: 78,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  runActions: {
    gap: 7,
  },
  crewStrip: {
    gap: 8,
  },
  crewChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  crewButton: {
    minHeight: 36,
    paddingHorizontal: 8,
    paddingVertical: 7,
    width: '48.8%',
  },
  activeContent: {
    flex: 1,
  },
  activeBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 38, 20, 0.82)',
    borderColor: 'rgba(255, 244, 220, 0.25)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  activeBadgeCopy: {
    gap: 2,
  },
  activeName: {
    color: '#FFF9E9',
    fontSize: 13,
    fontWeight: '900',
  },
  activeMeta: {
    color: '#F0C875',
    fontSize: 11,
    fontWeight: '900',
  },
  activeRaccoon: {
    alignItems: 'center',
    bottom: 250,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  bottomStack: {
    bottom: 12,
    gap: 8,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  activePanel: {
    gap: 9,
  },
  runSwitcher: {
    flexDirection: 'row',
    gap: 6,
  },
  runSwitchChip: {
    alignItems: 'center',
    backgroundColor: '#F8E3B8',
    borderColor: 'rgba(84, 52, 25, 0.25)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  runSwitchChipActive: {
    backgroundColor: gameColors.orange,
    borderColor: gameColors.orangeDark,
  },
  runSwitchText: {
    color: gameColors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  runSwitchTextActive: {
    color: '#FFF9E9',
  },
  panelKicker: {
    color: gameColors.greenDark,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: gameColors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  rareBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  rareText: {
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
  },
  secondaryAction: {
    minWidth: 88,
  },
});
