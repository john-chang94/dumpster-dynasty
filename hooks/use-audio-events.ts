import { useCallback, useEffect } from 'react';

import { AudioEventId } from '@/constants/game';
import { useGame } from '@/state/game-store';

export type MusicTrackId = 'base' | 'scavenge' | 'reward';

export function useAudioEvent() {
  const { state } = useGame();

  return useCallback(
    (eventId: AudioEventId) => {
      if (!state.audioSettings.sfxEnabled || state.audioSettings.sfxVolume <= 0) {
        return;
      }

      void eventId;
    },
    [state.audioSettings.sfxEnabled, state.audioSettings.sfxVolume],
  );
}

export function useMusicTrack(trackId: MusicTrackId) {
  const { state } = useGame();

  useEffect(() => {
    if (!state.audioSettings.musicEnabled || state.audioSettings.musicVolume <= 0) {
      return;
    }

    void trackId;
  }, [state.audioSettings.musicEnabled, state.audioSettings.musicVolume, trackId]);
}
