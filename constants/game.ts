export type ResourceKey = 'food' | 'scrap' | 'shinies';
export type ResourceBundle = Record<ResourceKey, number>;
export type RaccoonClassId = 'scout' | 'hauler' | 'sniffer' | 'sneak';
export type RaccoonId = 'scout' | 'hauler' | 'sniffer' | 'sneak';
export type ZoneId = 'alley' | 'backlot' | 'store';
export type BuildingId = 'nest' | 'snack' | 'sort' | 'vault' | 'training';
export type LootRarity = 'common' | 'uncommon' | 'rare';
export type QuestId = 'send_scavenges' | 'collect_scrap' | 'upgrade_building';
export type MilestoneId = 'runs_3' | 'runs_8' | 'runs_15' | 'runs_30';
export type ActiveEncounterChoiceId = 'hide' | 'dash' | 'grab';

export type ResourceCost = Partial<ResourceBundle>;

export type QuestDefinition = {
  id: QuestId;
  title: string;
  description: string;
  target: number;
  reward: ResourceCost;
};

export type MilestoneDefinition = {
  id: MilestoneId;
  title: string;
  targetRuns: number;
  reward: ResourceCost;
};

export type ActiveEncounterChoice = {
  id: ActiveEncounterChoiceId;
  label: string;
  description: string;
  baseChance: number;
  rewardMultiplier: number;
  rareBonus: number;
  durationReductionPct: number;
  immediateReward: ResourceCost;
  risk: 'Low' | 'Medium' | 'High';
};

export type ActiveEncounterResult = {
  choiceId: ActiveEncounterChoiceId;
  success: boolean;
  message: string;
  resourceMultiplierDelta: number;
  rareBonusDelta: number;
  durationDeltaSec: number;
  immediateReward: ResourceBundle;
  resolvedAt: number;
};

export const RESOURCE_KEYS: ResourceKey[] = ['food', 'scrap', 'shinies'];

export const EMPTY_RESOURCES: ResourceBundle = {
  food: 0,
  scrap: 0,
  shinies: 0,
};

export const RESOURCE_CONFIG: Record<
  ResourceKey,
  {
    label: string;
    shortLabel: string;
    color: string;
    background: string;
    icon: 'food-apple' | 'cog' | 'diamond-stone';
  }
> = {
  food: {
    label: 'Food',
    shortLabel: 'Food',
    color: '#C8482E',
    background: '#FFE4D7',
    icon: 'food-apple',
  },
  scrap: {
    label: 'Scrap',
    shortLabel: 'Scrap',
    color: '#60646B',
    background: '#E9EAEC',
    icon: 'cog',
  },
  shinies: {
    label: 'Shinies',
    shortLabel: 'Shiny',
    color: '#1681D8',
    background: '#D9EEFF',
    icon: 'diamond-stone',
  },
};

export const DAILY_QUESTS: Record<QuestId, QuestDefinition> = {
  send_scavenges: {
    id: 'send_scavenges',
    title: 'Send 3 scavenges',
    description: 'Assign crew to loot routes.',
    target: 3,
    reward: { food: 25, scrap: 15 },
  },
  collect_scrap: {
    id: 'collect_scrap',
    title: 'Collect 200 scrap',
    description: 'Claim hauls, sort the pile, or collect offline scrap.',
    target: 200,
    reward: { scrap: 35 },
  },
  upgrade_building: {
    id: 'upgrade_building',
    title: 'Upgrade 1 building',
    description: 'Spend resources to grow the base.',
    target: 1,
    reward: { food: 30 },
  },
};

export const DAILY_QUEST_IDS: QuestId[] = ['send_scavenges', 'collect_scrap', 'upgrade_building'];

export const MILESTONE_REWARDS: Record<MilestoneId, MilestoneDefinition> = {
  runs_3: {
    id: 'runs_3',
    title: 'Claim 3 runs',
    targetRuns: 3,
    reward: { food: 45, scrap: 35 },
  },
  runs_8: {
    id: 'runs_8',
    title: 'Claim 8 runs',
    targetRuns: 8,
    reward: { food: 80, scrap: 65, shinies: 1 },
  },
  runs_15: {
    id: 'runs_15',
    title: 'Claim 15 runs',
    targetRuns: 15,
    reward: { food: 135, scrap: 115, shinies: 1 },
  },
  runs_30: {
    id: 'runs_30',
    title: 'Claim 30 runs',
    targetRuns: 30,
    reward: { food: 230, scrap: 200, shinies: 3 },
  },
};

export const MILESTONE_IDS: MilestoneId[] = ['runs_3', 'runs_8', 'runs_15', 'runs_30'];

export const ACTIVE_ENCOUNTER_CHOICES: Record<ActiveEncounterChoiceId, ActiveEncounterChoice> = {
  hide: {
    id: 'hide',
    label: 'Hide',
    description: 'Wait out trouble for a safer haul bonus.',
    baseChance: 0.82,
    rewardMultiplier: 0.03,
    rareBonus: 0.02,
    durationReductionPct: 0,
    immediateReward: {},
    risk: 'Low',
  },
  dash: {
    id: 'dash',
    label: 'Dash',
    description: 'Move fast and cut time off the route.',
    baseChance: 0.68,
    rewardMultiplier: 0.02,
    rareBonus: 0.01,
    durationReductionPct: 0.35,
    immediateReward: {},
    risk: 'Medium',
  },
  grab: {
    id: 'grab',
    label: 'Grab',
    description: 'Snatch extra loot now with a higher chance of trouble.',
    baseChance: 0.52,
    rewardMultiplier: 0.09,
    rareBonus: 0.04,
    durationReductionPct: 0,
    immediateReward: { food: 5, scrap: 4 },
    risk: 'High',
  },
};

export const RACCOON_CLASSES: Record<
  RaccoonClassId,
  {
    label: string;
    color: string;
    darkColor: string;
    role: string;
    bonus: string;
  }
> = {
  scout: {
    label: 'Scout',
    color: '#6DA13D',
    darkColor: '#3F6422',
    role: 'Fast scouting',
    bonus: 'Shorter scavenge timers',
  },
  hauler: {
    label: 'Hauler',
    color: '#D87A22',
    darkColor: '#8F4717',
    role: 'Heavy carrying',
    bonus: 'More scrap from every run',
  },
  sniffer: {
    label: 'Sniffer',
    color: '#1E9DA3',
    darkColor: '#126569',
    role: 'Rare discovery',
    bonus: 'Better loot collection chance',
  },
  sneak: {
    label: 'Sneak',
    color: '#8B5BB7',
    darkColor: '#533078',
    role: 'Quiet grabs',
    bonus: 'More shinies and less risk later',
  },
};

export const RACCOONS: Record<
  RaccoonId,
  {
    id: RaccoonId;
    name: string;
    classId: RaccoonClassId;
    recruitCost: ResourceCost;
    collectionHint: string;
  }
> = {
  scout: {
    id: 'scout',
    name: 'Scout',
    classId: 'scout',
    recruitCost: {},
    collectionHint: 'First to volunteer for an alley mission.',
  },
  hauler: {
    id: 'hauler',
    name: 'Bower',
    classId: 'hauler',
    recruitCost: { food: 70, scrap: 45 },
    collectionHint: 'Moves crates, cans, and anything not nailed down.',
  },
  sniffer: {
    id: 'sniffer',
    name: 'Nibb',
    classId: 'sniffer',
    recruitCost: { food: 95, shinies: 3 },
    collectionHint: 'Can find a bottle cap in a pile of bottle caps.',
  },
  sneak: {
    id: 'sneak',
    name: 'Shade',
    classId: 'sneak',
    recruitCost: { scrap: 130, shinies: 5 },
    collectionHint: 'Appears only when something sparkly is unattended.',
  },
};

export const ZONES: Record<
  ZoneId,
  {
    id: ZoneId;
    name: string;
    purpose: string;
    durationSec: number;
    baseRewards: ResourceBundle;
    rareChance: number;
    risk: 'Low' | 'Medium' | 'High';
    unlockCost?: ResourceCost;
    loot: string[];
    palette: {
      sky: string;
      ground: string;
      accent: string;
      shadow: string;
    };
  }
> = {
  alley: {
    id: 'alley',
    name: 'Alley Dumpster',
    purpose: 'Starter food and common scrap.',
    durationSec: 45,
    baseRewards: { food: 24, scrap: 14, shinies: 0 },
    rareChance: 0.12,
    risk: 'Low',
    loot: ['pizza_crust', 'soda_can', 'apple_core', 'banana_peel', 'bottle_cap', 'fish_bone'],
    palette: {
      sky: '#A6C5BF',
      ground: '#A8793A',
      accent: '#2F6A3C',
      shadow: '#3E3225',
    },
  },
  backlot: {
    id: 'backlot',
    name: 'Apartment Backlot',
    purpose: 'Better scrap and odd treasures.',
    durationSec: 120,
    baseRewards: { food: 30, scrap: 42, shinies: 1 },
    rareChance: 0.2,
    risk: 'Medium',
    unlockCost: { food: 100, scrap: 95 },
    loot: ['toy_car', 'teddy_bear', 'old_sock', 'bent_spoon', 'rubber_duck', 'broken_phone'],
    palette: {
      sky: '#B9B0CF',
      ground: '#9A774F',
      accent: '#A44F3F',
      shadow: '#51413B',
    },
  },
  store: {
    id: 'store',
    name: 'Convenience Store',
    purpose: 'Shinies, snacks, and rare finds.',
    durationSec: 240,
    baseRewards: { food: 46, scrap: 36, shinies: 1 },
    rareChance: 0.3,
    risk: 'High',
    unlockCost: { food: 240, scrap: 300, shinies: 10 },
    loot: ['snack_bag', 'keychain', 'donut', 'watch', 'gold_ring', 'glowing_bottle_cap'],
    palette: {
      sky: '#4E6286',
      ground: '#6C665E',
      accent: '#D6872C',
      shadow: '#272B34',
    },
  },
};

export const BUILDINGS: Record<
  BuildingId,
  {
    id: BuildingId;
    name: string;
    maxLevel: number;
    baseCost: ResourceCost;
    costGrowth: number;
    effect: string;
    stageName: string;
    color: string;
  }
> = {
  nest: {
    id: 'nest',
    name: 'Nest Pile',
    maxLevel: 6,
    baseCost: { scrap: 70 },
    costGrowth: 1.58,
    effect: 'Crew capacity and offline food',
    stageName: 'Leaf blankets',
    color: '#B98532',
  },
  snack: {
    id: 'snack',
    name: 'Snack Stash',
    maxLevel: 6,
    baseCost: { food: 40, scrap: 35 },
    costGrowth: 1.5,
    effect: 'Food rewards from runs',
    stageName: 'Snack crate',
    color: '#D06E2D',
  },
  sort: {
    id: 'sort',
    name: 'Sort Station',
    maxLevel: 6,
    baseCost: { scrap: 95 },
    costGrowth: 1.55,
    effect: 'Scrap rewards and offline scrap',
    stageName: 'Sorting table',
    color: '#8D6B45',
  },
  vault: {
    id: 'vault',
    name: 'Shiny Vault',
    maxLevel: 6,
    baseCost: { scrap: 120, shinies: 4 },
    costGrowth: 1.6,
    effect: 'Shiny rewards and rare chance',
    stageName: 'Locked box',
    color: '#3E8AC0',
  },
  training: {
    id: 'training',
    name: 'Training Crate',
    maxLevel: 6,
    baseCost: { food: 85, scrap: 85 },
    costGrowth: 1.52,
    effect: 'Run speed for the whole crew',
    stageName: 'Cardboard course',
    color: '#7D9A45',
  },
};

export const LOOT_ITEMS: Record<
  string,
  {
    id: string;
    name: string;
    rarity: LootRarity;
    flavor: string;
    source: ZoneId;
  }
> = {
  pizza_crust: {
    id: 'pizza_crust',
    name: 'Pizza Crust',
    rarity: 'common',
    flavor: 'A dependable snack with architectural potential.',
    source: 'alley',
  },
  soda_can: {
    id: 'soda_can',
    name: 'Soda Can',
    rarity: 'common',
    flavor: 'Useful as scrap, percussion, or a tiny chair.',
    source: 'alley',
  },
  apple_core: {
    id: 'apple_core',
    name: 'Apple Core',
    rarity: 'common',
    flavor: 'Nearly food. Close enough for prototype balance.',
    source: 'alley',
  },
  banana_peel: {
    id: 'banana_peel',
    name: 'Banana Peel',
    rarity: 'common',
    flavor: 'Slippery, dramatic, and somehow still collectible.',
    source: 'alley',
  },
  bottle_cap: {
    id: 'bottle_cap',
    name: 'Bottle Cap',
    rarity: 'common',
    flavor: 'Currency in several unofficial alley economies.',
    source: 'alley',
  },
  fish_bone: {
    id: 'fish_bone',
    name: 'Fish Bone',
    rarity: 'common',
    flavor: 'The crew insists it still has value.',
    source: 'alley',
  },
  toy_car: {
    id: 'toy_car',
    name: 'Toy Car',
    rarity: 'uncommon',
    flavor: 'Needs wheels, brakes, and adult supervision.',
    source: 'backlot',
  },
  teddy_bear: {
    id: 'teddy_bear',
    name: 'Teddy Bear',
    rarity: 'uncommon',
    flavor: 'Promoted immediately to morale officer.',
    source: 'backlot',
  },
  old_sock: {
    id: 'old_sock',
    name: 'Old Sock',
    rarity: 'uncommon',
    flavor: 'A future banner, tent, or questionable scarf.',
    source: 'backlot',
  },
  bent_spoon: {
    id: 'bent_spoon',
    name: 'Bent Spoon',
    rarity: 'uncommon',
    flavor: 'Tool, trophy, and snack catapult.',
    source: 'backlot',
  },
  rubber_duck: {
    id: 'rubber_duck',
    name: 'Rubber Duck',
    rarity: 'uncommon',
    flavor: 'Silent, cheerful, and very hard to intimidate.',
    source: 'backlot',
  },
  broken_phone: {
    id: 'broken_phone',
    name: 'Broken Phone',
    rarity: 'uncommon',
    flavor: 'No signal, but the flashlight still works sometimes.',
    source: 'backlot',
  },
  snack_bag: {
    id: 'snack_bag',
    name: 'Snack Bag',
    rarity: 'common',
    flavor: 'Mostly air, but the crumbs count.',
    source: 'store',
  },
  keychain: {
    id: 'keychain',
    name: 'Keychain',
    rarity: 'uncommon',
    flavor: 'Unlocks nothing yet. Looks official anyway.',
    source: 'store',
  },
  donut: {
    id: 'donut',
    name: 'Donut',
    rarity: 'uncommon',
    flavor: 'A circular argument for another run.',
    source: 'store',
  },
  watch: {
    id: 'watch',
    name: 'Watch',
    rarity: 'rare',
    flavor: 'Still wrong twice a day, but fashionably.',
    source: 'store',
  },
  gold_ring: {
    id: 'gold_ring',
    name: 'Gold Ring',
    rarity: 'rare',
    flavor: 'Declared important by everyone immediately.',
    source: 'store',
  },
  glowing_bottle_cap: {
    id: 'glowing_bottle_cap',
    name: 'Glowing Bottle Cap',
    rarity: 'rare',
    flavor: 'Probably safe. Probably.',
    source: 'store',
  },
};

export function createResourceBundle(values?: ResourceCost): ResourceBundle {
  return {
    food: Math.max(0, Math.floor(values?.food ?? 0)),
    scrap: Math.max(0, Math.floor(values?.scrap ?? 0)),
    shinies: Math.max(0, Math.floor(values?.shinies ?? 0)),
  };
}

export function addResources(base: ResourceBundle, delta: ResourceCost): ResourceBundle {
  return {
    food: Math.max(0, Math.floor(base.food + (delta.food ?? 0))),
    scrap: Math.max(0, Math.floor(base.scrap + (delta.scrap ?? 0))),
    shinies: Math.max(0, Math.floor(base.shinies + (delta.shinies ?? 0))),
  };
}

export function subtractResources(base: ResourceBundle, cost: ResourceCost): ResourceBundle {
  return {
    food: Math.max(0, Math.floor(base.food - (cost.food ?? 0))),
    scrap: Math.max(0, Math.floor(base.scrap - (cost.scrap ?? 0))),
    shinies: Math.max(0, Math.floor(base.shinies - (cost.shinies ?? 0))),
  };
}

export function hasResources(resources: ResourceBundle, cost: ResourceCost = {}): boolean {
  return RESOURCE_KEYS.every((key) => resources[key] >= (cost[key] ?? 0));
}

export function formatResources(cost: ResourceCost): string {
  const parts = RESOURCE_KEYS.filter((key) => (cost[key] ?? 0) > 0).map(
    (key) => `${cost[key]} ${RESOURCE_CONFIG[key].shortLabel}`,
  );

  return parts.length > 0 ? parts.join(' / ') : 'Free';
}

export function getBuildingUpgradeCost(buildingId: BuildingId, level: number): ResourceCost | null {
  const building = BUILDINGS[buildingId];

  if (level >= building.maxLevel) {
    return null;
  }

  const multiplier = Math.pow(building.costGrowth, level - 1);
  const cost: ResourceCost = {};

  RESOURCE_KEYS.forEach((key) => {
    const baseAmount = building.baseCost[key];

    if (baseAmount) {
      cost[key] = roundToFive(baseAmount * multiplier);
    }
  });

  return cost;
}

export function getBuildingStage(level: number): 1 | 2 | 3 {
  if (level >= 4) {
    return 3;
  }

  if (level >= 2) {
    return 2;
  }

  return 1;
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function roundToFive(value: number): number {
  return Math.max(5, Math.round(value / 5) * 5);
}
