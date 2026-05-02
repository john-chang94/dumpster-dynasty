import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AssetSource,
  resourceIconSources,
} from "@/components/game/asset-sources";
import {
  formatResources,
  RESOURCE_CONFIG,
  RESOURCE_KEYS,
  ResourceBundle,
  ResourceCost,
} from "@/constants/game";
import { type MessageScope, useGame } from "@/state/game-store";

export const gameColors = {
  ink: "#2D2118",
  muted: "#715C47",
  page: "#F8E8CA",
  pageDeep: "#E7C38E",
  panel: "#FFF4DC",
  panelStrong: "#F4D29D",
  border: "#8D5D2D",
  borderDark: "#543419",
  green: "#638B2C",
  greenDark: "#3D5F18",
  orange: "#D97823",
  orangeDark: "#92420D",
  blue: "#267FAE",
  shadow: "rgba(69, 42, 18, 0.16)",
};

type SceneScreenProps = PropsWithChildren<{
  background: AssetSource;
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  compactHud?: boolean;
}>;

type GameScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function GameScreen({ title, subtitle, children }: GameScreenProps) {
  const { loaded } = useGame();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            numberOfLines={1}
            style={styles.screenTitle}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={2} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <ResourceBar />
      </View>
      {!loaded ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={gameColors.greenDark} />
          <Text style={styles.loadingText}>Loading local save</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export function SceneScreen({
  background,
  title,
  subtitle,
  rightAction,
  compactHud = false,
  children,
}: SceneScreenProps) {
  const { loaded } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <View style={styles.sceneScreen}>
      <Image
        accessibilityIgnoresInvertColors
        contentFit="cover"
        source={background}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.sceneShade} />
      <SafeAreaView edges={["top"]} style={styles.sceneSafe}>
        <View style={[styles.sceneHud, compactHud && styles.sceneHudCompact]}>
          <View
            style={[
              styles.sceneTitlePill,
              compactHud && styles.sceneTitlePillCompact,
            ]}
          >
            <Text style={styles.sceneTitle}>{title}</Text>
            {subtitle ? (
              <Text style={styles.sceneSubtitle}>{subtitle}</Text>
            ) : null}
          </View>
          <View style={styles.sceneHudRight}>
            {rightAction ?? (
              <IconButton
                accessibilityLabel="Settings"
                icon="cog"
                onPress={() => setSettingsOpen(true)}
              />
            )}
          </View>
        </View>
        {compactHud ? null : <ResourceBar compact />}
        {!loaded ? (
          <View style={styles.sceneLoadingState}>
            <ActivityIndicator color="#FFF9E9" />
            <Text style={styles.sceneLoadingText}>Loading local save</Text>
          </View>
        ) : (
          <View style={styles.sceneContent}>{children}</View>
        )}
      </SafeAreaView>
      <SettingsMenu
        onClose={() => setSettingsOpen(false)}
        visible={settingsOpen}
      />
    </View>
  );
}

export function ResourceBar({ compact = false }: { compact?: boolean }) {
  const { state } = useGame();

  return (
    <View style={[styles.resourceBar, compact && styles.resourceBarCompact]}>
      {RESOURCE_KEYS.map((key) => (
        <View
          key={key}
          style={[
            styles.resourcePill,
            compact && styles.resourcePillCompact,
            { backgroundColor: RESOURCE_CONFIG[key].background },
          ]}
        >
          <Image
            accessibilityIgnoresInvertColors
            contentFit="contain"
            source={resourceIconSources[key]}
            style={[styles.resourceIcon, compact && styles.resourceIconCompact]}
          />
          <Text
            style={[
              styles.resourceValue,
              compact && styles.resourceValueCompact,
            ]}
          >
            {state.resources[key]}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function OverlayPanel({ style, children }: CardProps) {
  return <View style={[styles.overlayPanel, style]}>{children}</View>;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  disabled = false,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && !disabled && styles.pressedButton,
        disabled && styles.disabledButton,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={21}
        color={disabled ? gameColors.muted : "#FFF9E9"}
      />
    </Pressable>
  );
}

export function ResourceAmount({
  resourceKey,
  amount,
}: {
  resourceKey: keyof ResourceBundle;
  amount: number;
}) {
  return (
    <View style={styles.rewardResourcePill}>
      <Image
        accessibilityIgnoresInvertColors
        contentFit="contain"
        source={resourceIconSources[resourceKey]}
        style={styles.costIcon}
      />
      <Text style={styles.costText}>{amount}</Text>
    </View>
  );
}

export function MessageBanner({ scope: _scope }: { scope: MessageScope }) {
  return null;
}

export function GameToastHost() {
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <SafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        style={styles.toastSafeArea}
      >
        <MessageToast />
      </SafeAreaView>
    </View>
  );
}

function MessageToast() {
  const router = useRouter();
  const { state, clearMessage } = useGame();
  const translateY = useRef(new Animated.Value(-86)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const visibleScopeRef = useRef<MessageScope | undefined>(undefined);
  const [visibleMessage, setVisibleMessage] = useState<string | undefined>();
  const activeMessage = state.lastMessage;

  const dismissToast = useCallback(
    (redirect = false) => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -86,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          const targetScope = visibleScopeRef.current;
          setVisibleMessage(undefined);
          visibleScopeRef.current = undefined;
          clearMessage();
          if (redirect && targetScope) {
            router.navigate(getRouteForMessageScope(targetScope));
          }
        }
      });
    },
    [clearMessage, opacity, router, translateY],
  );

  useEffect(() => {
    if (!activeMessage) {
      return;
    }

    setVisibleMessage(activeMessage);
    visibleScopeRef.current = state.lastMessageScope;
    translateY.setValue(-86);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        mass: 0.8,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(dismissToast, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    activeMessage,
    dismissToast,
    opacity,
    state.lastMessageScope,
    translateY,
  ]);

  if (!visibleMessage) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.toastHost,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        onPress={() => dismissToast(true)}
        style={styles.messageBanner}
      >
        <MaterialCommunityIcons
          name="paw"
          size={18}
          color={gameColors.orangeDark}
        />
        <Text style={styles.messageText}>{visibleMessage}</Text>
      </Pressable>
    </Animated.View>
  );
}

function getRouteForMessageScope(scope: MessageScope) {
  switch (scope) {
    case "base":
      return "/";
    case "build":
      return "/build";
    case "collection":
      return "/collection";
    case "scavenge":
      return "/scavenge";
    case "shop":
      return "/shop";
  }
}

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ style, children }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
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
  tone?: "primary" | "secondary" | "plain" | "danger";
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}>;

export function ActionButton({
  onPress,
  disabled,
  tone = "primary",
  icon,
  style,
  children,
}: ActionButtonProps) {
  const buttonStyle = [
    styles.actionButton,
    tone === "primary" && styles.primaryButton,
    tone === "secondary" && styles.secondaryButton,
    tone === "plain" && styles.plainButton,
    tone === "danger" && styles.dangerButton,
    disabled && styles.disabledButton,
    style,
  ];
  const textStyle = [
    styles.actionButtonText,
    tone === "plain" && styles.plainButtonText,
    disabled && styles.disabledButtonText,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        buttonStyle,
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={tone === "plain" || disabled ? gameColors.muted : "#FFF9E9"}
        />
      ) : null}
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        numberOfLines={1}
        style={textStyle}
      >
        {children}
      </Text>
    </Pressable>
  );
}

function SettingsMenu({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { resetLocalSave } = useGame();

  const handleReset = () => {
    onClose();
    resetLocalSave();
    router.replace("/");
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.settingsBackdrop}>
        <View style={styles.settingsPanel}>
          <View style={styles.settingsHeader}>
            <View style={styles.settingsTitleBlock}>
              <Text style={styles.settingsTitle}>Settings</Text>
              <Text style={styles.settingsSubtitle}>Testing tools</Text>
            </View>
            <IconButton
              accessibilityLabel="Close settings"
              icon="close"
              onPress={onClose}
            />
          </View>

          <Text style={styles.settingsBody}>
            Reset clears this device save and starts the prototype from the
            beginning.
          </Text>

          <View style={styles.settingsActions}>
            <ActionButton
              icon="trash-can-outline"
              onPress={handleReset}
              style={styles.settingsAction}
              tone="danger"
            >
              Reset Save
            </ActionButton>
            <ActionButton
              icon="close"
              onPress={onClose}
              style={styles.settingsAction}
              tone="plain"
            >
              Close
            </ActionButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function CostRow({
  cost,
  resources,
}: {
  cost: ResourceCost | null;
  resources?: ResourceBundle;
}) {
  if (!cost) {
    return <Text style={styles.costText}>Max level</Text>;
  }

  return (
    <View style={styles.costRow}>
      {RESOURCE_KEYS.filter((key) => (cost[key] ?? 0) > 0).map((key) => {
        const affordable = resources
          ? resources[key] >= (cost[key] ?? 0)
          : true;

        return (
          <View
            key={key}
            style={[styles.costPill, !affordable && styles.costPillMissing]}
          >
            <Image
              accessibilityIgnoresInvertColors
              contentFit="contain"
              source={resourceIconSources[key]}
              style={styles.costIcon}
            />
            <Text
              style={[styles.costText, !affordable && styles.costTextMissing]}
            >
              {cost[key]}
            </Text>
          </View>
        );
      })}
      {formatResources(cost) === "Free" ? (
        <Text style={styles.costText}>Free</Text>
      ) : null}
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const clampedValue = Math.max(0, Math.min(1, value));

  return (
    <View style={styles.progressTrack}>
      <View
        style={[styles.progressFill, { width: `${clampedValue * 100}%` }]}
      />
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
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={gameColors.greenDark}
      />
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
  sceneScreen: {
    backgroundColor: gameColors.ink,
    flex: 1,
  },
  sceneShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28, 18, 9, 0.18)",
  },
  sceneSafe: {
    flex: 1,
    paddingHorizontal: 12,
  },
  sceneHud: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    paddingTop: 6,
  },
  sceneHudCompact: {
    paddingTop: 4,
  },
  sceneTitlePill: {
    backgroundColor: "rgba(255, 244, 220, 0.92)",
    borderColor: "rgba(84, 52, 25, 0.3)",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  sceneTitlePillCompact: {
    flex: 0,
    minWidth: 170,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  sceneTitle: {
    color: gameColors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  sceneSubtitle: {
    color: gameColors.muted,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 14,
  },
  sceneHudRight: {
    gap: 8,
  },
  sceneContent: {
    flex: 1,
    position: "relative",
  },
  sceneLoadingState: {
    alignItems: "center",
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },
  sceneLoadingText: {
    color: "#FFF9E9",
    fontSize: 14,
    fontWeight: "900",
  },
  header: {
    gap: 9,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 6,
  },
  titleBlock: {
    gap: 2,
  },
  screenTitle: {
    color: gameColors.ink,
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    color: gameColors.muted,
    fontSize: 14,
    lineHeight: 19,
  },
  resourceBar: {
    flexDirection: "row",
    gap: 7,
  },
  resourceBarCompact: {
    gap: 6,
    paddingTop: 8,
  },
  resourcePill: {
    alignItems: "center",
    borderColor: "rgba(84, 52, 25, 0.25)",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 8,
  },
  resourcePillCompact: {
    backgroundColor: "rgba(255, 244, 220, 0.94)",
    borderColor: "rgba(84, 52, 25, 0.34)",
    minHeight: 31,
    paddingHorizontal: 7,
  },
  resourceIcon: {
    height: 20,
    width: 20,
  },
  resourceIconCompact: {
    height: 18,
    width: 18,
  },
  resourceValue: {
    color: gameColors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  resourceValueCompact: {
    fontSize: 13,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  fixedContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingState: {
    alignItems: "center",
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },
  loadingText: {
    color: gameColors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  messageBanner: {
    alignItems: "center",
    backgroundColor: "#FFE8B8",
    borderColor: "#C78331",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  toastHost: {
    left: 16,
    position: "absolute",
    right: 16,
    top: 60,
    zIndex: 50,
  },
  toastSafeArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  messageText: {
    color: gameColors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 16,
  },
  settingsBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(31, 19, 9, 0.45)",
    flex: 1,
    justifyContent: "center",
    padding: 18,
  },
  settingsPanel: {
    backgroundColor: gameColors.panel,
    borderColor: "rgba(84, 52, 25, 0.34)",
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 14,
    shadowColor: "#2D2118",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    width: "100%",
  },
  settingsHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  settingsTitleBlock: {
    flex: 1,
    gap: 2,
  },
  settingsTitle: {
    color: gameColors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  settingsSubtitle: {
    color: gameColors.greenDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  settingsBody: {
    color: gameColors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  settingsActions: {
    flexDirection: "row",
    gap: 10,
  },
  settingsAction: {
    flex: 1,
  },
  card: {
    backgroundColor: gameColors.panel,
    borderColor: "rgba(84, 52, 25, 0.24)",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  overlayPanel: {
    backgroundColor: "rgba(255, 244, 220, 0.94)",
    borderColor: "rgba(84, 52, 25, 0.36)",
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#2D2118",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    padding: 12,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: gameColors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
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
    backgroundColor: "#F8E3B8",
    borderColor: "rgba(84, 52, 25, 0.25)",
    borderWidth: 1,
  },
  dangerButton: {
    backgroundColor: "#B84A34",
    borderColor: "#71301F",
    borderWidth: 1,
  },
  pressedButton: {
    opacity: 0.78,
    transform: [{ translateY: 1 }],
  },
  disabledButton: {
    backgroundColor: "#D7C4A2",
    borderColor: "#B7A17E",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(59, 38, 20, 0.86)",
    borderColor: "rgba(255, 244, 220, 0.28)",
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  actionButtonText: {
    color: "#FFF9E9",
    fontSize: 14,
    fontWeight: "900",
  },
  plainButtonText: {
    color: gameColors.ink,
  },
  disabledButtonText: {
    color: gameColors.muted,
  },
  costRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  costPill: {
    alignItems: "center",
    backgroundColor: "#FFF7E8",
    borderColor: "rgba(84, 52, 25, 0.18)",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  rewardResourcePill: {
    alignItems: "center",
    backgroundColor: "#FFF7E8",
    borderColor: "rgba(84, 52, 25, 0.18)",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  costIcon: {
    height: 16,
    width: 16,
  },
  costPillMissing: {
    backgroundColor: "#F1D6D1",
    borderColor: "#C88D82",
  },
  costText: {
    color: gameColors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  costTextMissing: {
    color: "#8F3427",
  },
  progressTrack: {
    backgroundColor: "#D6B67E",
    borderColor: "rgba(84, 52, 25, 0.18)",
    borderRadius: 999,
    borderWidth: 1,
    height: 10,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: gameColors.green,
    borderRadius: 999,
    height: "100%",
  },
  statLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  statLabel: {
    color: gameColors.muted,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  statValue: {
    color: gameColors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
});
