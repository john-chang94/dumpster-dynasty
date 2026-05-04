import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { resourceIconSources } from '@/components/game/asset-sources';
import { RaccoonArt } from '@/components/game/art';
import { ActionButton, Card, GameScreen, gameColors, SectionTitle, StatLine } from '@/components/game/ui';
import { RESOURCE_CONFIG, RESOURCE_KEYS, ResourceKey } from '@/constants/game';
import { useMusicTrack } from '@/hooks/use-audio-events';
import { useGame } from '@/state/game-store';

export default function ShopScreen() {
  const { state } = useGame();
  useMusicTrack('home');
  const recruitedCount = Object.values(state.raccoons).filter((raccoon) => raccoon.unlocked).length;

  return (
    <GameScreen title="Shop" subtitle="A prototype monetization shell with no purchases wired yet.">
      <Card style={styles.offerHero}>
        <View style={styles.offerCopy}>
          <Text style={styles.offerKicker}>Starter Bundle</Text>
          <Text style={styles.offerTitle}>Starter Trash Pack</Text>
          <Text style={styles.offerBody}>Reserved for a future offer, keeping prices and rewards out of hard-coded art.</Text>
          <View style={styles.rewardRow}>
            {RESOURCE_KEYS.map((key) => (
              <OfferReward key={key} resourceKey={key} />
            ))}
          </View>
        </View>
        <RaccoonArt raccoonId="sneak" size={94} locked={!state.raccoons.sneak.unlocked} />
      </Card>

      <Card style={styles.statusCard}>
        <SectionTitle title="Player Snapshot" />
        <StatLine icon="package-variant" label="Runs claimed" value={`${state.totalRunsClaimed}`} />
        <StatLine icon="account-group" label="Crew recruited" value={`${recruitedCount} / 4`} />
        <StatLine icon="treasure-chest" label="Loot entries" value={`${state.discoveredLoot.length}`} />
      </Card>

      <View style={styles.offerGrid}>
        <OfferCard title="Remove Ads" body="Reserved for a future entitlement. No forced ads are part of the prototype." icon="cancel" tone="blue" />
        <OfferCard title="Skin Pack" body="Cosmetics should change visuals without affecting core balance." icon="hanger" tone="purple" />
        <OfferCard title="Shiny Pouch" body="Premium-feeling currency can be earned in runs before IAP is added." icon="diamond-stone" tone="purple" />
        <OfferCard title="Reward Boost" body="A later rewarded-ad hook can double offline rewards by player choice." icon="play-circle" tone="green" />
      </View>
    </GameScreen>
  );
}

function OfferReward({ resourceKey }: { resourceKey: ResourceKey }) {
  return (
    <View style={styles.rewardPill}>
      <Image
        accessibilityIgnoresInvertColors
        contentFit="contain"
        source={resourceIconSources[resourceKey]}
        style={styles.rewardIcon}
      />
      <Text style={styles.rewardText}>{RESOURCE_CONFIG[resourceKey].shortLabel}</Text>
    </View>
  );
}

function OfferCard({
  title,
  body,
  icon,
  tone,
}: {
  title: string;
  body: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone: 'blue' | 'purple' | 'green';
}) {
  return (
    <Card style={[styles.offerCard, styles[tone]]}>
      <View style={styles.offerIconRow}>
        <MaterialCommunityIcons name={icon} size={24} color="#FFF8E8" />
        <Text style={styles.smallOfferTitle}>{title}</Text>
      </View>
      <Text style={styles.offerCardBody}>{body}</Text>
      <ActionButton disabled icon="lock" tone="plain" style={styles.lockedButton}>
        Later
      </ActionButton>
    </Card>
  );
}

const styles = StyleSheet.create({
  offerHero: {
    alignItems: 'center',
    backgroundColor: '#3F2B47',
    borderColor: '#7D5A8E',
    flexDirection: 'row',
    gap: 12,
  },
  offerCopy: {
    flex: 1,
    gap: 7,
  },
  offerKicker: {
    color: '#F9CC63',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  offerTitle: {
    color: '#FFF8E8',
    fontSize: 22,
    fontWeight: '900',
  },
  offerBody: {
    color: '#EBD7B7',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rewardPill: {
    alignItems: 'center',
    backgroundColor: '#FFF1CF',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  rewardIcon: {
    height: 17,
    width: 17,
  },
  rewardText: {
    color: gameColors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  statusCard: {
    gap: 8,
  },
  offerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  offerCard: {
    borderColor: 'rgba(255, 244, 220, 0.25)',
    gap: 9,
    minHeight: 178,
    width: '48%',
  },
  blue: {
    backgroundColor: '#2F6F9A',
  },
  purple: {
    backgroundColor: '#67417E',
  },
  green: {
    backgroundColor: '#4F7625',
  },
  offerIconRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  smallOfferTitle: {
    color: '#FFF8E8',
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
  },
  offerCardBody: {
    color: '#FFF1D7',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  lockedButton: {
    marginTop: 'auto',
  },
});
