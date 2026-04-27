import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LootSketch, RaccoonSketch } from '@/components/game/skia-placeholders';
import { ActionButton, Card, CostRow, GameScreen, gameColors, MessageBanner, SectionTitle, StatLine } from '@/components/game/ui';
import { hasResources, LOOT_ITEMS, RACCOON_CLASSES, RACCOONS, RaccoonId } from '@/constants/game';
import { useGame } from '@/state/game-store';

type CollectionTab = 'raccoons' | 'loot';

export default function CollectionScreen() {
  const [tab, setTab] = useState<CollectionTab>('raccoons');
  const { state, recruitRaccoon } = useGame();
  const recruitedCount = (Object.keys(RACCOONS) as RaccoonId[]).filter((raccoonId) => state.raccoons[raccoonId].unlocked).length;
  const lootIds = Object.keys(LOOT_ITEMS);

  return (
    <GameScreen title="Collection" subtitle="Track recruitable classes and loot discoveries.">
      <MessageBanner />

      <Card style={styles.summaryCard}>
        <SectionTitle title="Progress" />
        <StatLine icon="account-group" label="Raccoons recruited" value={`${recruitedCount} / 4`} />
        <StatLine icon="treasure-chest" label="Loot discovered" value={`${state.discoveredLoot.length} / ${lootIds.length}`} />
      </Card>

      <View style={styles.segmented}>
        <SegmentButton active={tab === 'raccoons'} label="Raccoons" onPress={() => setTab('raccoons')} />
        <SegmentButton active={tab === 'loot'} label="Loot" onPress={() => setTab('loot')} />
      </View>

      {tab === 'raccoons' ? (
        <View style={styles.cardGrid}>
          {(Object.keys(RACCOONS) as RaccoonId[]).map((raccoonId) => {
            const raccoon = RACCOONS[raccoonId];
            const raccoonState = state.raccoons[raccoonId];
            const raccoonClass = RACCOON_CLASSES[raccoon.classId];
            const canRecruit = hasResources(state.resources, raccoon.recruitCost);

            return (
              <Card key={raccoonId} style={styles.raccoonCard}>
                <View style={styles.raccoonTop}>
                  <RaccoonSketch raccoonId={raccoonId} size={82} locked={!raccoonState.unlocked} />
                  <View style={styles.raccoonCopy}>
                    <View style={styles.nameRow}>
                      <Text style={styles.cardTitle}>{raccoonState.unlocked ? raccoon.name : 'Unknown'}</Text>
                      <Text style={[styles.classBadge, { backgroundColor: raccoonClass.color }]}>{raccoonClass.label}</Text>
                    </View>
                    <Text style={styles.roleText}>{raccoonClass.role}</Text>
                    <Text style={styles.bodyText}>{raccoonState.unlocked ? raccoon.collectionHint : raccoonClass.bonus}</Text>
                  </View>
                </View>

                {raccoonState.unlocked ? (
                  <View style={styles.unlockedStrip}>
                    <Text style={styles.unlockedText}>Recruited - Level {raccoonState.level}</Text>
                  </View>
                ) : (
                  <View style={styles.recruitRow}>
                    <View style={styles.recruitCost}>
                      <Text style={styles.costLabel}>Recruit cost</Text>
                      <CostRow cost={raccoon.recruitCost} resources={state.resources} />
                    </View>
                    <ActionButton disabled={!canRecruit} icon="account-plus" onPress={() => recruitRaccoon(raccoonId)}>
                      Recruit
                    </ActionButton>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      ) : (
        <View style={styles.lootGrid}>
          {lootIds.map((lootId) => {
            const loot = LOOT_ITEMS[lootId];
            const discovered = state.discoveredLoot.includes(lootId);

            return (
              <Card key={lootId} style={styles.lootCard}>
                <LootSketch lootId={lootId} size={58} locked={!discovered} />
                <Text style={styles.lootName}>{discovered ? loot.name : '???'}</Text>
                <Text style={[styles.rarityText, styles[loot.rarity]]}>{loot.rarity}</Text>
                <Text style={styles.lootFlavor}>{discovered ? loot.flavor : `Found in ${loot.source === 'alley' ? 'Alley Dumpster' : loot.source === 'backlot' ? 'Apartment Backlot' : 'Convenience Store'}.`}</Text>
              </Card>
            );
          })}
        </View>
      )}
    </GameScreen>
  );
}

function SegmentButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.segmentButton, active && styles.segmentButtonActive]}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: 8,
  },
  segmented: {
    backgroundColor: '#E3C28C',
    borderColor: 'rgba(84, 52, 25, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FFF1D4',
  },
  segmentText: {
    color: gameColors.muted,
    fontSize: 14,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: gameColors.ink,
  },
  cardGrid: {
    gap: 12,
  },
  raccoonCard: {
    gap: 12,
  },
  raccoonTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  raccoonCopy: {
    flex: 1,
    gap: 5,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cardTitle: {
    color: gameColors.ink,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  classBadge: {
    borderRadius: 7,
    color: '#FFF8E8',
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  roleText: {
    color: gameColors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  bodyText: {
    color: gameColors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  unlockedStrip: {
    backgroundColor: '#E7F0D1',
    borderColor: '#9EB36F',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  unlockedText: {
    color: gameColors.greenDark,
    fontSize: 13,
    fontWeight: '900',
  },
  recruitRow: {
    alignItems: 'center',
    backgroundColor: '#F9E3BA',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  recruitCost: {
    flex: 1,
    gap: 6,
  },
  costLabel: {
    color: gameColors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  lootGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  lootCard: {
    alignItems: 'center',
    gap: 5,
    minHeight: 166,
    width: '48%',
  },
  lootName: {
    color: gameColors.ink,
    fontSize: 13,
    fontWeight: '900',
    minHeight: 18,
    textAlign: 'center',
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  common: {
    color: '#7D5C29',
  },
  uncommon: {
    color: '#7257A0',
  },
  rare: {
    color: '#1970A7',
  },
  lootFlavor: {
    color: gameColors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    textAlign: 'center',
  },
});
