import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { GameRewardEffectsLayer } from '@/components/game/game-reward-effects';
import { MusicSessionProvider } from '@/components/game/music-session';
import { GameToastHost } from '@/components/game/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GameProvider } from '@/state/game-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GameProvider>
        <MusicSessionProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Dumpster Notes' }} />
          </Stack>
          <GameRewardEffectsLayer />
          <GameToastHost />
          <StatusBar style="dark" />
        </MusicSessionProvider>
      </GameProvider>
    </ThemeProvider>
  );
}
