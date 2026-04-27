import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { AppState } from 'react-native';

import {
  addResources,
  BUILDINGS,
  BuildingId,
  createResourceBundle,
  EMPTY_RESOURCES,
  getBuildingUpgradeCost,
  hasResources,
  LOOT_ITEMS,
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

export type ScavengeRun = {
  id: string;
  zoneId: ZoneId;
  raccoonId: RaccoonId;
  startedAt: number;
  durationSec: number;
};

export type GameState = {
  resources: ResourceBundle;
  buildings: BuildingState;
  raccoons: RaccoonState;
  unlockedZones: ZoneId[];
  runs: ScavengeRun[];
  discoveredLoot: string[];
  pendingOfflineRewards: ResourceBundle;
  lastSeenAt: number;
  totalRunsClaimed: number;
  lastMessage?: string;
};

type GameAction =
  | { type: 'hydrate'; state: GameState }
  | { type: 'claimOffline'; now: number }
  | { type: 'tapLootPile'; now: number }
  | { type: 'startRun'; zoneId: ZoneId; raccoonId: RaccoonId; now: number }
  | { type: 'claimRun'; runId: string; now: number }
  | { type: 'upgradeBuilding'; buildingId: BuildingId; now: number }
  | { type: 'unlockZone'; zoneId: ZoneId; now: number }
  | { type: 'recruitRaccoon'; raccoonId: RaccoonId; now: number }
  | { type: 'clearMessage' };

type GameContextValue = {
  state: GameState;
  loaded: boolean;
  claimOfflineRewards: () => void;
  tapLootPile: () => void;
  startRun: (zoneId: ZoneId, raccoonId: RaccoonId) => void;
  claimRun: (runId: string) => void;
  upgradeBuilding: (buildingId: BuildingId) => void;
  unlockZone: (zoneId: ZoneId) => void;
  recruitRaccoon: (raccoonId: RaccoonId) => void;
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
      claimRun: (runId) => dispatch({ type: 'claimRun', runId, now: Date.now() }),
      upgradeBuilding: (buildingId) =>
        dispatch({ type: 'upgradeBuilding', buildingId, now: Date.now() }),
      unlockZone: (zoneId) => dispatch({ type: 'unlockZone', zoneId, now: Date.now() }),
      recruitRaccoon: (raccoonId) =>
        dispatch({ type: 'recruitRaccoon', raccoonId, now: Date.now() }),
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
    lastSeenAt: now,
    totalRunsClaimed: 0,
    lastMessage: 'Tap the loot pile, send Scout out, then upgrade the base.',
  };
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
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'claimOffline':
      if (getResourceTotal(state.pendingOfflineRewards) <= 0) {
        return {
          ...state,
          lastMessage: 'No offline stash waiting yet.',
        };
      }

      return {
        ...state,
        resources: addResources(state.resources, state.pendingOfflineRewards),
        pendingOfflineRewards: createResourceBundle(),
        lastSeenAt: action.now,
        lastMessage: 'Offline stash claimed.',
      };
    case 'tapLootPile': {
      const shinies = Math.random() < 0.16 ? 1 : 0;

      return {
        ...state,
        resources: addResources(state.resources, { food: 12, scrap: 9, shinies }),
        discoveredLoot: maybeDiscoverLoot(state.discoveredLoot, ['pizza_crust', 'soda_can'], 0.35),
        lastSeenAt: action.now,
        lastMessage: shinies > 0 ? 'Loot pile had a shiny tucked under it.' : 'Loot pile sorted.',
      };
    }
    case 'startRun': {
      const zone = ZONES[action.zoneId];
      const raccoon = RACCOONS[action.raccoonId];

      if (!state.unlockedZones.includes(zone.id)) {
        return { ...state, lastMessage: `${zone.name} is still locked.` };
      }

      if (!state.raccoons[raccoon.id]?.unlocked) {
        return { ...state, lastMessage: `${raccoon.name} is not recruited yet.` };
      }

      if (state.runs.some((run) => run.raccoonId === raccoon.id)) {
        return { ...state, lastMessage: `${raccoon.name} is already out scavenging.` };
      }

      if (state.runs.some((run) => run.zoneId === zone.id)) {
        return { ...state, lastMessage: `${zone.name} already has a run in progress.` };
      }

      return {
        ...state,
        runs: [
          ...state.runs,
          {
            id: `${action.zoneId}-${action.raccoonId}-${action.now}`,
            zoneId: action.zoneId,
            raccoonId: action.raccoonId,
            startedAt: action.now,
            durationSec: getAdjustedRunDuration(state, action.zoneId, action.raccoonId),
          },
        ],
        lastSeenAt: action.now,
        lastMessage: `${raccoon.name} headed for ${zone.name}.`,
      };
    }
    case 'claimRun': {
      const run = state.runs.find((candidate) => candidate.id === action.runId);

      if (!run) {
        return { ...state, lastMessage: 'That run is no longer active.' };
      }

      if (!isRunReady(run, action.now)) {
        return { ...state, lastMessage: 'That crew is still scavenging.' };
      }

      const reward = rollRunReward(state, run);
      const discoveredLoot = reward.lootId
        ? addUnique(state.discoveredLoot, reward.lootId)
        : state.discoveredLoot;
      const lootName = reward.lootId ? LOOT_ITEMS[reward.lootId].name : null;

      return {
        ...state,
        resources: addResources(state.resources, reward.resources),
        runs: state.runs.filter((candidate) => candidate.id !== run.id),
        discoveredLoot,
        totalRunsClaimed: state.totalRunsClaimed + 1,
        lastSeenAt: action.now,
        lastMessage: lootName ? `Run claimed. New find: ${lootName}.` : 'Run claimed.',
      };
    }
    case 'upgradeBuilding': {
      const building = BUILDINGS[action.buildingId];
      const level = state.buildings[action.buildingId].level;
      const cost = getBuildingUpgradeCost(action.buildingId, level);

      if (!cost) {
        return { ...state, lastMessage: `${building.name} is already maxed for this prototype.` };
      }

      if (!hasResources(state.resources, cost)) {
        return { ...state, lastMessage: `Need more resources for ${building.name}.` };
      }

      return {
        ...state,
        resources: subtractResources(state.resources, cost),
        buildings: {
          ...state.buildings,
          [action.buildingId]: { level: level + 1 },
        },
        lastSeenAt: action.now,
        lastMessage: `${building.name} upgraded to Level ${level + 1}.`,
      };
    }
    case 'unlockZone': {
      const zone = ZONES[action.zoneId];

      if (state.unlockedZones.includes(action.zoneId)) {
        return { ...state, lastMessage: `${zone.name} is already open.` };
      }

      if (!zone.unlockCost || !hasResources(state.resources, zone.unlockCost)) {
        return { ...state, lastMessage: `Need more resources to unlock ${zone.name}.` };
      }

      return {
        ...state,
        resources: subtractResources(state.resources, zone.unlockCost),
        unlockedZones: [...state.unlockedZones, action.zoneId],
        lastSeenAt: action.now,
        lastMessage: `${zone.name} unlocked.`,
      };
    }
    case 'recruitRaccoon': {
      const raccoon = RACCOONS[action.raccoonId];

      if (state.raccoons[action.raccoonId].unlocked) {
        return { ...state, lastMessage: `${raccoon.name} is already in the crew.` };
      }

      if (!hasResources(state.resources, raccoon.recruitCost)) {
        return { ...state, lastMessage: `Need more resources to recruit ${raccoon.name}.` };
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
      };
    }
    case 'clearMessage':
      return {
        ...state,
        lastMessage: undefined,
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
  const merged = mergeSavedState(parsed, now);
  const offlineRewards = calculateOfflineRewards(merged, now);

  return {
    ...merged,
    pendingOfflineRewards: addResources(merged.pendingOfflineRewards, offlineRewards),
    lastSeenAt: now,
    lastMessage:
      getResourceTotal(offlineRewards) > 0
        ? 'Offline stash is ready to claim.'
        : merged.lastMessage ?? 'Local save loaded.',
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
    lastSeenAt: typeof saved.lastSeenAt === 'number' ? saved.lastSeenAt : now,
    totalRunsClaimed: typeof saved.totalRunsClaimed === 'number' ? saved.totalRunsClaimed : 0,
    lastMessage: saved.lastMessage,
  };
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

  return savedRuns.filter((run): run is ScavengeRun => {
    return (
      typeof run?.id === 'string' &&
      run.zoneId in ZONES &&
      run.raccoonId in RACCOONS &&
      typeof run.startedAt === 'number' &&
      typeof run.durationSec === 'number'
    );
  });
}

function normalizeLoot(savedLoot: unknown) {
  if (!Array.isArray(savedLoot)) {
    return [];
  }

  return savedLoot.filter((lootId): lootId is string => typeof lootId === 'string' && lootId in LOOT_ITEMS);
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
  const variance = 0.88 + Math.random() * 0.28;
  const resources = createResourceBundle({
    food: zone.baseRewards.food * snackBonus * variance,
    scrap:
      zone.baseRewards.scrap *
      sortBonus *
      variance *
      (raccoon.classId === 'hauler' ? 1.35 : 1),
    shinies:
      (zone.baseRewards.shinies + (raccoon.classId === 'sneak' ? 1 : 0)) *
      vaultBonus *
      variance,
  });
  const classRareBonus = raccoon.classId === 'sniffer' ? 0.22 : raccoon.classId === 'sneak' ? 0.08 : 0;
  const rareChance = zone.rareChance + classRareBonus + (state.buildings.vault.level - 1) * 0.025;
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
