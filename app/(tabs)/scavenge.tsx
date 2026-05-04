import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { environmentSources } from '@/components/game/asset-sources';
import { AnimatedRaccoonArt, RaccoonArt, ZoneThumbnail } from '@/components/game/art';
import {
  ActionButton,
  Card,
  CostRow,
  GameScreen,
  gameColors,
  OverlayPanel,
  ProgressBar,
  ResourceAmount,
  SceneScreen,
  SectionTitle,
  StatLine,
} from '@/components/game/ui';
import {
  ACTIVE_ENCOUNTER_CHOICES,
  ActiveEncounterChoiceId,
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
import { useMusicTrack } from '@/hooks/use-audio-events';
import {
  getAvailableRaccoons,
  getEncounterChoiceChance,
  getRunForZone,
  getRunRemainingSeconds,
  isRunReady,
  ScavengeRun,
  useGame,
  useRunClock,
} from '@/state/game-store';

type ScavengeView = 'map' | 'active';

const DEFAULT_TAB_BAR_STYLE = {
  backgroundColor: '#3B2614',
  borderTopColor: '#6A4321',
  minHeight: 62,
  paddingBottom: 8,
  paddingTop: 6,
};

export default function ScavengeScreen() {
  const now = useRunClock();
  useMusicTrack('scavenge');
  const navigation = useNavigation();
  const { state, startRun, claimRun, unlockZone, resolveActiveEncounter } = useGame();
  const [view, setView] = useState<ScavengeView>('active');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const activeRun = state.runs.find((run) => run.id === selectedRunId) ?? state.runs[0];
  const availableRaccoons = getAvailableRaccoons(state);
  const hideTabBar = Boolean(activeRun && view === 'active');

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: hideTabBar ? { display: 'none' } : DEFAULT_TAB_BAR_STYLE,
    });

    return () => {
      navigation.setOptions({ tabBarStyle: DEFAULT_TAB_BAR_STYLE });
    };
  }, [hideTabBar, navigation]);

  if (activeRun && view === 'active') {
    return (
      <SceneScreen
        background={environmentSources[activeRun.zoneId]}
        compactHud
        title="Active Run"
        subtitle={`${state.runs.length} ${state.runs.length === 1 ? 'run' : 'runs'} underway`}>
        <ActiveRunView
          activeRuns={state.runs}
          claimRun={claimRun}
          now={now}
          onMap={() => setView('map')}
          onSelectRun={setSelectedRunId}
          resolveActiveEncounter={resolveActiveEncounter}
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
          discoveredLoot={state.discoveredLoot}
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
  discoveredLoot,
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
  discoveredLoot: string[];
  startRun: (zoneId: ZoneId, raccoonId: RaccoonId) => void;
  claimRun: (runId: string) => void;
  unlockZone: (zoneId: ZoneId) => void;
  viewRun: (runId: string) => void;
}) {
  const zone = ZONES[zoneId];
  const ready = run ? isRunReady(run, now) : false;
  const canUnlock = Boolean(zone.unlockCost && hasResources(resources, zone.unlockCost));
  const discoveredInZone = zone.loot.filter((lootId) => discoveredLoot.includes(lootId)).length;
  const stars = getZoneCollectionStars(discoveredInZone, zone.loot.length);

  return (
    <Card style={[styles.zoneCard, { borderColor: zone.palette.accent }]}>
      <View style={[styles.zoneAccent, { backgroundColor: zone.palette.accent }]} />
      <View style={styles.zoneTop}>
        <View style={[styles.zoneImageFrame, { backgroundColor: zone.palette.shadow }]}>
          <ZoneThumbnail height={86} width={104} zoneId={zoneId} />
        </View>
        <View style={styles.zoneCopy}>
          <View style={styles.zoneTitleRow}>
            <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.zoneName}>
              {zone.name}
            </Text>
            <Text style={[styles.riskBadge, zone.risk === 'High' && styles.highRisk]}>{zone.risk}</Text>
          </View>
          <Text numberOfLines={2} style={styles.bodyText}>{zone.purpose}</Text>
          <View style={styles.zoneProgressRow}>
            <StarStrip stars={stars} />
            <Text style={styles.zoneProgressText}>
              {discoveredInZone} / {zone.loot.length} finds
            </Text>
          </View>
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

function StarStrip({ stars }: { stars: number }) {
  return (
    <View style={styles.starStrip}>
      {[0, 1, 2].map((index) => (
        <MaterialCommunityIcons
          color={index < stars ? gameColors.gold : '#B9A17E'}
          key={index}
          name={index < stars ? 'star' : 'star-outline'}
          size={14}
        />
      ))}
    </View>
  );
}

function ActiveRunView({
  run,
  activeRuns,
  now,
  claimRun,
  resolveActiveEncounter,
  onMap,
  onSelectRun,
}: {
  run: ScavengeRun;
  activeRuns: ScavengeRun[];
  now: number;
  claimRun: (runId: string) => void;
  resolveActiveEncounter: (runId: string, choiceId: ActiveEncounterChoiceId) => void;
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
        <AnimatedRaccoonArt animation={run.encounterResolved ? 'celebrate' : 'walk'} raccoonId={run.raccoonId} size={130} />
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
          {!run.encounterResolved ? (
            <EncounterCard run={run} onResolve={resolveActiveEncounter} />
          ) : run.encounterResult ? (
            <EncounterResultCard run={run} />
          ) : null}
          <View style={styles.compactRunHeader}>
            <View style={styles.compactRunCopy}>
              <Text style={styles.panelKicker}>Loot Run</Text>
              <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.panelTitle}>{zone.name}</Text>
            </View>
            <Text style={styles.statusPill}>{ready ? 'Ready' : formatDuration(remainingSeconds)}</Text>
          </View>
          <ProgressBar value={1 - remainingSeconds / run.durationSec} />
          <View style={styles.compactRunFooter}>
            <View style={styles.rewardPreview}>
              {RESOURCE_KEYS.filter((key) => zone.baseRewards[key] > 0).map((key) => (
                <ResourceAmount
                  key={key}
                  amount={Math.round(zone.baseRewards[key] * (1 + run.resourceMultiplier))}
                  resourceKey={key}
                />
              ))}
              <View style={styles.rareBadge}>
                <MaterialCommunityIcons name="star-four-points" size={15} color={gameColors.orangeDark} />
                <Text style={styles.rareText}>{Math.round(getRunRareChancePreview(run) * 100)}%</Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <ActionButton disabled={!ready} icon="package-variant" onPress={() => claimRun(run.id)} style={styles.primaryAction}>
                {ready ? 'Claim' : 'Scavenging'}
              </ActionButton>
              <ActionButton icon="map" tone="plain" onPress={onMap} style={styles.secondaryAction}>
                Map
              </ActionButton>
            </View>
          </View>
        </OverlayPanel>
      </View>
    </View>
  );
}

function EncounterCard({
  run,
  onResolve,
}: {
  run: ScavengeRun;
  onResolve: (runId: string, choiceId: ActiveEncounterChoiceId) => void;
}) {
  const zone = ZONES[run.zoneId];
  const raccoon = RACCOONS[run.raccoonId];

  return (
    <View style={styles.encounterCard}>
      <View style={styles.encounterCopy}>
        <Text style={styles.panelKicker}>Choice Encounter</Text>
        <Text style={styles.encounterTitle}>Security Light</Text>
        <Text style={styles.encounterBody}>
          {raccoon.name} spotted movement near {zone.name}. Pick a response.
        </Text>
      </View>
      <View style={styles.choiceRow}>
        {(Object.keys(ACTIVE_ENCOUNTER_CHOICES) as ActiveEncounterChoiceId[]).map((choiceId) => {
          const choice = ACTIVE_ENCOUNTER_CHOICES[choiceId];
          const chance = Math.round(getEncounterChoiceChance(choiceId, run.raccoonId) * 100);

          return (
            <EncounterChoiceButton
              choiceId={choiceId}
              chance={chance}
              key={choiceId}
              label={choice.label}
              onPress={() => onResolve(run.id, choiceId)}
            />
          );
        })}
      </View>
    </View>
  );
}

function EncounterChoiceButton({
  choiceId,
  chance,
  label,
  onPress,
}: {
  choiceId: ActiveEncounterChoiceId;
  chance: number;
  label: string;
  onPress: () => void;
}) {
  const activeStyle =
    choiceId === 'grab' ? styles.choiceButtonGrab : choiceId === 'hide' ? styles.choiceButtonHide : styles.choiceButtonDash;
  const activeTextStyle = choiceId === 'dash' ? styles.choiceButtonTextPlain : styles.choiceButtonTextFilled;
  const iconColor = choiceId === 'dash' ? gameColors.muted : '#FFF9E9';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.choiceButton, activeStyle, pressed && styles.choiceButtonPressed]}>
      <MaterialCommunityIcons name={getChoiceIcon(choiceId)} size={17} color={iconColor} />
      <View style={styles.choiceButtonCopy}>
        <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={[styles.choiceButtonLabel, activeTextStyle]}>
          {label}
        </Text>
        <Text style={[styles.choiceButtonChance, activeTextStyle]}>{chance}%</Text>
      </View>
    </Pressable>
  );
}

function EncounterResultCard({ run }: { run: ScavengeRun }) {
  const result = run.encounterResult;

  if (!result) {
    return null;
  }

  return (
    <View style={styles.encounterResult}>
      <MaterialCommunityIcons
        name={result.success ? 'check-circle' : 'alert-circle'}
        size={18}
        color={result.success ? gameColors.greenDark : gameColors.orangeDark}
      />
      <View style={styles.encounterResultCopy}>
        <Text style={styles.encounterResultText}>{result.message}</Text>
        <View style={styles.resultChipRow}>
          {result.resourceMultiplierDelta > 0 ? (
            <Text style={styles.resultChip}>+{Math.round(result.resourceMultiplierDelta * 100)}% haul</Text>
          ) : null}
          {result.rareBonusDelta > 0 ? (
            <Text style={styles.resultChip}>+{Math.round(result.rareBonusDelta * 100)}% rare</Text>
          ) : null}
          {result.durationDeltaSec !== 0 ? (
            <Text style={styles.resultChip}>
              {result.durationDeltaSec < 0 ? '-' : '+'}
              {formatDuration(Math.abs(result.durationDeltaSec))}
            </Text>
          ) : null}
        </View>
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

function getRunRareChancePreview(run: ScavengeRun) {
  const zone = ZONES[run.zoneId];
  const raccoon = RACCOONS[run.raccoonId];
  const classBonus = raccoon.classId === 'sniffer' ? 0.22 : raccoon.classId === 'sneak' ? 0.08 : 0;

  return Math.min(0.95, zone.rareChance + classBonus + run.rareBonus);
}

function getZoneCollectionStars(discoveredCount: number, totalCount: number) {
  if (totalCount <= 0 || discoveredCount <= 0) {
    return 0;
  }

  return Math.min(3, Math.ceil((discoveredCount / totalCount) * 3));
}

function getChoiceIcon(choiceId: ActiveEncounterChoiceId): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (choiceId) {
    case 'hide':
      return 'eye-off';
    case 'dash':
      return 'run-fast';
    case 'grab':
      return 'package-variant';
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
    overflow: 'hidden',
    gap: 10,
    paddingLeft: 16,
  },
  zoneAccent: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 6,
  },
  zoneTop: {
    flexDirection: 'row',
    gap: 10,
  },
  zoneImageFrame: {
    borderRadius: 8,
    padding: 3,
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
  zoneProgressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  starStrip: {
    alignItems: 'center',
    backgroundColor: '#3B2614',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 1,
    minHeight: 24,
    paddingHorizontal: 7,
  },
  zoneProgressText: {
    color: gameColors.greenDark,
    fontSize: 11,
    fontWeight: '900',
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
    bottom: 270,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  bottomStack: {
    bottom: 10,
    gap: 8,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  activePanel: {
    gap: 7,
    padding: 10,
  },
  encounterCard: {
    backgroundColor: '#F9E3BA',
    borderColor: 'rgba(84, 52, 25, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 7,
  },
  encounterCopy: {
    gap: 2,
  },
  encounterTitle: {
    color: gameColors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  encounterBody: {
    color: gameColors.muted,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 7,
  },
  choiceButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 39,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  choiceButtonHide: {
    backgroundColor: gameColors.green,
    borderColor: gameColors.greenDark,
  },
  choiceButtonDash: {
    backgroundColor: '#F8E3B8',
    borderColor: 'rgba(84, 52, 25, 0.25)',
  },
  choiceButtonGrab: {
    backgroundColor: gameColors.orange,
    borderColor: gameColors.orangeDark,
  },
  choiceButtonPressed: {
    opacity: 0.78,
    transform: [{ translateY: 1 }],
  },
  choiceButtonCopy: {
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  choiceButtonLabel: {
    fontSize: 12,
    fontWeight: '900',
  },
  choiceButtonChance: {
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
  },
  choiceButtonTextFilled: {
    color: '#FFF9E9',
  },
  choiceButtonTextPlain: {
    color: gameColors.ink,
  },
  encounterResult: {
    alignItems: 'flex-start',
    backgroundColor: '#F9E3BA',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    padding: 8,
  },
  encounterResultCopy: {
    flex: 1,
    gap: 6,
  },
  encounterResultText: {
    color: gameColors.ink,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
  },
  resultChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  resultChip: {
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.16)',
    borderRadius: 7,
    borderWidth: 1,
    color: gameColors.greenDark,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
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
  compactRunHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  compactRunCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  statusPill: {
    backgroundColor: '#F8E3B8',
    borderColor: 'rgba(84, 52, 25, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    color: gameColors.ink,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  compactRunFooter: {
    gap: 7,
  },
  panelKicker: {
    color: gameColors.greenDark,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: gameColors.ink,
    fontSize: 16,
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
    gap: 7,
  },
  primaryAction: {
    flex: 1,
    minHeight: 36,
    paddingVertical: 7,
  },
  secondaryAction: {
    minHeight: 36,
    minWidth: 88,
    paddingVertical: 7,
  },
});
