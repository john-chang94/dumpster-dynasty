import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatResources, RESOURCE_CONFIG, RESOURCE_KEYS, ResourceBundle, ResourceCost } from '@/constants/game';
import { useGame } from '@/state/game-store';

export const gameColors = {
  ink: '#2D2118',
  muted: '#715C47',
  page: '#F8E8CA',
  pageDeep: '#E7C38E',
  panel: '#FFF4DC',
  panelStrong: '#F4D29D',
  border: '#8D5D2D',
  borderDark: '#543419',
  green: '#638B2C',
  greenDark: '#3D5F18',
  orange: '#D97823',
  orangeDark: '#92420D',
  blue: '#267FAE',
  shadow: 'rgba(69, 42, 18, 0.16)',
};

type GameScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  scroll?: boolean;
  footer?: ReactNode;
}>;

export function GameScreen({ title, subtitle, scroll = true, footer, children }: GameScreenProps) {
  const { loaded } = useGame();
  const content = (
    <>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.gameLabel}>Dumpster Dynasty</Text>
          <Text style={styles.screenTitle}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <ResourceBar />
      </View>
      {!loaded ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={gameColors.greenDark} />
          <Text style={styles.loadingText}>Loading local save</Text>
        </View>
      ) : scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.fixedContent}>{children}</View>
      )}
      {footer}
    </>
  );

  return <SafeAreaView style={styles.screen}>{content}</SafeAreaView>;
}

export function ResourceBar() {
  const { state } = useGame();

  return (
    <View style={styles.resourceBar}>
      {RESOURCE_KEYS.map((key) => (
        <View key={key} style={[styles.resourcePill, { backgroundColor: RESOURCE_CONFIG[key].background }]}>
          <MaterialCommunityIcons name={RESOURCE_CONFIG[key].icon} size={17} color={RESOURCE_CONFIG[key].color} />
          <Text style={styles.resourceValue}>{state.resources[key]}</Text>
        </View>
      ))}
    </View>
  );
}

export function MessageBanner() {
  const { state, clearMessage } = useGame();

  if (!state.lastMessage) {
    return null;
  }

  return (
    <Pressable onPress={clearMessage} style={styles.messageBanner}>
      <MaterialCommunityIcons name="paw" size={18} color={gameColors.orangeDark} />
      <Text style={styles.messageText}>{state.lastMessage}</Text>
    </Pressable>
  );
}

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ style, children }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

type ActionButtonProps = PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'secondary' | 'plain' | 'danger';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}>;

export function ActionButton({
  onPress,
  disabled,
  tone = 'primary',
  icon,
  style,
  children,
}: ActionButtonProps) {
  const buttonStyle = [
    styles.actionButton,
    tone === 'primary' && styles.primaryButton,
    tone === 'secondary' && styles.secondaryButton,
    tone === 'plain' && styles.plainButton,
    tone === 'danger' && styles.dangerButton,
    disabled && styles.disabledButton,
    style,
  ];
  const textStyle = [
    styles.actionButtonText,
    tone === 'plain' && styles.plainButtonText,
    disabled && styles.disabledButtonText,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [buttonStyle, pressed && !disabled && styles.pressedButton]}>
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={tone === 'plain' || disabled ? gameColors.muted : '#FFF9E9'}
        />
      ) : null}
      <Text style={textStyle}>{children}</Text>
    </Pressable>
  );
}

export function CostRow({ cost, resources }: { cost: ResourceCost | null; resources?: ResourceBundle }) {
  if (!cost) {
    return <Text style={styles.costText}>Max level</Text>;
  }

  return (
    <View style={styles.costRow}>
      {RESOURCE_KEYS.filter((key) => (cost[key] ?? 0) > 0).map((key) => {
        const affordable = resources ? resources[key] >= (cost[key] ?? 0) : true;

        return (
          <View key={key} style={[styles.costPill, !affordable && styles.costPillMissing]}>
            <MaterialCommunityIcons name={RESOURCE_CONFIG[key].icon} size={14} color={RESOURCE_CONFIG[key].color} />
            <Text style={[styles.costText, !affordable && styles.costTextMissing]}>{cost[key]}</Text>
          </View>
        );
      })}
      {formatResources(cost) === 'Free' ? <Text style={styles.costText}>Free</Text> : null}
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const clampedValue = Math.max(0, Math.min(1, value));

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clampedValue * 100}%` }]} />
    </View>
  );
}

export function StatLine({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statLine}>
      <MaterialCommunityIcons name={icon} size={16} color={gameColors.greenDark} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: gameColors.page,
  },
  header: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 6,
  },
  titleBlock: {
    gap: 2,
  },
  gameLabel: {
    color: gameColors.greenDark,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  screenTitle: {
    color: gameColors.ink,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: gameColors.muted,
    fontSize: 14,
    lineHeight: 19,
  },
  resourceBar: {
    flexDirection: 'row',
    gap: 7,
  },
  resourcePill: {
    alignItems: 'center',
    borderColor: 'rgba(84, 52, 25, 0.25)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: 8,
  },
  resourceValue: {
    color: gameColors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  fixedContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingState: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  loadingText: {
    color: gameColors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  messageBanner: {
    alignItems: 'center',
    backgroundColor: '#FFE8B8',
    borderColor: '#C78331',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageText: {
    color: gameColors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  card: {
    backgroundColor: gameColors.panel,
    borderColor: 'rgba(84, 52, 25, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: gameColors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButton: {
    backgroundColor: gameColors.orange,
    borderColor: gameColors.orangeDark,
    borderWidth: 1,
  },
  secondaryButton: {
    backgroundColor: gameColors.green,
    borderColor: gameColors.greenDark,
    borderWidth: 1,
  },
  plainButton: {
    backgroundColor: '#F8E3B8',
    borderColor: 'rgba(84, 52, 25, 0.25)',
    borderWidth: 1,
  },
  dangerButton: {
    backgroundColor: '#B84A34',
    borderColor: '#71301F',
    borderWidth: 1,
  },
  pressedButton: {
    opacity: 0.78,
    transform: [{ translateY: 1 }],
  },
  disabledButton: {
    backgroundColor: '#D7C4A2',
    borderColor: '#B7A17E',
  },
  actionButtonText: {
    color: '#FFF9E9',
    fontSize: 14,
    fontWeight: '900',
  },
  plainButtonText: {
    color: gameColors.ink,
  },
  disabledButtonText: {
    color: gameColors.muted,
  },
  costRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  costPill: {
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  costPillMissing: {
    backgroundColor: '#F1D6D1',
    borderColor: '#C88D82',
  },
  costText: {
    color: gameColors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  costTextMissing: {
    color: '#8F3427',
  },
  progressTrack: {
    backgroundColor: '#D6B67E',
    borderColor: 'rgba(84, 52, 25, 0.18)',
    borderRadius: 999,
    borderWidth: 1,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: gameColors.green,
    borderRadius: 999,
    height: '100%',
  },
  statLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  statLabel: {
    color: gameColors.muted,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  statValue: {
    color: gameColors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
});
