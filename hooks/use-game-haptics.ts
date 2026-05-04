import * as Haptics from 'expo-haptics';

import { useGame } from '@/state/game-store';

export function useGameHaptics() {
  const {
    state: {
      audioSettings: { hapticsEnabled },
    },
  } = useGame();

  const safe = async (fn: () => Promise<void>) => {
    if (!hapticsEnabled) {
      return;
    }

    try {
      await fn();
    } catch {
      // Simulator or restrictive devices skip.
    }
  };

  return {
    lightImpact: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
    mediumImpact: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
    successNotify: () => safe(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ),
    warnNotify: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  };
}
