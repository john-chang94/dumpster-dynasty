import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BuildingArt } from '@/components/game/art';
import { ActionButton, Card, CostRow, GameScreen, gameColors, ProgressBar } from '@/components/game/ui';
import { BUILDINGS, BuildingId, getBuildingStage, getBuildingUpgradeCost, hasResources } from '@/constants/game';
import { useMusicTrack } from '@/hooks/use-audio-events';
import { useGame } from '@/state/game-store';

export default function BuildScreen() {
  const params = useLocalSearchParams<{ focus?: string }>();
  const { state, upgradeBuilding } = useGame();
  useMusicTrack('home');
  const highlightId =
    typeof params.focus === 'string' && params.focus in BUILDINGS ? (params.focus as BuildingId) : undefined;
  const [focusPulse, setFocusPulse] = useState(false);

  useEffect(() => {
    if (!highlightId) {
      setFocusPulse(false);

      return;
    }

    setFocusPulse(true);
    const timeout = setTimeout(() => setFocusPulse(false), 2600);

    return () => clearTimeout(timeout);
  }, [highlightId]);


  return (
    <GameScreen title="Build & Upgrade" subtitle="Upgrade structures to increase crew capacity, storage, and run output.">
      {(Object.keys(BUILDINGS) as BuildingId[]).map((buildingId) => {
        const building = BUILDINGS[buildingId];
        const level = state.buildings[buildingId].level;
        const stage = getBuildingStage(level);
        const cost = getBuildingUpgradeCost(buildingId, level);
        const canUpgrade = Boolean(cost && hasResources(state.resources, cost));
        const progress = level / building.maxLevel;

        return (
          <Card
            key={buildingId}
            style={[styles.buildingCard, highlightId === buildingId && focusPulse && styles.highlightCard]}>
            <View style={styles.buildingRow}>
              <View style={styles.artFrame}>
                <BuildingArt buildingId={buildingId} level={level} size={106} />
              </View>
              <View style={styles.buildingCopy}>
                <View style={styles.titleRow}>
                  <View style={styles.titleCopy}>
                    <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.buildingName}>
                      {building.name}
                    </Text>
                    <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={2} style={styles.effectText}>
                      {building.effect}
                    </Text>
                  </View>
                  <View style={styles.badgeStack}>
                    <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.levelBadge}>Lv {level}</Text>
                    <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.stageBadge}>Stage {stage}</Text>
                  </View>
                </View>
                <ProgressBar value={progress} />
                <View style={styles.upgradeRow}>
                  <View style={styles.costBlock}>
                    <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.costLabel}>Cost</Text>
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
              </View>
            </View>
          </Card>
        );
      })}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  buildingCard: {
    padding: 10,
  },
  highlightCard: {
    borderColor: '#E8B547',
    borderWidth: 2,
    shadowColor: '#E8B547',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
  },
  buildingRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 10,
  },
  artFrame: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    height: 106,
    justifyContent: 'center',
    width: 106,
  },
  buildingCopy: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  titleCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  buildingName: {
    color: gameColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  effectText: {
    color: gameColors.muted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  badgeStack: {
    alignItems: 'flex-end',
    gap: 5,
  },
  levelBadge: {
    backgroundColor: '#F8E0AC',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 7,
    borderWidth: 1,
    color: gameColors.ink,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    minWidth: 50,
    paddingHorizontal: 6,
    paddingVertical: 3,
    textAlign: 'center',
  },
  stageBadge: {
    color: gameColors.greenDark,
    fontSize: 10,
    fontWeight: '900',
  },
  upgradeRow: {
    alignItems: 'center',
    backgroundColor: '#F9E3BA',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    padding: 7,
  },
  costBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  costLabel: {
    color: gameColors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  upgradeButton: {
    minHeight: 36,
    minWidth: 92,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
});
