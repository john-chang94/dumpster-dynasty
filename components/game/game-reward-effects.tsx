import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, Pressable, View } from 'react-native';

import { resourceIconSources } from '@/components/game/asset-sources';
import { LootArt } from '@/components/game/art';
import {
  RESOURCE_KEYS,
  LOOT_ITEMS,
  ResourceBundle,
} from '@/constants/game';
import { gameColors } from '@/components/game/ui';
import { useGame } from '@/state/game-store';

/** Full-screen overlays for floating resource bursts + new loot */
export function GameRewardEffectsLayer() {
  const {
    state: { pendingRewardBurst, lootCelebrationLootId },
    clearLootCelebration,
    clearPendingRewardBurst,
    loaded,
  } = useGame();

  useRewardBurstPulse(pendingRewardBurst, loaded, clearPendingRewardBurst);

  return (
    <LootRevealModal lootId={lootCelebrationLootId ?? null} onClose={clearLootCelebration} />
  );
}

function useRewardBurstPulse(
  burst: ResourceBundle | null,
  loaded: boolean,
  clear: () => void,
) {
  const [visibleBurst, setVisibleBurst] = useState<ResourceBundle | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  const hidTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!loaded || burst === null || getBurstTotal(burst) <= 0) {
      return;
    }

    setVisibleBurst(burst);

    fade.setValue(0);
    lift.setValue(18);

    if (hidTimer.current) {
      clearTimeout(hidTimer.current);
    }

    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.timing(lift, { toValue: -6, duration: 420, useNativeDriver: true }),
    ]).start();

    hidTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(lift, { toValue: -28, duration: 260, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) {
          setVisibleBurst(null);
          clear();
        }
      });
    }, 1100);

    return () => {
      if (hidTimer.current) {
        clearTimeout(hidTimer.current);
      }
    };
  }, [burst, loaded, fade, lift, clear]);

  if (!visibleBurst || getBurstTotal(visibleBurst) <= 0) {
    return null;
  }

  return (
    <Animated.View style={[rewardStyles.wrap, { opacity: fade, transform: [{ translateY: lift }] }]}>
      {RESOURCE_KEYS.map((key) => {
        const n = visibleBurst[key];

        if (!n || n <= 0) {
          return null;
        }

        return (
          <View key={key} style={rewardStyles.puff}>
            <Image
              accessibilityIgnoresInvertColors
              contentFit="contain"
              source={resourceIconSources[key]}
              style={{ height: 20, width: 20 }}
            />
            <Text style={rewardStyles.delta}>+{n}</Text>
          </View>
        );
      })}
    </Animated.View>
  );
}

function getBurstTotal(resources: ResourceBundle) {
  return RESOURCE_KEYS.reduce((sum, key) => sum + (resources[key] ?? 0), 0);
}

function LootRevealModal({ lootId, onClose }: { lootId: string | null; onClose: () => void }) {
  if (!lootId || !(lootId in LOOT_ITEMS)) {
    return null;
  }

  const loot = LOOT_ITEMS[lootId];

  return (
    <Modal animationType="fade" transparent statusBarTranslucent visible onRequestClose={onClose}>
      <Pressable accessibilityRole="button" onPress={onClose} style={rewardStylesmodal.scrim}>
        <Pressable accessibilityRole="none" style={rewardStylesmodal.card} onPress={() => undefined}>
          <Text style={rewardStylesmodal.tag}>NEW FIND · {loot.rarity}</Text>
          <Text style={rewardStylesmodal.title}>{loot.name}</Text>
          <LootArt lootId={lootId} locked={false} size={120} />
          <Text style={rewardStylesmodal.flavor}>{loot.flavor}</Text>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <MaterialCommunityIcons color={gameColors.orangeDark} name="gift" size={20} />
            <Text style={rewardStylesmodal.tap}>Tap anywhere to tuck it into the stash</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const rewardStyles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,247,236,0.94)',
    borderColor: 'rgba(84,52,25,0.18)',
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    left: '6%',
    maxWidth: '88%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    top: '52%',
    zIndex: 30,
    flexWrap: 'wrap',
  },
  puff: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#FFFDF6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(84,52,25,0.12)',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  delta: {
    color: gameColors.greenDark,
    fontWeight: '900',
    fontSize: 13,
  },
});

const rewardStylesmodal = StyleSheet.create({
  scrim: {
    alignItems: 'center',
    backgroundColor: 'rgba(42,31,26,0.55)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#8D5D2D',
    gap: 10,
    maxWidth: 320,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '100%',
  },
  tag: {
    color: gameColors.greenDark,
    fontWeight: '900',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  title: {
    color: gameColors.ink,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  flavor: {
    color: gameColors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
  tap: {
    color: gameColors.muted,
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
});
