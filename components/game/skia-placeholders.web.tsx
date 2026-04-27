import { StyleSheet, View } from 'react-native';

import {
  BUILDINGS,
  BuildingId,
  getBuildingStage,
  LOOT_ITEMS,
  RACCOON_CLASSES,
  RACCOONS,
  RaccoonId,
  ZoneId,
  ZONES,
} from '@/constants/game';

export function RaccoonSketch({
  raccoonId,
  size = 96,
  locked = false,
}: {
  raccoonId: RaccoonId;
  size?: number;
  locked?: boolean;
}) {
  const raccoon = RACCOONS[raccoonId];
  const classConfig = RACCOON_CLASSES[raccoon.classId];
  const unit = size / 120;

  return (
    <View style={{ height: size, width: size }}>
      <View style={[styles.tail, scaleStyle(unit), locked && styles.lockedDark]} />
      <View style={[styles.body, scaleStyle(unit), locked && styles.lockedMid]} />
      <View style={[styles.belly, scaleStyle(unit), locked && styles.lockedLight]} />
      <View style={[styles.leftEar, scaleStyle(unit), locked && styles.lockedMid]} />
      <View style={[styles.rightEar, scaleStyle(unit), locked && styles.lockedMid]} />
      <View style={[styles.head, scaleStyle(unit), locked && styles.lockedMid]} />
      <View style={[styles.mask, scaleStyle(unit), locked && styles.lockedDark]} />
      {!locked ? (
        <>
          <View style={[styles.leftEyePatch, scaleStyle(unit)]} />
          <View style={[styles.rightEyePatch, scaleStyle(unit)]} />
          <View style={[styles.leftEye, scaleStyle(unit)]} />
          <View style={[styles.rightEye, scaleStyle(unit)]} />
          <View style={[styles.snout, scaleStyle(unit)]} />
          <View style={[styles.nose, scaleStyle(unit)]} />
          <View style={[styles.scarf, scaleStyle(unit), { backgroundColor: classConfig.color }]} />
        </>
      ) : null}
      <View style={[styles.leftFoot, scaleStyle(unit), locked && styles.lockedDark]} />
      <View style={[styles.rightFoot, scaleStyle(unit), locked && styles.lockedDark]} />
    </View>
  );
}

export function BuildingSketch({
  buildingId,
  level,
  size = 90,
}: {
  buildingId: BuildingId;
  level: number;
  size?: number;
}) {
  const building = BUILDINGS[buildingId];
  const stage = getBuildingStage(level);

  return (
    <View style={[styles.webSketchFrame, { height: size, width: size }]}>
      <View style={styles.webShadow} />
      <View style={[styles.webBuildingBase, { backgroundColor: building.color }]} />
      <View style={styles.webBuildingTop} />
      {stage >= 2 ? <View style={styles.webBuildingAddOn} /> : null}
      {stage >= 3 ? <View style={styles.webBuildingSpark} /> : null}
    </View>
  );
}

export function ZoneThumbnail({
  zoneId,
  width = 112,
  height = 82,
}: {
  zoneId: ZoneId;
  width?: number;
  height?: number;
}) {
  const zone = ZONES[zoneId];

  return (
    <View style={[styles.zoneThumb, { backgroundColor: zone.palette.sky, height, width }]}>
      <View style={[styles.zoneGround, { backgroundColor: zone.palette.ground }]} />
      <View style={styles.zoneBlockOne} />
      <View style={styles.zoneBlockTwo} />
      <View style={[styles.zoneDumpster, { backgroundColor: zone.palette.accent }]} />
      <View style={styles.zoneMoon} />
    </View>
  );
}

export function LootSketch({ lootId, size = 54, locked = false }: { lootId?: string; size?: number; locked?: boolean }) {
  const loot = lootId ? LOOT_ITEMS[lootId] : undefined;
  const color = locked
    ? '#5E554E'
    : loot?.rarity === 'rare'
      ? '#2585C2'
      : loot?.rarity === 'uncommon'
        ? '#8F7AB9'
        : '#B98532';

  return (
    <View style={[styles.lootFrame, { height: size, width: size }]}>
      <View style={[styles.lootCircle, { backgroundColor: color }]} />
      <View style={locked ? styles.lootLock : styles.lootGlyph} />
    </View>
  );
}

export function BaseBackdrop({ height = 310 }: { height?: number }) {
  return (
    <View style={[styles.baseBackdrop, { height }]}>
      <View style={styles.baseSky} />
      <View style={styles.baseGround} />
      <View style={styles.skylineOne} />
      <View style={styles.skylineTwo} />
      <View style={styles.treeOne} />
      <View style={styles.treeTwo} />
      <View style={styles.fence} />
      <View style={styles.dumpster} />
      <View style={styles.dumpsterLip} />
      <View style={styles.trashCan} />
    </View>
  );
}

function scaleStyle(unit: number) {
  return {
    transform: [{ scale: unit }],
  };
}

const styles = StyleSheet.create({
  tail: {
    backgroundColor: '#3C3A39',
    borderRadius: 999,
    height: 28,
    left: 15,
    position: 'absolute',
    top: 67,
    transformOrigin: 'top left',
    width: 40,
  },
  body: {
    backgroundColor: '#4B4845',
    borderRadius: 999,
    height: 55,
    left: 35,
    position: 'absolute',
    top: 53,
    transformOrigin: 'top left',
    width: 49,
  },
  belly: {
    backgroundColor: '#F7E9D3',
    borderRadius: 999,
    height: 34,
    left: 43,
    position: 'absolute',
    top: 68,
    transformOrigin: 'top left',
    width: 33,
  },
  leftEar: {
    backgroundColor: '#2D2A28',
    borderRadius: 999,
    height: 34,
    left: 38,
    position: 'absolute',
    top: 11,
    transformOrigin: 'top left',
    width: 20,
  },
  rightEar: {
    backgroundColor: '#2D2A28',
    borderRadius: 999,
    height: 34,
    left: 82,
    position: 'absolute',
    top: 11,
    transformOrigin: 'top left',
    width: 20,
  },
  head: {
    backgroundColor: '#77746D',
    borderRadius: 999,
    height: 55,
    left: 31,
    position: 'absolute',
    top: 25,
    transformOrigin: 'top left',
    width: 72,
  },
  mask: {
    backgroundColor: '#202020',
    borderRadius: 999,
    height: 25,
    left: 39,
    position: 'absolute',
    top: 38,
    transformOrigin: 'top left',
    width: 56,
  },
  leftEyePatch: {
    backgroundColor: '#F7E9D3',
    borderRadius: 999,
    height: 25,
    left: 39,
    position: 'absolute',
    top: 33,
    transformOrigin: 'top left',
    width: 21,
  },
  rightEyePatch: {
    backgroundColor: '#F7E9D3',
    borderRadius: 999,
    height: 25,
    left: 74,
    position: 'absolute',
    top: 33,
    transformOrigin: 'top left',
    width: 21,
  },
  leftEye: {
    backgroundColor: '#101010',
    borderRadius: 999,
    height: 14,
    left: 44,
    position: 'absolute',
    top: 41,
    transformOrigin: 'top left',
    width: 14,
  },
  rightEye: {
    backgroundColor: '#101010',
    borderRadius: 999,
    height: 14,
    left: 79,
    position: 'absolute',
    top: 41,
    transformOrigin: 'top left',
    width: 14,
  },
  snout: {
    backgroundColor: '#F5E4CB',
    borderRadius: 999,
    height: 17,
    left: 57,
    position: 'absolute',
    top: 51,
    transformOrigin: 'top left',
    width: 20,
  },
  nose: {
    backgroundColor: '#1D1917',
    borderRadius: 999,
    height: 8,
    left: 63,
    position: 'absolute',
    top: 54,
    transformOrigin: 'top left',
    width: 8,
  },
  scarf: {
    borderRadius: 999,
    height: 11,
    left: 48,
    position: 'absolute',
    top: 73,
    transformOrigin: 'top left',
    width: 42,
  },
  leftFoot: {
    backgroundColor: '#2C2A28',
    borderRadius: 999,
    height: 16,
    left: 35,
    position: 'absolute',
    top: 89,
    transformOrigin: 'top left',
    width: 17,
  },
  rightFoot: {
    backgroundColor: '#2C2A28',
    borderRadius: 999,
    height: 16,
    left: 78,
    position: 'absolute',
    top: 89,
    transformOrigin: 'top left',
    width: 17,
  },
  lockedDark: {
    backgroundColor: '#383530',
  },
  lockedMid: {
    backgroundColor: '#56504A',
  },
  lockedLight: {
    backgroundColor: '#6B6258',
  },
  webSketchFrame: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  webShadow: {
    backgroundColor: 'rgba(59, 35, 16, 0.16)',
    borderRadius: 999,
    bottom: 5,
    height: 15,
    position: 'absolute',
    width: '78%',
  },
  webBuildingBase: {
    borderColor: '#5B3A1E',
    borderRadius: 8,
    borderWidth: 2,
    height: '42%',
    width: '62%',
  },
  webBuildingTop: {
    backgroundColor: '#F0CA75',
    borderRadius: 999,
    height: 16,
    marginBottom: -8,
    width: '45%',
  },
  webBuildingAddOn: {
    backgroundColor: '#FFF1C9',
    borderRadius: 5,
    bottom: '33%',
    height: 14,
    position: 'absolute',
    right: '18%',
    width: 22,
  },
  webBuildingSpark: {
    backgroundColor: '#78C7F0',
    borderRadius: 999,
    height: 12,
    position: 'absolute',
    right: '28%',
    top: '18%',
    width: 12,
  },
  zoneThumb: {
    borderColor: 'rgba(84, 52, 25, 0.2)',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  zoneGround: {
    bottom: 0,
    height: '40%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  zoneBlockOne: {
    backgroundColor: 'rgba(44, 50, 58, 0.34)',
    height: '38%',
    left: '12%',
    position: 'absolute',
    top: '28%',
    width: '18%',
  },
  zoneBlockTwo: {
    backgroundColor: 'rgba(44, 50, 58, 0.28)',
    height: '48%',
    left: '38%',
    position: 'absolute',
    top: '18%',
    width: '16%',
  },
  zoneDumpster: {
    borderColor: '#213D29',
    borderRadius: 6,
    borderWidth: 2,
    bottom: '14%',
    height: '30%',
    left: '34%',
    position: 'absolute',
    width: '42%',
  },
  zoneMoon: {
    backgroundColor: '#F7D36D',
    borderRadius: 999,
    height: 13,
    position: 'absolute',
    right: '14%',
    top: '14%',
    width: 13,
  },
  lootFrame: {
    alignItems: 'center',
    backgroundColor: '#FFF3D7',
    borderColor: '#D1A760',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  lootCircle: {
    borderRadius: 999,
    height: '58%',
    width: '58%',
  },
  lootGlyph: {
    backgroundColor: '#FFF4D8',
    borderRadius: 5,
    height: '26%',
    position: 'absolute',
    width: '34%',
  },
  lootLock: {
    backgroundColor: '#38332E',
    borderRadius: 4,
    height: '28%',
    position: 'absolute',
    width: '34%',
  },
  baseBackdrop: {
    backgroundColor: '#B58B50',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  baseSky: {
    backgroundColor: '#AFCACB',
    height: 112,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  baseGround: {
    backgroundColor: '#B58B50',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 112,
  },
  skylineOne: {
    backgroundColor: 'rgba(61, 73, 83, 0.32)',
    height: 68,
    left: 12,
    position: 'absolute',
    top: 58,
    width: 44,
  },
  skylineTwo: {
    backgroundColor: 'rgba(61, 73, 83, 0.28)',
    height: 88,
    left: 66,
    position: 'absolute',
    top: 38,
    width: 34,
  },
  treeOne: {
    backgroundColor: '#5D8B45',
    borderRadius: 999,
    height: 96,
    left: 96,
    position: 'absolute',
    top: 64,
    width: 96,
  },
  treeTwo: {
    backgroundColor: '#6C9B4D',
    borderRadius: 999,
    height: 70,
    left: 72,
    position: 'absolute',
    top: 92,
    width: 70,
  },
  fence: {
    backgroundColor: '#6C5A36',
    height: 18,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 122,
  },
  dumpster: {
    backgroundColor: '#28562F',
    borderColor: '#1F4328',
    borderRadius: 8,
    borderWidth: 2,
    height: 56,
    left: '42%',
    position: 'absolute',
    top: 124,
    width: 104,
  },
  dumpsterLip: {
    backgroundColor: '#396E3A',
    borderRadius: 4,
    height: 17,
    left: '44%',
    position: 'absolute',
    top: 134,
    width: 84,
  },
  trashCan: {
    backgroundColor: '#7D7D75',
    borderColor: '#4E514F',
    borderRadius: 6,
    borderWidth: 2,
    height: 48,
    left: '72%',
    position: 'absolute',
    top: 132,
    width: 30,
  },
});
