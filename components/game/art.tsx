import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import {
  environmentSources,
  getBuildingSource,
  getLootSource,
  getRaccoonSource,
  getZoneEnvironmentSource,
  lockedPanelSource,
} from '@/components/game/asset-sources';
import { BuildingId, RaccoonId, ZoneId } from '@/constants/game';

export function RaccoonArt({
  raccoonId,
  size = 96,
  locked = false,
}: {
  raccoonId: RaccoonId;
  size?: number;
  locked?: boolean;
}) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      contentFit="contain"
      source={getRaccoonSource(raccoonId, locked)}
      style={{ height: size, width: size }}
    />
  );
}

export function BuildingArt({
  buildingId,
  level,
  size = 90,
}: {
  buildingId: BuildingId;
  level: number;
  size?: number;
}) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      contentFit="contain"
      source={getBuildingSource(buildingId, level)}
      style={{ height: size, width: size }}
    />
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
  return (
    <View style={[styles.imageFrame, { height, width }]}>
      <Image
        accessibilityIgnoresInvertColors
        contentFit="cover"
        source={getZoneEnvironmentSource(zoneId)}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export function LootArt({ lootId, size = 54, locked = false }: { lootId?: string; size?: number; locked?: boolean }) {
  const lootSource = locked ? lockedPanelSource : getLootSource(lootId);

  return (
    <View style={[styles.lootFrame, { height: size, width: size }]}>
      {lootSource ? (
        <Image
          accessibilityIgnoresInvertColors
          contentFit="contain"
          source={lootSource}
          style={styles.lootImage}
        />
      ) : null}
    </View>
  );
}

export function BaseBackdrop({ height = 310 }: { height?: number }) {
  return (
    <View style={[styles.imageFrame, { height, width: '100%' }]}>
      <Image
        accessibilityIgnoresInvertColors
        contentFit="cover"
        source={environmentSources.baseDay}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageFrame: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  lootFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lootImage: {
    height: '100%',
    width: '100%',
  },
});
