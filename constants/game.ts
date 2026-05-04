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
export type BaseThemeId = 'day' | 'night' | 'night_festival';
export type RaccoonSkinId =
  | 'scout_default'
  | 'hauler_default'
  | 'sniffer_default'
  | 'sneak_default'
  | 'scout_trail'
  | 'hauler_workshop'
  | 'sniffer_detective'
  | 'sneak_shadow';
export type AudioEventId =
  | 'button_tap'
  | 'confirm'
  | 'cancel'
  | 'tab_switch'
  | 'resource_collect'
  | 'resource_spend'
  | 'not_enough_resource'
  | 'scavenge_start'
  | 'scavenge_complete'
  | 'rare_find'
  | 'active_success'
  | 'active_fail'
  | 'building_upgrade'
  | 'raccoon_chirp'
  | 'theme_switch';

export type ResourceCost = Partial<ResourceBundle>;

export type AudioSettings = {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  hapticsEnabled: boolean;
};

export type BaseThemeDefinition = {
  id: BaseThemeId;
  label: string;
  description: string;
  unlockCopy: string;
  backgroundKey: 'baseDay' | 'baseNight';
  accentColor: string;
};

export type RaccoonSkinDefinition = {
  id: RaccoonSkinId;
  raccoonId: RaccoonId;
  label: string;
  description: string;
  unlockCopy: string;
  defaultOwned: boolean;
};

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

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 0.85,
  hapticsEnabled: true,
};

export const AUDIO_EVENT_IDS: AudioEventId[] = [
  'button_tap',
  'confirm',
  'cancel',
  'tab_switch',
  'resource_collect',
  'resource_spend',
  'not_enough_resource',
  'scavenge_start',
  'scavenge_complete',
  'rare_find',
  'active_success',
  'active_fail',
  'building_upgrade',
  'raccoon_chirp',
  'theme_switch',
];

export const BASE_THEME_IDS: BaseThemeId[] = ['day', 'night', 'night_festival'];
export const DEFAULT_BASE_THEME_ID: BaseThemeId = 'day';
export const DEFAULT_OWNED_BASE_THEME_IDS: BaseThemeId[] = ['day', 'night'];

export const BASE_THEMES: Record<BaseThemeId, BaseThemeDefinition> = {
  day: {
    id: 'day',
    label: 'Day Camp',
    description: 'Warm daylight, open sorting paths, and a clear view of the growing base.',
    unlockCopy: 'Available from the start.',
    backgroundKey: 'baseDay',
    accentColor: '#D97823',
  },
  night: {
    id: 'night',
    label: 'Night Watch',
    description: 'A cozy after-dark base pass with stronger lantern glow and skyline contrast.',
    unlockCopy: 'Available from the start.',
    backgroundKey: 'baseNight',
    accentColor: '#267FAE',
  },
  night_festival: {
    id: 'night_festival',
    label: 'Night Festival',
    description: 'A future decoration theme for string lights, flags, and special base props.',
    unlockCopy: 'Future decoration reward.',
    backgroundKey: 'baseNight',
    accentColor: '#8B5BB7',
  },
};

export const RACCOON_SKIN_IDS: RaccoonSkinId[] = [
  'scout_default',
  'hauler_default',
  'sniffer_default',
  'sneak_default',
  'scout_trail',
  'hauler_workshop',
  'sniffer_detective',
  'sneak_shadow',
];

export const DEFAULT_RACCOON_SKINS: Record<RaccoonId, RaccoonSkinId> = {
  scout: 'scout_default',
  hauler: 'hauler_default',
  sniffer: 'sniffer_default',
  sneak: 'sneak_default',
};

export const DEFAULT_OWNED_RACCOON_SKIN_IDS: RaccoonSkinId[] = [
  'scout_default',
  'hauler_default',
  'sniffer_default',
  'sneak_default',
];

export const RACCOON_SKINS: Record<RaccoonSkinId, RaccoonSkinDefinition> = {
  scout_default: {
    id: 'scout_default',
    raccoonId: 'scout',
    label: 'Scout Classic',
    description: 'Green bandana, tiny pack, and ready-for-anything route energy.',
    unlockCopy: 'Default crew look.',
    defaultOwned: true,
  },
  hauler_default: {
    id: 'hauler_default',
    raccoonId: 'hauler',
    label: 'Bower Classic',
    description: 'Work scarf, sturdy posture, and room for suspiciously many cans.',
    unlockCopy: 'Default crew look.',
    defaultOwned: true,
  },
  sniffer_default: {
    id: 'sniffer_default',
    raccoonId: 'sniffer',
    label: 'Nibb Classic',
    description: 'Curious goggles and a nose for collection gaps.',
    unlockCopy: 'Default crew look.',
    defaultOwned: true,
  },
  sneak_default: {
    id: 'sneak_default',
    raccoonId: 'sneak',
    label: 'Shade Classic',
    description: 'Purple stealth scarf for shinies that nobody was guarding closely enough.',
    unlockCopy: 'Default crew look.',
    defaultOwned: true,
  },
  scout_trail: {
    id: 'scout_trail',
    raccoonId: 'scout',
    label: 'Trail Scout',
    description: 'A future skin slot for trail badges and a bigger backpack.',
    unlockCopy: 'Future cosmetic reward.',
    defaultOwned: false,
  },
  hauler_workshop: {
    id: 'hauler_workshop',
    raccoonId: 'hauler',
    label: 'Workshop Bower',
    description: 'A future skin slot for gloves, tool belts, and extra crate confidence.',
    unlockCopy: 'Future cosmetic reward.',
    defaultOwned: false,
  },
  sniffer_detective: {
    id: 'sniffer_detective',
    raccoonId: 'sniffer',
    label: 'Tiny Detective',
    description: 'A future skin slot for magnifiers, case notes, and dramatic clues.',
    unlockCopy: 'Future cosmetic reward.',
    defaultOwned: false,
  },
  sneak_shadow: {
    id: 'sneak_shadow',
    raccoonId: 'sneak',
    label: 'Moonlit Shade',
    description: 'A future skin slot for darker wraps and extra moonlit sparkle.',
    unlockCopy: 'Future cosmetic reward.',
    defaultOwned: false,
  },
};

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

export type ActiveEncounterTemplateId =
  | 'security_light'
  | 'barking_dog'
  | 'suspicious_trash_bag'
  | 'vending_machine'
  | 'rival_raccoon'
  | 'locked_dumpster';

export type ActiveEncounterTemplate = {
  id: ActiveEncounterTemplateId;
  title: string;
  describe: (ctx: { raccoonName: string; zoneName: string }) => string;
};

export const ACTIVE_ENCOUNTER_TEMPLATE_IDS: ActiveEncounterTemplateId[] = [
  'security_light',
  'barking_dog',
  'suspicious_trash_bag',
  'vending_machine',
  'rival_raccoon',
  'locked_dumpster',
];

export const ACTIVE_ENCOUNTER_TEMPLATES: Record<ActiveEncounterTemplateId, ActiveEncounterTemplate> = {
  security_light: {
    id: 'security_light',
    title: 'Security light',
    describe: ({ raccoonName, zoneName }) =>
      `${raccoonName} spots a sweep of light near ${zoneName}. Stay low, move fast, or grab now?`,
  },
  barking_dog: {
    id: 'barking_dog',
    title: 'Barking dog',
    describe: ({ raccoonName, zoneName }) =>
      `A dog loses its mind two fences over while ${raccoonName} is mid-route at ${zoneName}.`,
  },
  suspicious_trash_bag: {
    id: 'suspicious_trash_bag',
    title: 'Suspicious trash bag',
    describe: ({ raccoonName, zoneName }) =>
      `Something inside a rustling bag at ${zoneName} might be treasure—or trouble—for ${raccoonName}.`,
  },
  vending_machine: {
    id: 'vending_machine',
    title: 'Vending machine',
    describe: ({ raccoonName, zoneName }) =>
      `A humming machine at ${zoneName} taunts ${raccoonName} with loose change and loud clanks.`,
  },
  rival_raccoon: {
    id: 'rival_raccoon',
    title: 'Rival raccoon',
    describe: ({ raccoonName, zoneName }) =>
      `Another bandit shows up at ${zoneName}, sizing up ${raccoonName}'s haul.`,
  },
  locked_dumpster: {
    id: 'locked_dumpster',
    title: 'Locked dumpster',
    describe: ({ raccoonName, zoneName }) =>
      `The best bin at ${zoneName} is latched tight. ${raccoonName} needs a plan.`,
  },
};

export function pickEncounterTemplateId(runId: string): ActiveEncounterTemplateId {
  let hash = 0;

  for (let i = 0; i < runId.length; i += 1) {
    hash = (hash * 31 + runId.charCodeAt(i)) >>> 0;
  }

  return ACTIVE_ENCOUNTER_TEMPLATE_IDS[hash % ACTIVE_ENCOUNTER_TEMPLATE_IDS.length];
}

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
