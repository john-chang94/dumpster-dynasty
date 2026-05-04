import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedRaccoonArt, BaseThemePreview, LootArt, RaccoonArt } from '@/components/game/art';
import {
  ActionButton,
  Card,
  CostRow,
  GameScreen,
  gameColors,
  ProgressBar,
  ResourceAmount,
  SectionTitle,
} from '@/components/game/ui';
import {
  BASE_THEME_IDS,
  BASE_THEMES,
  BaseThemeId,
  DAILY_QUEST_IDS,
  DAILY_QUESTS,
  hasResources,
  LOOT_ITEMS,
  MILESTONE_IDS,
  MILESTONE_REWARDS,
  RACCOON_CLASSES,
  RACCOONS,
  RACCOON_SKIN_IDS,
  RACCOON_SKINS,
  RaccoonId,
  RaccoonSkinId,
  RESOURCE_KEYS,
  ResourceCost,
} from '@/constants/game';
import { useMusicTrack } from '@/hooks/use-audio-events';
import { useGame } from '@/state/game-store';

type HubTab = 'quests' | 'collection';
type CollectionTab = 'raccoons' | 'loot' | 'base';

export default function CollectionScreen() {
  const [hubTab, setHubTab] = useState<HubTab>('quests');
  const [collectionTab, setCollectionTab] = useState<CollectionTab>('raccoons');
  const [selectedRaccoonId, setSelectedRaccoonId] = useState<RaccoonId | null>(null);
  const {
    state,
    recruitRaccoon,
    claimDailyQuestReward,
    claimMilestoneReward,
    equipRaccoonSkin,
    selectBaseTheme,
    advanceTutorialCollection,
  } = useGame();

  useMusicTrack('home');

  useFocusEffect(
    useCallback(() => {
      advanceTutorialCollection();
    }, [advanceTutorialCollection]),
  );


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
  const ownedThemeCount = BASE_THEME_IDS.filter((themeId) => state.ownedBaseThemeIds.includes(themeId)).length;
  const collectionProgress =
    collectionTab === 'raccoons'
      ? recruitedCount / raccoonIds.length
      : collectionTab === 'loot'
        ? discoveredLootIds.length / lootIds.length
        : ownedThemeCount / BASE_THEME_IDS.length;

  return (
    <GameScreen title="Collection" subtitle={`${dailyCompleteCount} daily - ${discoveredLootIds.length} loot finds`}>
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
                  : collectionTab === 'loot'
                    ? `${discoveredLootIds.length} / ${lootIds.length}`
                    : `${ownedThemeCount} / ${BASE_THEME_IDS.length}`}
              </Text>
            </View>
            <ProgressBar value={collectionProgress} />
            {collectionTab === 'loot' ? (
              <Text style={styles.collectionTeaser}>
                {lootIds.length - discoveredLootIds.length} catalog discoveries left — shinier loot tends to lurk toward
                the Convenience Store.
              </Text>
            ) : null}
            <View style={styles.segmented}>
              <SegmentButton
                active={collectionTab === 'raccoons'}
                label="Raccoons"
                onPress={() => setCollectionTab('raccoons')}
              />
              <SegmentButton active={collectionTab === 'loot'} label="Loot" onPress={() => setCollectionTab('loot')} />
              <SegmentButton active={collectionTab === 'base'} label="Base" onPress={() => setCollectionTab('base')} />
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
                  <Pressable
                    accessibilityRole="button"
                    key={raccoonId}
                    onPress={() => setSelectedRaccoonId(raccoonId)}>
                    <Card style={styles.raccoonRow}>
                      <View style={styles.artFrame}>
                        <AnimatedRaccoonArt
                          animation={raccoonState.unlocked ? 'idle' : 'fail'}
                          locked={!raccoonState.unlocked}
                          raccoonId={raccoonId}
                          size={86}
                        />
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
                  </Pressable>
                );
              })}
            </View>
          ) : collectionTab === 'loot' ? (
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
          ) : (
            <View style={styles.listStack}>
              {BASE_THEME_IDS.map((themeId) => (
                <BaseThemeCard
                  active={state.selectedBaseThemeId === themeId}
                  key={themeId}
                  owned={state.ownedBaseThemeIds.includes(themeId)}
                  onSelect={() => selectBaseTheme(themeId)}
                  themeId={themeId}
                />
              ))}
            </View>
          )}
        </>
      )}
      <RaccoonDetailSheet
        equippedSkinId={
          selectedRaccoonId ? state.equippedSkinByRaccoon[selectedRaccoonId] : undefined
        }
        onClose={() => setSelectedRaccoonId(null)}
        onEquip={equipRaccoonSkin}
        ownedSkinIds={state.ownedRaccoonSkinIds}
        raccoonId={selectedRaccoonId}
        raccoonState={selectedRaccoonId ? state.raccoons[selectedRaccoonId] : undefined}
      />
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

function BaseThemeCard({
  themeId,
  owned,
  active,
  onSelect,
}: {
  themeId: BaseThemeId;
  owned: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const theme = BASE_THEMES[themeId];

  return (
    <Card style={[styles.themeCard, active && styles.themeCardActive]}>
      <BaseThemePreview themeId={themeId} />
      <View style={styles.themeCopy}>
        <View style={styles.nameRow}>
          <Text style={styles.cardTitle}>{theme.label}</Text>
          <Text style={[styles.themeBadge, { backgroundColor: theme.accentColor }]}>
            {owned ? 'Owned' : 'Future'}
          </Text>
        </View>
        <Text style={styles.bodyText}>{theme.description}</Text>
        <Text style={styles.themeUnlockText}>{theme.unlockCopy}</Text>
      </View>
      <ActionButton
        disabled={!owned || active}
        icon={active ? 'check-bold' : owned ? 'brush' : 'lock'}
        onPress={onSelect}
        tone={owned && !active ? 'primary' : 'plain'}>
        {active ? 'Active' : owned ? 'Apply' : 'Locked'}
      </ActionButton>
    </Card>
  );
}

function RaccoonDetailSheet({
  raccoonId,
  raccoonState,
  equippedSkinId,
  ownedSkinIds,
  onEquip,
  onClose,
}: {
  raccoonId: RaccoonId | null;
  raccoonState?: { unlocked: boolean; level: number };
  equippedSkinId?: RaccoonSkinId;
  ownedSkinIds: RaccoonSkinId[];
  onEquip: (raccoonId: RaccoonId, skinId: RaccoonSkinId) => void;
  onClose: () => void;
}) {
  if (!raccoonId) {
    return null;
  }

  const raccoon = RACCOONS[raccoonId];
  const raccoonClass = RACCOON_CLASSES[raccoon.classId];
  const skinIds = RACCOON_SKIN_IDS.filter((skinId) => RACCOON_SKINS[skinId].raccoonId === raccoonId);
  const stats = getRaccoonStats(raccoonId, raccoonState?.level ?? 1);
  const unlocked = Boolean(raccoonState?.unlocked);

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View style={styles.detailBackdrop}>
        <View style={styles.detailSheet}>
          <View style={styles.detailHeader}>
            <View style={styles.detailTitleBlock}>
              <Text style={styles.detailKicker}>{raccoonClass.label} Raccoon</Text>
              <Text style={styles.detailTitle}>{unlocked ? raccoon.name : '???'}</Text>
            </View>
            <ActionButton icon="close" onPress={onClose} style={styles.closeButton} tone="plain">
              Close
            </ActionButton>
          </View>

          <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.detailHero}>
              <View style={styles.detailArtFrame}>
                <AnimatedRaccoonArt animation={unlocked ? 'idle' : 'fail'} locked={!unlocked} raccoonId={raccoonId} size={118} />
              </View>
              <View style={styles.detailCopy}>
                <Text style={styles.roleText}>{raccoonClass.role}</Text>
                <Text style={styles.bodyText}>{unlocked ? raccoon.collectionHint : raccoonClass.bonus}</Text>
                <Text style={[styles.classBadge, { backgroundColor: raccoonClass.color }]}>
                  Level {raccoonState?.level ?? 1}
                </Text>
              </View>
            </View>

            <View style={styles.statGrid}>
              {stats.map((stat) => (
                <View key={stat.label} style={styles.statPill}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.skinSection}>
              <SectionTitle title="Skins" />
              <View style={styles.skinGrid}>
                {skinIds.map((skinId) => (
                  <SkinSlotCard
                    equipped={equippedSkinId === skinId}
                    key={skinId}
                    owned={ownedSkinIds.includes(skinId)}
                    raccoonUnlocked={unlocked}
                    skinId={skinId}
                    onEquip={() => onEquip(raccoonId, skinId)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SkinSlotCard({
  skinId,
  owned,
  equipped,
  raccoonUnlocked,
  onEquip,
}: {
  skinId: RaccoonSkinId;
  owned: boolean;
  equipped: boolean;
  raccoonUnlocked: boolean;
  onEquip: () => void;
}) {
  const skin = RACCOON_SKINS[skinId];
  const selectable = owned && raccoonUnlocked && !equipped;

  return (
    <View style={[styles.skinCard, equipped && styles.skinCardEquipped]}>
      <RaccoonArt locked={!owned || !raccoonUnlocked} raccoonId={skin.raccoonId} size={54} />
      <Text adjustsFontSizeToFit minimumFontScale={0.76} numberOfLines={1} style={styles.skinTitle}>
        {skin.label}
      </Text>
      <Text numberOfLines={2} style={styles.skinBody}>
        {owned ? skin.description : skin.unlockCopy}
      </Text>
      <ActionButton
        disabled={!selectable}
        icon={equipped ? 'check-bold' : owned ? 'hanger' : 'lock'}
        onPress={onEquip}
        style={styles.skinButton}
        tone={selectable ? 'secondary' : 'plain'}>
        {equipped ? 'Equipped' : owned ? 'Equip' : 'Locked'}
      </ActionButton>
    </View>
  );
}

function getRaccoonStats(raccoonId: RaccoonId, level: number) {
  const baseStats = {
    scout: { Health: 30, Carry: 24, Speed: 78, Luck: 48 },
    hauler: { Health: 42, Carry: 82, Speed: 38, Luck: 36 },
    sniffer: { Health: 32, Carry: 34, Speed: 46, Luck: 80 },
    sneak: { Health: 28, Carry: 36, Speed: 64, Luck: 72 },
  }[raccoonId];
  const levelBonus = Math.max(0, level - 1) * 2;

  return Object.entries(baseStats).map(([label, value]) => ({
    label,
    value: value + levelBonus,
  }));
}

function SegmentButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.segmentButton, active && styles.segmentButtonActive]}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  collectionTeaser: {
    color: gameColors.greenDark,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 15,
    marginVertical: 4,
  },

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
  themeCard: {
    gap: 10,
  },
  themeCardActive: {
    borderColor: gameColors.orange,
  },
  themeCopy: {
    gap: 6,
  },
  themeBadge: {
    borderRadius: 7,
    color: '#FFF8E8',
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  themeUnlockText: {
    color: gameColors.greenDark,
    fontSize: 11,
    fontWeight: '900',
  },
  detailBackdrop: {
    backgroundColor: 'rgba(31, 19, 9, 0.48)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: gameColors.panel,
    borderColor: 'rgba(84, 52, 25, 0.34)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    gap: 12,
    maxHeight: '88%',
    padding: 14,
  },
  detailScroll: {
    gap: 12,
    paddingBottom: 6,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  detailTitleBlock: {
    flex: 1,
    gap: 2,
  },
  detailKicker: {
    color: gameColors.greenDark,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  detailTitle: {
    color: gameColors.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  closeButton: {
    minHeight: 36,
    minWidth: 82,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  detailHero: {
    alignItems: 'center',
    backgroundColor: '#F9E3BA',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 10,
  },
  detailArtFrame: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    height: 128,
    justifyContent: 'center',
    width: 128,
  },
  detailCopy: {
    flex: 1,
    gap: 7,
    minWidth: 0,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statPill: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.16)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: '22%',
    paddingHorizontal: 7,
    paddingVertical: 8,
  },
  statValue: {
    color: gameColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  statLabel: {
    color: gameColors.muted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  skinSection: {
    gap: 9,
  },
  skinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skinCard: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    minHeight: 178,
    padding: 8,
    width: '48.6%',
  },
  skinCardEquipped: {
    borderColor: gameColors.green,
    borderWidth: 2,
  },
  skinTitle: {
    color: gameColors.ink,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  skinBody: {
    color: gameColors.muted,
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    textAlign: 'center',
  },
  skinButton: {
    minHeight: 32,
    paddingHorizontal: 6,
    paddingVertical: 5,
    width: '100%',
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
