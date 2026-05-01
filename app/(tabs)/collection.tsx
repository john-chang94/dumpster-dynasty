import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LootArt, RaccoonArt } from '@/components/game/art';
import {
  ActionButton,
  Card,
  CostRow,
  GameScreen,
  gameColors,
  MessageBanner,
  ProgressBar,
  ResourceAmount,
  SectionTitle,
} from '@/components/game/ui';
import {
  DAILY_QUEST_IDS,
  DAILY_QUESTS,
  hasResources,
  LOOT_ITEMS,
  MILESTONE_IDS,
  MILESTONE_REWARDS,
  RACCOON_CLASSES,
  RACCOONS,
  RaccoonId,
  RESOURCE_KEYS,
  ResourceCost,
} from '@/constants/game';
import { useGame } from '@/state/game-store';

type HubTab = 'quests' | 'collection';
type CollectionTab = 'raccoons' | 'loot';

export default function CollectionScreen() {
  const [hubTab, setHubTab] = useState<HubTab>('quests');
  const [collectionTab, setCollectionTab] = useState<CollectionTab>('raccoons');
  const { state, recruitRaccoon, claimDailyQuestReward, claimMilestoneReward } = useGame();
  const raccoonIds = Object.keys(RACCOONS) as RaccoonId[];
  const lootIds = Object.keys(LOOT_ITEMS);
  const discoveredLootIds = Array.from(new Set(state.discoveredLoot)).filter((lootId) => lootId in LOOT_ITEMS);
  const discoveredLootSet = new Set(discoveredLootIds);
  const orderedLootIds = [
    ...discoveredLootIds,
    ...lootIds.filter((lootId) => !discoveredLootSet.has(lootId)),
  ];
  const recruitedCount = raccoonIds.filter((raccoonId) => state.raccoons[raccoonId].unlocked).length;
  const dailyCompleteCount = DAILY_QUEST_IDS.filter(
    (questId) => (state.questProgress[questId] ?? 0) >= DAILY_QUESTS[questId].target,
  ).length;
  const collectionProgress =
    collectionTab === 'raccoons' ? recruitedCount / raccoonIds.length : discoveredLootIds.length / lootIds.length;

  return (
    <GameScreen title="Collection" subtitle={`${dailyCompleteCount} daily - ${discoveredLootIds.length} loot finds`}>
      <MessageBanner scope="collection" />

      <Card style={styles.tabsCard}>
        <View style={styles.segmented}>
          <SegmentButton active={hubTab === 'quests'} label="Quests" onPress={() => setHubTab('quests')} />
          <SegmentButton active={hubTab === 'collection'} label="Collection" onPress={() => setHubTab('collection')} />
        </View>
      </Card>

      {hubTab === 'quests' ? (
        <>
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <SectionTitle title="Daily Tasks" />
              <Text style={styles.countBadge}>
                {state.claimedDailyQuestIds.length} / {DAILY_QUEST_IDS.length}
              </Text>
            </View>
            <View style={styles.taskList}>
              {DAILY_QUEST_IDS.map((questId) => {
                const quest = DAILY_QUESTS[questId];
                const progress = Math.min(quest.target, state.questProgress[questId] ?? 0);
                const claimed = state.claimedDailyQuestIds.includes(questId);
                const ready = progress >= quest.target && !claimed;

                return (
                  <View key={questId} style={styles.taskRow}>
                    <View style={styles.taskTop}>
                      <View style={styles.rowCopy}>
                        <Text style={styles.taskTitle}>{quest.title}</Text>
                        <Text style={styles.bodyText}>{quest.description}</Text>
                      </View>
                      <RewardPills reward={quest.reward} />
                    </View>
                    <ProgressBar value={progress / quest.target} />
                    <View style={styles.taskBottom}>
                      <Text style={styles.progressText}>
                        {progress} / {quest.target}
                      </Text>
                      <ActionButton
                        disabled={!ready}
                        icon={claimed ? 'check-bold' : 'gift-open'}
                        onPress={() => claimDailyQuestReward(questId)}
                        style={styles.claimRewardButton}
                        tone={ready ? 'primary' : 'plain'}>
                        {claimed ? 'Claimed' : ready ? 'Claim' : 'Progress'}
                      </ActionButton>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>

          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <SectionTitle title="Milestone Rewards" />
              <Text style={styles.countBadge}>{state.totalRunsClaimed} runs</Text>
            </View>
            <View style={styles.taskList}>
              {MILESTONE_IDS.map((milestoneId) => {
                const milestone = MILESTONE_REWARDS[milestoneId];
                const progress = Math.min(milestone.targetRuns, state.totalRunsClaimed);
                const claimed = state.claimedMilestoneIds.includes(milestoneId);
                const ready = progress >= milestone.targetRuns && !claimed;

                return (
                  <View key={milestoneId} style={styles.taskRow}>
                    <View style={styles.taskTop}>
                      <View style={styles.rowCopy}>
                        <Text style={styles.taskTitle}>{milestone.title}</Text>
                        <Text style={styles.bodyText}>Keep claiming completed loot runs.</Text>
                      </View>
                      <RewardPills reward={milestone.reward} />
                    </View>
                    <ProgressBar value={progress / milestone.targetRuns} />
                    <View style={styles.taskBottom}>
                      <Text style={styles.progressText}>
                        {progress} / {milestone.targetRuns}
                      </Text>
                      <ActionButton
                        disabled={!ready}
                        icon={claimed ? 'check-bold' : 'treasure-chest'}
                        onPress={() => claimMilestoneReward(milestoneId)}
                        style={styles.claimRewardButton}
                        tone={ready ? 'primary' : 'plain'}>
                        {claimed ? 'Claimed' : ready ? 'Claim' : 'Progress'}
                      </ActionButton>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </>
      ) : (
        <>
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <SectionTitle title="Collection Progress" />
              <Text style={styles.countBadge}>
                {collectionTab === 'raccoons'
                  ? `${recruitedCount} / ${raccoonIds.length}`
                  : `${discoveredLootIds.length} / ${lootIds.length}`}
              </Text>
            </View>
            <ProgressBar value={collectionProgress} />
            <View style={styles.segmented}>
              <SegmentButton
                active={collectionTab === 'raccoons'}
                label="Raccoons"
                onPress={() => setCollectionTab('raccoons')}
              />
              <SegmentButton active={collectionTab === 'loot'} label="Loot" onPress={() => setCollectionTab('loot')} />
            </View>
          </Card>

          {collectionTab === 'raccoons' ? (
            <View style={styles.listStack}>
              {raccoonIds.map((raccoonId) => {
                const raccoon = RACCOONS[raccoonId];
                const raccoonState = state.raccoons[raccoonId];
                const raccoonClass = RACCOON_CLASSES[raccoon.classId];
                const canRecruit = hasResources(state.resources, raccoon.recruitCost);

                return (
                  <Card key={raccoonId} style={styles.raccoonRow}>
                    <View style={styles.artFrame}>
                      <RaccoonArt raccoonId={raccoonId} size={86} locked={!raccoonState.unlocked} />
                    </View>
                    <View style={styles.rowCopy}>
                      <View style={styles.nameRow}>
                        <Text style={styles.cardTitle}>{raccoonState.unlocked ? raccoon.name : '???'}</Text>
                        <Text style={[styles.classBadge, { backgroundColor: raccoonClass.color }]}>
                          {raccoonClass.label}
                        </Text>
                      </View>
                      <Text style={styles.roleText}>{raccoonClass.role}</Text>
                      <Text style={styles.bodyText}>
                        {raccoonState.unlocked ? raccoon.collectionHint : raccoonClass.bonus}
                      </Text>
                    </View>
                    <View style={styles.actionColumn}>
                      {raccoonState.unlocked ? (
                        <Text style={styles.unlockedBadge}>Level {raccoonState.level}</Text>
                      ) : (
                        <>
                          <CostRow cost={raccoon.recruitCost} resources={state.resources} />
                          <ActionButton
                            disabled={!canRecruit}
                            icon="account-plus"
                            onPress={() => recruitRaccoon(raccoonId)}
                            style={styles.recruitButton}>
                            Recruit
                          </ActionButton>
                        </>
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : (
            <View style={styles.listStack}>
              {orderedLootIds.map((lootId) => {
                const loot = LOOT_ITEMS[lootId];
                const discovered = discoveredLootSet.has(lootId);

                return (
                  <Card key={lootId} style={styles.lootRow}>
                    <View style={styles.lootFrame}>
                      <LootArt lootId={lootId} size={58} locked={!discovered} />
                    </View>
                    <View style={styles.rowCopy}>
                      <Text style={styles.cardTitle}>{discovered ? loot.name : '???'}</Text>
                      <Text style={[styles.rarityText, styles[loot.rarity]]}>{loot.rarity}</Text>
                      <Text style={styles.bodyText}>
                        {discovered
                          ? loot.flavor
                          : `Found in ${
                              loot.source === 'alley'
                                ? 'Alley Dumpster'
                                : loot.source === 'backlot'
                                  ? 'Apartment Backlot'
                                  : 'Convenience Store'
                            }.`}
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </>
      )}
    </GameScreen>
  );
}

function RewardPills({ reward }: { reward: ResourceCost }) {
  return (
    <View style={styles.rewardPills}>
      {RESOURCE_KEYS.filter((key) => (reward[key] ?? 0) > 0).map((key) => (
        <ResourceAmount key={key} amount={reward[key] ?? 0} resourceKey={key} />
      ))}
    </View>
  );
}

function SegmentButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.segmentButton, active && styles.segmentButtonActive]}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabsCard: {
    padding: 8,
  },
  progressCard: {
    gap: 11,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countBadge: {
    backgroundColor: '#F8E0AC',
    borderColor: 'rgba(84, 52, 25, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    color: gameColors.ink,
    fontSize: 14,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    justifyContent: 'center',
    minHeight: 38,
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
  taskList: {
    gap: 9,
  },
  taskRow: {
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.16)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 9,
  },
  taskTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  taskTitle: {
    color: gameColors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  taskBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: gameColors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  rewardPills: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'flex-end',
    maxWidth: 150,
  },
  claimRewardButton: {
    minHeight: 34,
    minWidth: 96,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  listStack: {
    gap: 10,
  },
  raccoonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 128,
  },
  lootRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 98,
  },
  artFrame: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    height: 98,
    justifyContent: 'center',
    width: 98,
  },
  lootFrame: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  rowCopy: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  cardTitle: {
    color: gameColors.ink,
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
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  actionColumn: {
    alignItems: 'flex-end',
    gap: 7,
    maxWidth: 118,
  },
  unlockedBadge: {
    backgroundColor: '#E7F0D1',
    borderColor: '#9EB36F',
    borderRadius: 8,
    borderWidth: 1,
    color: gameColors.greenDark,
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  recruitButton: {
    minHeight: 36,
    minWidth: 102,
    paddingHorizontal: 10,
    paddingVertical: 7,
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
});
