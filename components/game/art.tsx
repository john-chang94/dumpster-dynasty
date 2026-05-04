import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { ImageStyle, StyleProp, StyleSheet, View } from 'react-native';

import {
  environmentSources,
  getBaseThemeSource,
  getBuildingSource,
  getLootSource,
  getRaccoonAnimationFrameSource,
  getRaccoonAnimationSources,
  getRaccoonSource,
  getZoneEnvironmentSource,
  lockedPanelSource,
  RaccoonAnimationId,
} from '@/components/game/asset-sources';
import { BaseThemeId, BuildingId, RaccoonId, ZoneId } from '@/constants/game';

export function RaccoonArt({
  raccoonId,
  size = 96,
  locked = false,
  style,
}: {
  raccoonId: RaccoonId;
  size?: number;
  locked?: boolean;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      contentFit="contain"
      source={getRaccoonSource(raccoonId, locked)}
      style={[{ height: size, width: size }, style]}
    />
  );
}

export function AnimatedRaccoonArt({
  raccoonId,
  animation = 'idle',
  size = 96,
  locked = false,
  intervalMs,
  style,
}: {
  raccoonId: RaccoonId;
  animation?: RaccoonAnimationId;
  size?: number;
  locked?: boolean;
  intervalMs?: number;
  style?: StyleProp<ImageStyle>;
}) {
  const frameIntervalMs = intervalMs ?? getAnimationFrameInterval(animation);
  const frames = useMemo(
    () => getRaccoonAnimationSources(raccoonId, animation),
    [animation, raccoonId],
  );
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);

    if (locked || frames.length <= 1) {
      return;
    }

    const timer = setInterval(
      () => setFrameIndex((currentFrame) => (currentFrame + 1) % frames.length),
      frameIntervalMs,
    );

    return () => clearInterval(timer);
  }, [frameIntervalMs, frames, locked]);

  return (
    <Image
      accessibilityIgnoresInvertColors
      contentFit="contain"
      source={locked ? getRaccoonSource(raccoonId, true) : frames[frameIndex % frames.length]}
      style={[{ height: size, width: size }, style]}
    />
  );
}

export function RaccoonAnimationFrameArt({
  raccoonId,
  animation,
  frameIndex,
  size = 96,
  locked = false,
  style,
}: {
  raccoonId: RaccoonId;
  animation: RaccoonAnimationId;
  frameIndex: number;
  size?: number;
  locked?: boolean;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      contentFit="contain"
      source={
        locked
          ? getRaccoonSource(raccoonId, true)
          : getRaccoonAnimationFrameSource(raccoonId, animation, frameIndex)
      }
      style={[{ height: size, width: size }, style]}
    />
  );
}

function getAnimationFrameInterval(animation: RaccoonAnimationId) {
  switch (animation) {
    case 'idle':
      return 560;
    case 'fail':
      return 150;
    case 'tap':
    case 'celebrate':
    case 'search':
    case 'grab':
      return 115;
    case 'walk':
    case 'carry':
      return 105;
  }
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

export function BaseThemePreview({
  themeId,
  height = 112,
}: {
  themeId: BaseThemeId;
  height?: number;
}) {
  return (
    <View style={[styles.imageFrame, { height, width: '100%' }]}>
      <Image
        accessibilityIgnoresInvertColors
        contentFit="cover"
        source={getBaseThemeSource(themeId)}
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
