import { useCallback } from 'react';

import { triggerGameSfx } from '@/audio/trigger-game-sfx';
import { useMusicTrack } from '@/components/game/music-session';
import { GAME_SFX_MODULES, type MusicTrackId } from '@/constants/audio-sources';
import type { AudioEventId } from '@/constants/game';
import { useGame } from '@/state/game-store';

export type { MusicTrackId };
export { useMusicTrack };

export function useAudioEvent() {
  const {
    state: {
      audioSettings: { sfxEnabled, sfxVolume },
    },
  } = useGame();

  return useCallback(
    (eventId: AudioEventId) => {
      if (!sfxEnabled || sfxVolume <= 0) {
        return;
      }

      triggerGameSfx(GAME_SFX_MODULES, eventId, sfxVolume);
    },
    [sfxEnabled, sfxVolume],
  );
}
