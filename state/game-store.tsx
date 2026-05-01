import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { AppState } from 'react-native';

import {
  ACTIVE_ENCOUNTER_CHOICES,
  ActiveEncounterChoiceId,
  ActiveEncounterResult,
  addResources,
  BUILDINGS,
  BuildingId,
  createResourceBundle,
  DAILY_QUEST_IDS,
  DAILY_QUESTS,
  getBuildingUpgradeCost,
  hasResources,
  LOOT_ITEMS,
  MILESTONE_IDS,
  MILESTONE_REWARDS,
  MilestoneId,
  QuestId,
  RACCOON_CLASSES,
  RACCOONS,
  RaccoonId,
  RESOURCE_KEYS,
  ResourceBundle,
  ResourceCost,
  subtractResources,
  ZoneId,
  ZONES,
} from '@/constants/game';

const SAVE_KEY = 'dumpster-dynasty-save-v1';
const OFFLINE_CAP_HOURS = 8;

export type BuildingState = Record<BuildingId, { level: number }>;
export type RaccoonState = Record<RaccoonId, { unlocked: boolean; level: number }>;
export type MessageScope = 'base' | 'build' | 'collection' | 'scavenge' | 'shop';
export type QuestProgress = Record<QuestId, number>;

export type OfflineSummary = {
  startedAt: number;
  endedAt: number;
  elapsedMs: number;
  rewards: ResourceBundle;
  cappedHours: number;
};

export type ScavengeRun = {
  id: string;
  zoneId: ZoneId;
  raccoonId: RaccoonId;
  startedAt: number;
  durationSec: number;
  encounterResolved: boolean;
  resourceMultiplier: number;
  rareBonus: number;
  encounterResult?: ActiveEncounterResult;
};

export type GameState = {
  resources: ResourceBundle;
  buildings: BuildingState;
  raccoons: RaccoonState;
  unlockedZones: ZoneId[];
  runs: ScavengeRun[];
  discoveredLoot: string[];
  pendingOfflineRewards: ResourceBundle;
  offlineSummary?: OfflineSummary;
  dailyQuestDate: string;
  questProgress: QuestProgress;
  claimedDailyQuestIds: QuestId[];
  claimedMilestoneIds: MilestoneId[];
  lastSeenAt: number;
  totalRunsClaimed: number;
  lastMessage?: string;
  lastMessageScope?: MessageScope;
};

type GameAction =
  | { type: 'hydrate'; state: GameState }
  | { type: 'claimOffline'; now: number }
  | { type: 'tapLootPile'; now: number }
  | { type: 'startRun'; zoneId: ZoneId; raccoonId: RaccoonId; now: number }
  | { type: 'claimRun'; runId: string; now: number; scope?: MessageScope }
  | { type: 'upgradeBuilding'; buildingId: BuildingId; now: number }
  | { type: 'unlockZone'; zoneId: ZoneId; now: number }
  | { type: 'recruitRaccoon'; raccoonId: RaccoonId; now: number }
  | { type: 'claimDailyQuestReward'; questId: QuestId; now: number }
  | { type: 'claimMilestoneReward'; milestoneId: MilestoneId; now: number }
  | { type: 'resolveActiveEncounter'; runId: string; choiceId: ActiveEncounterChoiceId; now: number }
  | { type: 'dismissOfflineSummary'; now: number }
  | { type: 'clearMessage' };

type GameContextValue = {
  state: GameState;
  loaded: boolean;
  claimOfflineRewards: () => void;
  tapLootPile: () => void;
  startRun: (zoneId: ZoneId, raccoonId: RaccoonId) => void;
  claimRun: (runId: string, scope?: MessageScope) => void;
  upgradeBuilding: (buildingId: BuildingId) => void;
  unlockZone: (zoneId: ZoneId) => void;
  recruitRaccoon: (raccoonId: RaccoonId) => void;
  claimDailyQuestReward: (questId: QuestId) => void;
  claimMilestoneReward: (milestoneId: MilestoneId) => void;
  resolveActiveEncounter: (runId: string, choiceId: ActiveEncounterChoiceId) => void;
  dismissOfflineSummary: () => void;
  clearMessage: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSave() {
      try {
        const rawSave = await AsyncStorage.getItem(SAVE_KEY);
        const hydratedState = hydrateSave(rawSave, Date.now());

        if (!cancelled) {
          dispatch({ type: 'hydrate', state: hydratedState });
        }
      } catch {
        if (!cancelled) {
          dispatch({
            type: 'hydrate',
            state: {
              ...createInitialState(),
              lastMessage: 'Started a fresh local save.',
              lastMessageScope: 'base',
            },
          });
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    loadSave();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    saveState(state);
  }, [loaded, state]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'background' || status === 'inactive') {
        saveState(state);
      }
    });

    return () => subscription.remove();
  }, [state]);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      loaded,
      claimOfflineRewards: () => dispatch({ type: 'claimOffline', now: Date.now() }),
      tapLootPile: () => dispatch({ type: 'tapLootPile', now: Date.now() }),
      startRun: (zoneId, raccoonId) =>
        dispatch({ type: 'startRun', zoneId, raccoonId, now: Date.now() }),
      claimRun: (runId, scope) => dispatch({ type: 'claimRun', runId, now: Date.now(), scope }),
      upgradeBuilding: (buildingId) =>
        dispatch({ type: 'upgradeBuilding', buildingId, now: Date.now() }),
      unlockZone: (zoneId) => dispatch({ type: 'unlockZone', zoneId, now: Date.now() }),
      recruitRaccoon: (raccoonId) =>
        dispatch({ type: 'recruitRaccoon', raccoonId, now: Date.now() }),
      claimDailyQuestReward: (questId) =>
        dispatch({ type: 'claimDailyQuestReward', questId, now: Date.now() }),
      claimMilestoneReward: (milestoneId) =>
        dispatch({ type: 'claimMilestoneReward', milestoneId, now: Date.now() }),
      resolveActiveEncounter: (runId, choiceId) =>
        dispatch({ type: 'resolveActiveEncounter', runId, choiceId, now: Date.now() }),
      dismissOfflineSummary: () => dispatch({ type: 'dismissOfflineSummary', now: Date.now() }),
      clearMessage: () => dispatch({ type: 'clearMessage' }),
    }),
    [loaded, state],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGame must be used inside GameProvider.');
  }

  return context;
}

export function useRunClock(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}

export function createInitialState(now = Date.now()): GameState {
  return {
    resources: { food: 120, scrap: 90, shinies: 5 },
    buildings: {
      nest: { level: 1 },
      snack: { level: 1 },
      sort: { level: 1 },
      vault: { level: 1 },
      training: { level: 1 },
    },
    raccoons: {
      scout: { unlocked: true, level: 1 },
      hauler: { unlocked: false, level: 1 },
      sniffer: { unlocked: false, level: 1 },
      sneak: { unlocked: false, level: 1 },
    },
    unlockedZones: ['alley'],
    runs: [],
    discoveredLoot: [],
    pendingOfflineRewards: createResourceBundle(),
    offlineSummary: undefined,
    dailyQuestDate: getLocalDateKey(now),
    questProgress: createQuestProgress(),
    claimedDailyQuestIds: [],
    claimedMilestoneIds: [],
    lastSeenAt: now,
    totalRunsClaimed: 0,
    lastMessage: 'Tap the loot pile, send Scout out, then upgrade the base.',
    lastMessageScope: 'base',
  };
}

export function getEncounterChoiceChance(choiceId: ActiveEncounterChoiceId, raccoonId: RaccoonId) {
  const choice = ACTIVE_ENCOUNTER_CHOICES[choiceId];
  const raccoon = RACCOONS[raccoonId];
  let chance = choice.baseChance;

  if (choiceId === 'dash' && raccoon.classId === 'scout') {
    chance += 0.14;
  }

  if (choiceId === 'grab' && raccoon.classId === 'hauler') {
    chance += 0.14;
  }

  if (choiceId === 'hide' && raccoon.classId === 'sneak') {
    chance += 0.14;
  }

  return clampNumber(chance, 0.05, 0.95);
}

export function isRunReady(run: ScavengeRun, now = Date.now()) {
  return now >= run.startedAt + run.durationSec * 1000;
}

export function getRunRemainingSeconds(run: ScavengeRun, now = Date.now()) {
  return Math.max(0, Math.ceil((run.startedAt + run.durationSec * 1000 - now) / 1000));
}

export function getBusyRaccoonIds(state: GameState): RaccoonId[] {
  return state.runs.map((run) => run.raccoonId);
}

export function getUnlockedRaccoons(state: GameState): RaccoonId[] {
  return (Object.keys(RACCOONS) as RaccoonId[]).filter((raccoonId) => state.raccoons[raccoonId]?.unlocked);
}

export function getAvailableRaccoons(state: GameState): RaccoonId[] {
  const busyRaccoons = new Set(getBusyRaccoonIds(state));

  return getUnlockedRaccoons(state).filter((raccoonId) => !busyRaccoons.has(raccoonId));
}

export function getRunForZone(state: GameState, zoneId: ZoneId) {
  return state.runs.find((run) => run.zoneId === zoneId);
}

export function getResourceTotal(resources: ResourceCost) {
  return RESOURCE_KEYS.reduce((total, key) => total + (resources[key] ?? 0), 0);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  if ('now' in action) {
    state = ensureDailyQuests(state, action.now);
  }

  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'claimOffline':
      if (getResourceTotal(state.pendingOfflineRewards) <= 0) {
        return {
          ...state,
          offlineSummary: undefined,
          lastMessage: 'No offline stash waiting yet.',
          lastMessageScope: 'base',
        };
      }

      return incrementQuestProgress({
        ...state,
        resources: addResources(state.resources, state.pendingOfflineRewards),
        pendingOfflineRewards: createResourceBundle(),
        offlineSummary: undefined,
        lastSeenAt: action.now,
        lastMessage: 'Offline stash claimed.',
        lastMessageScope: 'base',
      }, 'collect_scrap', state.pendingOfflineRewards.scrap);
    case 'tapLootPile': {
      const shinies = Math.random() < 0.16 ? 1 : 0;
      const reward = { food: 12, scrap: 9, shinies };

      return incrementQuestProgress({
        ...state,
        resources: addResources(state.resources, reward),
        discoveredLoot: maybeDiscoverLoot(state.discoveredLoot, ['pizza_crust', 'soda_can'], 0.35),
        lastSeenAt: action.now,
        lastMessage: shinies > 0 ? 'Loot pile had a shiny tucked under it.' : 'Loot pile sorted.',
        lastMessageScope: 'base',
      }, 'collect_scrap', reward.scrap);
    }
    case 'startRun': {
      const zone = ZONES[action.zoneId];
      const raccoon = RACCOONS[action.raccoonId];

      if (!state.unlockedZones.includes(zone.id)) {
        return { ...state, lastMessage: `${zone.name} is still locked.`, lastMessageScope: 'scavenge' };
      }

      if (!state.raccoons[raccoon.id]?.unlocked) {
        return { ...state, lastMessage: `${raccoon.name} is not recruited yet.`, lastMessageScope: 'scavenge' };
      }

      if (state.runs.some((run) => run.raccoonId === raccoon.id)) {
        return { ...state, lastMessage: `${raccoon.name} is already out scavenging.`, lastMessageScope: 'scavenge' };
      }

      if (state.runs.some((run) => run.zoneId === zone.id)) {
        return { ...state, lastMessage: `${zone.name} already has a run in progress.`, lastMessageScope: 'scavenge' };
      }

      return incrementQuestProgress({
        ...state,
        runs: [
          ...state.runs,
          {
            id: `${action.zoneId}-${action.raccoonId}-${action.now}`,
            zoneId: action.zoneId,
            raccoonId: action.raccoonId,
            startedAt: action.now,
            durationSec: getAdjustedRunDuration(state, action.zoneId, action.raccoonId),
            encounterResolved: false,
            resourceMultiplier: 0,
            rareBonus: 0,
          },
        ],
        lastSeenAt: action.now,
        lastMessage: `${raccoon.name} headed for ${zone.name}.`,
        lastMessageScope: 'scavenge',
      }, 'send_scavenges', 1);
    }
    case 'claimRun': {
      const run = state.runs.find((candidate) => candidate.id === action.runId);

      if (!run) {
        return { ...state, lastMessage: 'That run is no longer active.', lastMessageScope: action.scope ?? 'scavenge' };
      }

      if (!isRunReady(run, action.now)) {
        return { ...state, lastMessage: 'That crew is still scavenging.', lastMessageScope: action.scope ?? 'scavenge' };
      }

      const reward = rollRunReward(state, run);
      const discoveredLoot = reward.lootId
        ? addUnique(state.discoveredLoot, reward.lootId)
        : state.discoveredLoot;
      const lootName = reward.lootId ? LOOT_ITEMS[reward.lootId].name : null;

      return incrementQuestProgress({
        ...state,
        resources: addResources(state.resources, reward.resources),
        runs: state.runs.filter((candidate) => candidate.id !== run.id),
        discoveredLoot,
        totalRunsClaimed: state.totalRunsClaimed + 1,
        lastSeenAt: action.now,
        lastMessage: lootName ? `Run claimed. New find: ${lootName}.` : 'Run claimed.',
        lastMessageScope: action.scope ?? 'scavenge',
      }, 'collect_scrap', reward.resources.scrap);
    }
    case 'upgradeBuilding': {
      const building = BUILDINGS[action.buildingId];
      const level = state.buildings[action.buildingId].level;
      const cost = getBuildingUpgradeCost(action.buildingId, level);

      if (!cost) {
        return { ...state, lastMessage: `${building.name} is already maxed for this prototype.`, lastMessageScope: 'build' };
      }

      if (!hasResources(state.resources, cost)) {
        return { ...state, lastMessage: `Need more resources for ${building.name}.`, lastMessageScope: 'build' };
      }

      return incrementQuestProgress({
        ...state,
        resources: subtractResources(state.resources, cost),
        buildings: {
          ...state.buildings,
          [action.buildingId]: { level: level + 1 },
        },
        lastSeenAt: action.now,
        lastMessage: `${building.name} upgraded to Level ${level + 1}.`,
        lastMessageScope: 'build',
      }, 'upgrade_building', 1);
    }
    case 'unlockZone': {
      const zone = ZONES[action.zoneId];

      if (state.unlockedZones.includes(action.zoneId)) {
        return { ...state, lastMessage: `${zone.name} is already open.`, lastMessageScope: 'scavenge' };
      }

      if (!zone.unlockCost || !hasResources(state.resources, zone.unlockCost)) {
        return { ...state, lastMessage: `Need more resources to unlock ${zone.name}.`, lastMessageScope: 'scavenge' };
      }

      return {
        ...state,
        resources: subtractResources(state.resources, zone.unlockCost),
        unlockedZones: [...state.unlockedZones, action.zoneId],
        lastSeenAt: action.now,
        lastMessage: `${zone.name} unlocked.`,
        lastMessageScope: 'scavenge',
      };
    }
    case 'recruitRaccoon': {
      const raccoon = RACCOONS[action.raccoonId];

      if (state.raccoons[action.raccoonId].unlocked) {
        return { ...state, lastMessage: `${raccoon.name} is already in the crew.`, lastMessageScope: 'collection' };
      }

      if (!hasResources(state.resources, raccoon.recruitCost)) {
        return { ...state, lastMessage: `Need more resources to recruit ${raccoon.name}.`, lastMessageScope: 'collection' };
      }

      return {
        ...state,
        resources: subtractResources(state.resources, raccoon.recruitCost),
        raccoons: {
          ...state.raccoons,
          [action.raccoonId]: {
            ...state.raccoons[action.raccoonId],
            unlocked: true,
          },
        },
        lastSeenAt: action.now,
        lastMessage: `${raccoon.name} joined the crew.`,
        lastMessageScope: 'collection',
      };
    }
    case 'claimDailyQuestReward': {
      const quest = DAILY_QUESTS[action.questId];

      if (state.claimedDailyQuestIds.includes(action.questId)) {
        return { ...state, lastMessage: `${quest.title} is already claimed.`, lastMessageScope: 'collection' };
      }

      if ((state.questProgress[action.questId] ?? 0) < quest.target) {
        return { ...state, lastMessage: `${quest.title} is not complete yet.`, lastMessageScope: 'collection' };
      }

      return {
        ...state,
        resources: addResources(state.resources, quest.reward),
        claimedDailyQuestIds: addUnique(state.claimedDailyQuestIds, action.questId),
        lastSeenAt: action.now,
        lastMessage: `${quest.title} reward claimed.`,
        lastMessageScope: 'collection',
      };
    }
    case 'claimMilestoneReward': {
      const milestone = MILESTONE_REWARDS[action.milestoneId];

      if (state.claimedMilestoneIds.includes(action.milestoneId)) {
        return { ...state, lastMessage: `${milestone.title} is already claimed.`, lastMessageScope: 'collection' };
      }

      if (state.totalRunsClaimed < milestone.targetRuns) {
        return { ...state, lastMessage: `${milestone.title} is not complete yet.`, lastMessageScope: 'collection' };
      }

      return {
        ...state,
        resources: addResources(state.resources, milestone.reward),
        claimedMilestoneIds: addUnique(state.claimedMilestoneIds, action.milestoneId),
        lastSeenAt: action.now,
        lastMessage: `${milestone.title} milestone claimed.`,
        lastMessageScope: 'collection',
      };
    }
    case 'resolveActiveEncounter': {
      const run = state.runs.find((candidate) => candidate.id === action.runId);

      if (!run) {
        return { ...state, lastMessage: 'That run is no longer active.', lastMessageScope: 'scavenge' };
      }

      if (run.encounterResolved) {
        return { ...state, lastMessage: 'That encounter is already resolved.', lastMessageScope: 'scavenge' };
      }

      const result = resolveEncounterChoice(run, action.choiceId, action.now);
      const nextRuns = state.runs.map((candidate) =>
        candidate.id === run.id
          ? {
              ...candidate,
              durationSec: Math.max(15, candidate.durationSec + result.durationDeltaSec),
              encounterResolved: true,
              resourceMultiplier: Math.max(0, candidate.resourceMultiplier + result.resourceMultiplierDelta),
              rareBonus: Math.max(0, candidate.rareBonus + result.rareBonusDelta),
              encounterResult: result,
            }
          : candidate,
      );

      return incrementQuestProgress({
        ...state,
        resources: addResources(state.resources, result.immediateReward),
        runs: nextRuns,
        lastSeenAt: action.now,
        lastMessage: result.message,
        lastMessageScope: 'scavenge',
      }, 'collect_scrap', result.immediateReward.scrap);
    }
    case 'dismissOfflineSummary':
      return {
        ...state,
        offlineSummary: undefined,
        lastSeenAt: action.now,
      };
    case 'clearMessage':
      return {
        ...state,
        lastMessage: undefined,
        lastMessageScope: undefined,
      };
    default:
      return state;
  }
}

function hydrateSave(rawSave: string | null, now: number): GameState {
  if (!rawSave) {
    return createInitialState(now);
  }

  const parsed = JSON.parse(rawSave) as Partial<GameState>;
  const merged = ensureDailyQuests(mergeSavedState(parsed, now), now);
  const offlineRewards = calculateOfflineRewards(merged, now);
  const pendingOfflineRewards = addResources(merged.pendingOfflineRewards, offlineRewards);
  const persistedMessage =
    merged.lastMessage === 'Offline stash is ready to claim.' ? undefined : merged.lastMessage;
  const offlineSummary =
    getResourceTotal(offlineRewards) > 0
      ? createOfflineSummary(merged.lastSeenAt, now, pendingOfflineRewards)
      : createPersistedOfflineSummary(merged.offlineSummary, now, pendingOfflineRewards);

  return {
    ...merged,
    pendingOfflineRewards,
    offlineSummary,
    lastSeenAt: now,
    lastMessage: persistedMessage,
    lastMessageScope: persistedMessage ? merged.lastMessageScope : undefined,
  };
}

function mergeSavedState(saved: Partial<GameState>, now: number): GameState {
  const base = createInitialState(now);
  const buildings = { ...base.buildings };
  const raccoons = { ...base.raccoons };

  (Object.keys(BUILDINGS) as BuildingId[]).forEach((buildingId) => {
    const savedLevel = saved.buildings?.[buildingId]?.level;

    buildings[buildingId] = {
      level: clampLevel(savedLevel, BUILDINGS[buildingId].maxLevel),
    };
  });

  (Object.keys(RACCOONS) as RaccoonId[]).forEach((raccoonId) => {
    raccoons[raccoonId] = {
      unlocked: Boolean(saved.raccoons?.[raccoonId]?.unlocked ?? base.raccoons[raccoonId].unlocked),
      level: clampLevel(saved.raccoons?.[raccoonId]?.level, 20),
    };
  });

  return {
    ...base,
    resources: createResourceBundle(saved.resources),
    buildings,
    raccoons,
    unlockedZones: normalizeUnlockedZones(saved.unlockedZones),
    runs: normalizeRuns(saved.runs),
    discoveredLoot: normalizeLoot(saved.discoveredLoot),
    pendingOfflineRewards: createResourceBundle(saved.pendingOfflineRewards),
    offlineSummary: normalizeOfflineSummary(saved.offlineSummary),
    dailyQuestDate: typeof saved.dailyQuestDate === 'string' ? saved.dailyQuestDate : getLocalDateKey(now),
    questProgress: normalizeQuestProgress(saved.questProgress),
    claimedDailyQuestIds: normalizeQuestIds(saved.claimedDailyQuestIds),
    claimedMilestoneIds: normalizeMilestoneIds(saved.claimedMilestoneIds),
    lastSeenAt: typeof saved.lastSeenAt === 'number' ? saved.lastSeenAt : now,
    totalRunsClaimed: typeof saved.totalRunsClaimed === 'number' ? saved.totalRunsClaimed : 0,
    lastMessage: saved.lastMessage,
    lastMessageScope: normalizeMessageScope(saved.lastMessageScope),
  };
}

function normalizeMessageScope(scope: unknown): MessageScope | undefined {
  return scope === 'base' ||
    scope === 'build' ||
    scope === 'collection' ||
    scope === 'scavenge' ||
    scope === 'shop'
    ? scope
    : undefined;
}

function normalizeUnlockedZones(savedZones: unknown): ZoneId[] {
  const zones = Array.isArray(savedZones) ? savedZones : [];
  const validZones = zones.filter((zoneId): zoneId is ZoneId => zoneId in ZONES);

  return Array.from(new Set<ZoneId>(['alley', ...validZones]));
}

function normalizeRuns(savedRuns: unknown): ScavengeRun[] {
  if (!Array.isArray(savedRuns)) {
    return [];
  }

  return savedRuns
    .filter((run) => {
      return (
        typeof run?.id === 'string' &&
        run.zoneId in ZONES &&
        run.raccoonId in RACCOONS &&
        typeof run.startedAt === 'number' &&
        typeof run.durationSec === 'number'
      );
    })
    .map((run) => ({
      id: run.id,
      zoneId: run.zoneId,
      raccoonId: run.raccoonId,
      startedAt: run.startedAt,
      durationSec: Math.max(15, Math.floor(run.durationSec)),
      encounterResolved: Boolean(run.encounterResolved),
      resourceMultiplier: normalizeBonus(run.resourceMultiplier),
      rareBonus: normalizeBonus(run.rareBonus),
      encounterResult: normalizeEncounterResult(run.encounterResult),
    }));
}

function normalizeLoot(savedLoot: unknown) {
  if (!Array.isArray(savedLoot)) {
    return [];
  }

  return Array.from(
    new Set(savedLoot.filter((lootId): lootId is string => typeof lootId === 'string' && lootId in LOOT_ITEMS)),
  );
}

function normalizeQuestProgress(savedProgress: unknown): QuestProgress {
  const progress = createQuestProgress();

  if (!savedProgress || typeof savedProgress !== 'object') {
    return progress;
  }

  DAILY_QUEST_IDS.forEach((questId) => {
    const value = (savedProgress as Partial<Record<QuestId, unknown>>)[questId];

    if (typeof value === 'number' && !Number.isNaN(value)) {
      progress[questId] = Math.min(DAILY_QUESTS[questId].target, Math.max(0, Math.floor(value)));
    }
  });

  return progress;
}

function normalizeQuestIds(savedIds: unknown): QuestId[] {
  if (!Array.isArray(savedIds)) {
    return [];
  }

  return Array.from(
    new Set(savedIds.filter((questId): questId is QuestId => (DAILY_QUEST_IDS as string[]).includes(questId))),
  );
}

function normalizeMilestoneIds(savedIds: unknown): MilestoneId[] {
  if (!Array.isArray(savedIds)) {
    return [];
  }

  return Array.from(
    new Set(
      savedIds.filter((milestoneId): milestoneId is MilestoneId =>
        (MILESTONE_IDS as string[]).includes(milestoneId),
      ),
    ),
  );
}

function normalizeOfflineSummary(savedSummary: unknown): OfflineSummary | undefined {
  if (!savedSummary || typeof savedSummary !== 'object') {
    return undefined;
  }

  const summary = savedSummary as Partial<OfflineSummary>;

  if (
    typeof summary.startedAt !== 'number' ||
    typeof summary.endedAt !== 'number' ||
    typeof summary.elapsedMs !== 'number'
  ) {
    return undefined;
  }

  return {
    startedAt: summary.startedAt,
    endedAt: summary.endedAt,
    elapsedMs: Math.max(0, summary.elapsedMs),
    rewards: createResourceBundle(summary.rewards),
    cappedHours: typeof summary.cappedHours === 'number' ? summary.cappedHours : OFFLINE_CAP_HOURS,
  };
}

function normalizeEncounterResult(savedResult: unknown): ActiveEncounterResult | undefined {
  if (!savedResult || typeof savedResult !== 'object') {
    return undefined;
  }

  const result = savedResult as Partial<ActiveEncounterResult>;

  if (
    result.choiceId !== 'hide' &&
    result.choiceId !== 'dash' &&
    result.choiceId !== 'grab'
  ) {
    return undefined;
  }

  return {
    choiceId: result.choiceId,
    success: Boolean(result.success),
    message: typeof result.message === 'string' ? result.message : 'Encounter resolved.',
    resourceMultiplierDelta: normalizeBonus(result.resourceMultiplierDelta),
    rareBonusDelta: normalizeBonus(result.rareBonusDelta),
    durationDeltaSec: typeof result.durationDeltaSec === 'number' ? Math.round(result.durationDeltaSec) : 0,
    immediateReward: createResourceBundle(result.immediateReward),
    resolvedAt: typeof result.resolvedAt === 'number' ? result.resolvedAt : Date.now(),
  };
}

function createQuestProgress(): QuestProgress {
  return {
    send_scavenges: 0,
    collect_scrap: 0,
    upgrade_building: 0,
  };
}

function getLocalDateKey(now: number) {
  const date = new Date(now);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function ensureDailyQuests(state: GameState, now: number): GameState {
  const today = getLocalDateKey(now);

  if (state.dailyQuestDate === today) {
    return state;
  }

  return {
    ...state,
    dailyQuestDate: today,
    questProgress: createQuestProgress(),
    claimedDailyQuestIds: [],
  };
}

function incrementQuestProgress(state: GameState, questId: QuestId, amount: number): GameState {
  if (amount <= 0 || state.claimedDailyQuestIds.includes(questId)) {
    return state;
  }

  const quest = DAILY_QUESTS[questId];
  const current = state.questProgress[questId] ?? 0;
  const nextValue = Math.min(quest.target, current + Math.floor(amount));

  if (nextValue === current) {
    return state;
  }

  return {
    ...state,
    questProgress: {
      ...state.questProgress,
      [questId]: nextValue,
    },
  };
}

function createOfflineSummary(startedAt: number, endedAt: number, rewards: ResourceBundle): OfflineSummary {
  const elapsedMs = Math.min(Math.max(0, endedAt - startedAt), OFFLINE_CAP_HOURS * 3_600_000);

  return {
    startedAt,
    endedAt,
    elapsedMs,
    rewards,
    cappedHours: OFFLINE_CAP_HOURS,
  };
}

function createPersistedOfflineSummary(
  savedSummary: OfflineSummary | undefined,
  now: number,
  rewards: ResourceBundle,
): OfflineSummary | undefined {
  if (getResourceTotal(rewards) <= 0) {
    return undefined;
  }

  return savedSummary
    ? { ...savedSummary, rewards }
    : createOfflineSummary(now, now, rewards);
}

function resolveEncounterChoice(
  run: ScavengeRun,
  choiceId: ActiveEncounterChoiceId,
  now: number,
): ActiveEncounterResult {
  const choice = ACTIVE_ENCOUNTER_CHOICES[choiceId];
  const raccoon = RACCOONS[run.raccoonId];
  const success = Math.random() < getEncounterChoiceChance(choiceId, run.raccoonId);
  let resourceMultiplierDelta = 0;
  let rareBonusDelta = 0;
  let durationDeltaSec = 0;
  let immediateReward = createResourceBundle();

  if (success) {
    resourceMultiplierDelta = choice.rewardMultiplier;
    rareBonusDelta = choice.rareBonus + (raccoon.classId === 'sniffer' ? 0.08 : 0);
    durationDeltaSec = choice.durationReductionPct > 0 ? -Math.round(run.durationSec * choice.durationReductionPct) : 0;
    immediateReward = createResourceBundle(
      raccoon.classId === 'hauler' && choiceId === 'grab'
        ? addResources(createResourceBundle(choice.immediateReward), { scrap: 8 })
        : choice.immediateReward,
    );
  } else if (choiceId === 'grab') {
    durationDeltaSec = Math.round(run.durationSec * 0.15);
  } else if (choiceId === 'dash') {
    durationDeltaSec = Math.round(run.durationSec * 0.08);
  }

  return {
    choiceId,
    success,
    message: getEncounterMessage(choiceId, raccoon.name, success),
    resourceMultiplierDelta,
    rareBonusDelta,
    durationDeltaSec,
    immediateReward,
    resolvedAt: now,
  };
}

function getEncounterMessage(choiceId: ActiveEncounterChoiceId, raccoonName: string, success: boolean) {
  if (success && choiceId === 'hide') {
    return `${raccoonName} stayed quiet. Safer loot chance improved.`;
  }

  if (success && choiceId === 'dash') {
    return `${raccoonName} slipped through fast. Timer shortened.`;
  }

  if (success && choiceId === 'grab') {
    return `${raccoonName} grabbed extra supplies.`;
  }

  if (choiceId === 'hide') {
    return `${raccoonName} waited it out. No bonus this time.`;
  }

  if (choiceId === 'dash') {
    return `${raccoonName} stumbled and lost a little time.`;
  }

  return `${raccoonName} made noise. The route takes longer.`;
}

function calculateOfflineRewards(state: GameState, now: number): ResourceBundle {
  const elapsedMs = Math.max(0, now - state.lastSeenAt);
  const cappedHours = Math.min(elapsedMs / 3_600_000, OFFLINE_CAP_HOURS);

  if (cappedHours < 1 / 60) {
    return createResourceBundle();
  }

  const nestLevel = state.buildings.nest.level;
  const snackLevel = state.buildings.snack.level;
  const sortLevel = state.buildings.sort.level;
  const vaultLevel = state.buildings.vault.level;

  return createResourceBundle({
    food: cappedHours * (18 + nestLevel * 4 + snackLevel * 9),
    scrap: cappedHours * (16 + sortLevel * 10),
    shinies: cappedHours * Math.max(0.25, (vaultLevel - 1) * 0.45),
  });
}

function rollRunReward(state: GameState, run: ScavengeRun) {
  const zone = ZONES[run.zoneId];
  const raccoon = RACCOONS[run.raccoonId];
  const raccoonClass = RACCOON_CLASSES[raccoon.classId];
  const snackBonus = 1 + (state.buildings.snack.level - 1) * 0.12;
  const sortBonus = 1 + (state.buildings.sort.level - 1) * 0.12;
  const vaultBonus = 1 + (state.buildings.vault.level - 1) * 0.1;
  const encounterBonus = 1 + Math.max(0, run.resourceMultiplier);
  const variance = 0.88 + Math.random() * 0.28;
  const resources = createResourceBundle({
    food: zone.baseRewards.food * snackBonus * variance * encounterBonus,
    scrap:
      zone.baseRewards.scrap *
      sortBonus *
      variance *
      (raccoon.classId === 'hauler' ? 1.35 : 1) *
      encounterBonus,
    shinies:
      (zone.baseRewards.shinies + (raccoon.classId === 'sneak' ? 1 : 0)) *
      vaultBonus *
      variance *
      encounterBonus,
  });
  const classRareBonus = raccoon.classId === 'sniffer' ? 0.22 : raccoon.classId === 'sneak' ? 0.08 : 0;
  const rareChance = clampNumber(
    zone.rareChance + classRareBonus + run.rareBonus + (state.buildings.vault.level - 1) * 0.025,
    0,
    0.95,
  );
  const undiscoveredLoot = zone.loot.filter((lootId) => !state.discoveredLoot.includes(lootId));
  const lootPool = undiscoveredLoot.length > 0 ? undiscoveredLoot : zone.loot;
  const lootId = Math.random() < rareChance ? lootPool[Math.floor(Math.random() * lootPool.length)] : undefined;

  return {
    resources,
    lootId,
    bonusLabel: raccoonClass.bonus,
  };
}

function getAdjustedRunDuration(state: GameState, zoneId: ZoneId, raccoonId: RaccoonId) {
  const zone = ZONES[zoneId];
  const raccoon = RACCOONS[raccoonId];
  const scoutBonus = raccoon.classId === 'scout' ? 0.82 : 1;
  const trainingBonus = Math.max(0.65, 1 - (state.buildings.training.level - 1) * 0.06);

  return Math.max(15, Math.round(zone.durationSec * scoutBonus * trainingBonus));
}

function maybeDiscoverLoot(currentLoot: string[], candidates: string[], chance: number) {
  if (Math.random() >= chance) {
    return currentLoot;
  }

  const undiscovered = candidates.filter((lootId) => !currentLoot.includes(lootId));

  if (undiscovered.length === 0) {
    return currentLoot;
  }

  return addUnique(currentLoot, undiscovered[Math.floor(Math.random() * undiscovered.length)]);
}

function addUnique<T>(values: T[], value: T) {
  return values.includes(value) ? values : [...values, value];
}

function clampLevel(value: unknown, maxLevel: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 1;
  }

  return Math.max(1, Math.min(maxLevel, Math.floor(value)));
}

function normalizeBonus(value: unknown) {
  return typeof value === 'number' && !Number.isNaN(value) ? clampNumber(value, 0, 2) : 0;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const saveState = debounce((state: GameState) => {
  const savePayload: GameState = {
    ...state,
    lastSeenAt: Date.now(),
  };

  AsyncStorage.setItem(SAVE_KEY, JSON.stringify(savePayload)).catch(() => undefined);
}, 150);

function debounce<T extends (...args: never[]) => void>(callback: T, waitMs: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => callback(...args), waitMs);
  };
}
