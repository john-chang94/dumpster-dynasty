/**
 * Lazy assets: modules map to Metro `require` ids.
 */

import type { AudioEventId } from '@/constants/game';

export type MusicTrackId = 'home' | 'activeScavenge';

export const GAME_SFX_MODULES: Partial<Record<AudioEventId, number>> = {};

export const MUSIC_TRACK_MODULES: Record<MusicTrackId, number> = {
  home: require('../assets/audio/music_home_day.mp3'),
  activeScavenge: require('../assets/audio/music_active_scavenge.mp3'),
};
