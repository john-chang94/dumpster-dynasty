import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { RaccoonSketch } from '@/components/game/skia-placeholders';
import { ActionButton, Card, GameScreen, gameColors, MessageBanner, SectionTitle, StatLine } from '@/components/game/ui';
import { useGame } from '@/state/game-store';

export default function ShopScreen() {
  const { state } = useGame();

  return (
    <GameScreen title="Shop" subtitle="A light monetization shell with dynamic text and no purchases wired yet.">
      <MessageBanner />

      <Card style={styles.offerHero}>
        <View style={styles.offerCopy}>
          <Text style={styles.offerKicker}>Foundation Only</Text>
          <Text style={styles.offerTitle}>Starter Trash Pack</Text>
          <Text style={styles.offerBody}>This card reserves the offer layout without baking prices or reward numbers into art.</Text>
          <View style={styles.rewardRow}>
            <OfferReward icon="food-apple" label="Food" />
            <OfferReward icon="cog" label="Scrap" />
            <OfferReward icon="diamond-stone" label="Shinies" />
          </View>
        </View>
        <RaccoonSketch raccoonId="sneak" size={88} locked={!state.raccoons.sneak.unlocked} />
      </Card>

      <Card style={styles.statusCard}>
        <SectionTitle title="Player Snapshot" />
        <StatLine icon="package-variant" label="Runs claimed" value={`${state.totalRunsClaimed}`} />
        <StatLine icon="account-group" label="Crew recruited" value={`${Object.values(state.raccoons).filter((raccoon) => raccoon.unlocked).length} / 4`} />
        <StatLine icon="treasure-chest" label="Loot entries" value={`${state.discoveredLoot.length}`} />
      </Card>

      <View style={styles.offerGrid}>
        <OfferCard title="Remove Ads" body="Reserved for a future entitlement. No forced ads are part of the prototype." icon="cancel" />
        <OfferCard title="Shiny Pouch" body="Premium-feeling currency can be earned in runs before IAP is added." icon="diamond-stone" />
        <OfferCard title="Skin Pack" body="Future cosmetics should change visuals without affecting core balance." icon="hanger" />
        <OfferCard title="Reward Boost" body="A later rewarded-ad hook can double offline rewards by player choice." icon="play-circle" />
      </View>
    </GameScreen>
  );
}

function OfferReward({ icon, label }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }) {
  return (
    <View style={styles.rewardPill}>
      <MaterialCommunityIcons name={icon} size={16} color={gameColors.orangeDark} />
      <Text style={styles.rewardText}>{label}</Text>
    </View>
  );
}

function OfferCard({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <Card style={styles.offerCard}>
      <View style={styles.offerIcon}>
        <MaterialCommunityIcons name={icon} size={24} color="#FFF8E8" />
      </View>
      <Text style={styles.smallOfferTitle}>{title}</Text>
      <Text style={styles.offerBody}>{body}</Text>
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
    color: '#715C47',
    fontSize: 12,
    fontWeight: '700',
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
    gap: 8,
    minHeight: 190,
    width: '48%',
  },
  offerIcon: {
    alignItems: 'center',
    backgroundColor: gameColors.orange,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  smallOfferTitle: {
    color: gameColors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  lockedButton: {
    marginTop: 'auto',
  },
});
