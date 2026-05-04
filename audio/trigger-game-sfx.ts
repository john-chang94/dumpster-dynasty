import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import type { AudioEventId } from '@/constants/game';

const sfxCache = new Map<string, AudioPlayer>();

export function disposeGameSfx() {
  for (const player of sfxCache.values()) {
    player.remove();
  }

  sfxCache.clear();
}

/** Replays overlapping SFX with a pooled player keyed by `${event}:${sourceIdentity}`. */
export function triggerGameSfx(
  sources: Partial<Record<AudioEventId, number>>,
  eventId: AudioEventId,
  volumeMultiplier: number,
) {
  const mod = sources[eventId];

  if (typeof mod !== 'number') {
    return;
  }

  const key = `${eventId}:${mod}`;
  let player = sfxCache.get(key);

  if (!player) {
    player = createAudioPlayer(mod);

    sfxCache.set(key, player);
  }

  player.volume = Math.min(1, Math.max(0, volumeMultiplier));
  player.pause();
  void player.seekTo(0).finally(() => {
    player.play();
  });
}
