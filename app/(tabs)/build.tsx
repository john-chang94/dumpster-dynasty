import { StyleSheet, Text, View } from 'react-native';

import { BuildingSketch } from '@/components/game/skia-placeholders';
import { ActionButton, Card, CostRow, GameScreen, gameColors, MessageBanner, ProgressBar, SectionTitle } from '@/components/game/ui';
import { BUILDINGS, BuildingId, getBuildingStage, getBuildingUpgradeCost, hasResources } from '@/constants/game';
import { useGame } from '@/state/game-store';

export default function BuildScreen() {
  const { state, upgradeBuilding } = useGame();

  return (
    <GameScreen title="Build & Upgrade" subtitle="Linear building upgrades tune the idle economy for the first prototype.">
      <MessageBanner />

      <Card style={styles.introCard}>
        <SectionTitle title="Base Bonuses" />
        <Text style={styles.bodyText}>
          These five buildings match the MVP roadmap. Each level improves the claim loop immediately; the three visual stages are
          placeholder sketches until production art arrives.
        </Text>
      </Card>

      {(Object.keys(BUILDINGS) as BuildingId[]).map((buildingId) => {
        const building = BUILDINGS[buildingId];
        const level = state.buildings[buildingId].level;
        const cost = getBuildingUpgradeCost(buildingId, level);
        const canUpgrade = Boolean(cost && hasResources(state.resources, cost));
        const progress = level / building.maxLevel;

        return (
          <Card key={buildingId} style={styles.buildingCard}>
            <View style={styles.buildingTop}>
              <BuildingSketch buildingId={buildingId} level={level} size={86} />
              <View style={styles.buildingCopy}>
                <View style={styles.titleRow}>
                  <Text style={styles.buildingName}>{building.name}</Text>
                  <Text style={styles.levelBadge}>Lv {level}</Text>
                </View>
                <Text style={styles.effectText}>{building.effect}</Text>
                <Text style={styles.stageText}>Stage {getBuildingStage(level)} - {building.stageName}</Text>
                <ProgressBar value={progress} />
              </View>
            </View>

            <View style={styles.upgradeRow}>
              <View style={styles.costBlock}>
                <Text style={styles.costLabel}>Upgrade cost</Text>
                <CostRow cost={cost} resources={state.resources} />
              </View>
              <ActionButton
                disabled={!canUpgrade}
                icon={cost ? 'arrow-up-bold' : 'check-bold'}
                onPress={() => upgradeBuilding(buildingId)}
                style={styles.upgradeButton}>
                {cost ? 'Upgrade' : 'Maxed'}
              </ActionButton>
            </View>
          </Card>
        );
      })}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  introCard: {
    gap: 10,
  },
  bodyText: {
    color: gameColors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  buildingCard: {
    gap: 12,
  },
  buildingTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  buildingCopy: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buildingName: {
    color: gameColors.ink,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  levelBadge: {
    backgroundColor: '#F8E0AC',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 7,
    borderWidth: 1,
    color: gameColors.ink,
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  effectText: {
    color: gameColors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  stageText: {
    color: gameColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  upgradeRow: {
    alignItems: 'center',
    backgroundColor: '#F9E3BA',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  costBlock: {
    flex: 1,
    gap: 6,
  },
  costLabel: {
    color: gameColors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  upgradeButton: {
    minWidth: 104,
  },
});
