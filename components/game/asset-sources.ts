import {
  BASE_THEMES,
  BaseThemeId,
  BuildingId,
  getBuildingStage,
  RaccoonId,
  ResourceKey,
  ZoneId,
} from "@/constants/game";

export type AssetSource = number;
export type TabKey = "base" | "scavenge" | "build" | "collection" | "shop";
export type RaccoonAnimationId = "idle" | "walk" | "tap" | "celebrate" | "fail";

export const resourceIconSources: Record<ResourceKey, AssetSource> = {
  food: require("../../assets/sliced/resources/resource_icon_food.png"),
  scrap: require("../../assets/sliced/resources/resource_icon_scrap.png"),
  shinies: require("../../assets/sliced/resources/resource_icon_shinies.png"),
};

export const navigationIconSources: Record<
  TabKey,
  { active: AssetSource; inactive: AssetSource }
> = {
  base: {
    active: require("../../assets/sliced/ui/navigation/base_active.png"),
    inactive: require("../../assets/sliced/ui/navigation/base_inactive.png"),
  },
  scavenge: {
    active: require("../../assets/sliced/ui/navigation/scavenge_active.png"),
    inactive: require("../../assets/sliced/ui/navigation/scavenge_inactive.png"),
  },
  build: {
    active: require("../../assets/sliced/ui/navigation/build_active.png"),
    inactive: require("../../assets/sliced/ui/navigation/build_inactive.png"),
  },
  collection: {
    active: require("../../assets/sliced/ui/navigation/collection_active.png"),
    inactive: require("../../assets/sliced/ui/navigation/collection_inactive.png"),
  },
  shop: {
    active: require("../../assets/sliced/ui/navigation/shop_active.png"),
    inactive: require("../../assets/sliced/ui/navigation/shop_inactive.png"),
  },
};

export const environmentSources: Record<
  ZoneId | "baseDay" | "baseNight" | "activeScavenge",
  AssetSource
> = {
  alley: require("../../assets/environments/alley_dumpster.png"),
  backlot: require("../../assets/environments/apartment_backlot.png"),
  store: require("../../assets/environments/convenience_store.png"),
  baseDay: require("../../assets/environments/home_base_day.png"),
  baseNight: require("../../assets/environments/home_base_night.png"),
  activeScavenge: require("../../assets/environments/active_scavenge.png"),
};

const raccoonIdleSources: Record<RaccoonId, AssetSource> = {
  scout: require("../../assets/sliced/classes/scout/raccoon_scout_idle_01.png"),
  hauler: require("../../assets/sliced/classes/hauler/raccoon_hauler_idle_01.png"),
  sniffer: require("../../assets/sliced/classes/sniffer/raccoon_sniffer_idle_01.png"),
  sneak: require("../../assets/sliced/classes/sneaker/raccoon_sneaker_idle_01.png"),
};

const raccoonAnimationSources: Record<
  RaccoonId,
  Record<RaccoonAnimationId, AssetSource[]>
> = {
  scout: {
    idle: [
      require("../../assets/sliced/classes/scout/raccoon_scout_idle_01.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_idle_02.png"),
    ],
    walk: [
      require("../../assets/sliced/classes/scout/raccoon_scout_walk_01.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_walk_02.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_walk_03.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_walk_04.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_walk_05.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_walk_06.png"),
    ],
    tap: [
      require("../../assets/sliced/classes/scout/raccoon_scout_tap_01.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_tap_02.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_tap_03.png"),
    ],
    celebrate: [
      require("../../assets/sliced/classes/scout/raccoon_scout_celebrate_01.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_celebrate_02.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_celebrate_03.png"),
    ],
    fail: [
      require("../../assets/sliced/classes/scout/raccoon_scout_fail_01.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_fail_02.png"),
      require("../../assets/sliced/classes/scout/raccoon_scout_fail_03.png"),
    ],
  },
  hauler: {
    idle: [
      require("../../assets/sliced/classes/hauler/raccoon_hauler_idle_01.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_idle_02.png"),
    ],
    walk: [
      require("../../assets/sliced/classes/hauler/raccoon_hauler_walk_01.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_walk_02.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_walk_03.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_walk_04.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_walk_05.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_walk_06.png"),
    ],
    tap: [
      require("../../assets/sliced/classes/hauler/raccoon_hauler_tap_01.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_tap_02.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_tap_03.png"),
    ],
    celebrate: [
      require("../../assets/sliced/classes/hauler/raccoon_hauler_celebrate_01.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_celebrate_02.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_celebrate_03.png"),
    ],
    fail: [
      require("../../assets/sliced/classes/hauler/raccoon_hauler_fail_01.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_fail_02.png"),
      require("../../assets/sliced/classes/hauler/raccoon_hauler_fail_03.png"),
    ],
  },
  sniffer: {
    idle: [
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_idle_01.png"),
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_idle_02.png"),
    ],
    walk: [
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_walk_01.png"),
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_walk_02.png"),
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_walk_03.png"),
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_walk_04.png"),
    ],
    tap: [
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_tap_01.png"),
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_tap_02.png"),
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_tap_03.png"),
    ],
    celebrate: [
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_celebrate_01.png"),
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_celebrate_02.png"),
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_celebrate_03.png"),
    ],
    fail: [
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_fail_01.png"),
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_fail_02.png"),
      require("../../assets/sliced/classes/sniffer/raccoon_sniffer_fail_03.png"),
    ],
  },
  sneak: {
    idle: [
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_idle_01.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_idle_02.png"),
    ],
    walk: [
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_walk_01.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_walk_02.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_walk_03.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_walk_04.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_walk_05.png"),
    ],
    tap: [
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_tap_01.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_tap_02.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_tap_03.png"),
    ],
    celebrate: [
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_celebrate_01.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_celebrate_02.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_celebrate_03.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_celebrate_04.png"),
    ],
    fail: [
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_fail_01.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_fail_02.png"),
      require("../../assets/sliced/classes/sneaker/raccoon_sneaker_fail_03.png"),
    ],
  },
};

export const raccoonPortraitSources: Record<RaccoonId, AssetSource> = {
  scout: require("../../assets/sliced/portraits/raccoon_scout_portrait.png"),
  hauler: require("../../assets/sliced/portraits/raccoon_hauler_portrait.png"),
  sniffer: require("../../assets/sliced/portraits/raccoon_sniffer_portrait.png"),
  sneak: require("../../assets/sliced/portraits/raccoon_sneaker_portrait.png"),
};

export const lockedRaccoonSource = require("../../assets/sliced/portraits/raccoon_locked.png");
export const lockedPanelSource = require("../../assets/sliced/ui/misc/panel_locked.png");

const buildingStageSources: Record<
  BuildingId,
  Record<1 | 2 | 3, AssetSource>
> = {
  nest: {
    1: require("../../assets/sliced/buildings/building_nest_pile_stage_01.png"),
    2: require("../../assets/sliced/buildings/building_nest_pile_stage_02.png"),
    3: require("../../assets/sliced/buildings/building_nest_pile_stage_03.png"),
  },
  snack: {
    1: require("../../assets/sliced/buildings/building_snack_stash_stage_01.png"),
    2: require("../../assets/sliced/buildings/building_snack_stash_stage_02.png"),
    3: require("../../assets/sliced/buildings/building_snack_stash_stage_03.png"),
  },
  sort: {
    1: require("../../assets/sliced/buildings/building_sort_station_stage_01.png"),
    2: require("../../assets/sliced/buildings/building_sort_station_stage_02.png"),
    3: require("../../assets/sliced/buildings/building_sort_station_stage_03.png"),
  },
  vault: {
    1: require("../../assets/sliced/buildings/building_shiny_vault_stage_01.png"),
    2: require("../../assets/sliced/buildings/building_shiny_vault_stage_02.png"),
    3: require("../../assets/sliced/buildings/building_shiny_vault_stage_03.png"),
  },
  training: {
    1: require("../../assets/sliced/buildings/building_training_crate_stage_01.png"),
    2: require("../../assets/sliced/buildings/building_training_crate_stage_02.png"),
    3: require("../../assets/sliced/buildings/building_training_crate_stage_03.png"),
  },
};

const lootSources: Record<string, AssetSource> = {
  pizza_crust: require("../../assets/sliced/loot/common/loot_common_half_pizza.png"),
  soda_can: require("../../assets/sliced/loot/common/loot_common_soda_can.png"),
  apple_core: require("../../assets/sliced/loot/common/loot_common_apple_core.png"),
  banana_peel: require("../../assets/sliced/loot/common/loot_common_banana_peel.png"),
  bottle_cap: require("../../assets/sliced/loot/common/loot_common_bottle_cap.png"),
  fish_bone: require("../../assets/sliced/loot/common/loot_common_fish_bone.png"),
  toy_car: require("../../assets/sliced/loot/uncommon/toy_car.png"),
  teddy_bear: require("../../assets/sliced/loot/uncommon/teddy_bear.png"),
  old_sock: require("../../assets/sliced/loot/common/loot_common_old_sock.png"),
  bent_spoon: require("../../assets/sliced/loot/uncommon/loot_uncommon_bent_spoon.png"),
  rubber_duck: require("../../assets/sliced/loot/uncommon/rubber_duck.png"),
  broken_phone: require("../../assets/sliced/loot/uncommon/loot_uncommon_broken_phone.png"),
  snack_bag: require("../../assets/sliced/loot/uncommon/snack_bag.png"),
  keychain: require("../../assets/sliced/loot/uncommon/keychain.png"),
  donut: require("../../assets/sliced/loot/uncommon/donut.png"),
  watch: require("../../assets/sliced/loot/uncommon/watch.png"),
  gold_ring: require("../../assets/sliced/loot/rare/loot_rare_gold_ring.png"),
  glowing_bottle_cap: require("../../assets/sliced/loot/rare/loot_rare_glowing_bottle_cap.png"),
};

export function getBuildingSource(
  buildingId: BuildingId,
  level: number,
): AssetSource {
  return buildingStageSources[buildingId][getBuildingStage(level)];
}

export function getLootSource(lootId?: string): AssetSource | undefined {
  return lootId ? lootSources[lootId] : undefined;
}

export function getRaccoonSource(
  raccoonId: RaccoonId,
  locked = false,
): AssetSource {
  return locked ? lockedRaccoonSource : raccoonIdleSources[raccoonId];
}

export function getRaccoonAnimationSources(
  raccoonId: RaccoonId,
  animation: RaccoonAnimationId,
): AssetSource[] {
  return raccoonAnimationSources[raccoonId][animation] ?? raccoonAnimationSources[raccoonId].idle;
}

export function getZoneEnvironmentSource(zoneId: ZoneId): AssetSource {
  return environmentSources[zoneId];
}

export function getBaseThemeSource(themeId: BaseThemeId): AssetSource {
  return environmentSources[BASE_THEMES[themeId].backgroundKey];
}
