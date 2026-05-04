import { useFocusEffect } from "@react-navigation/native";
import { useAudioPlayer, type AudioPlayer } from "expo-audio";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MUSIC_TRACK_MODULES,
  type MusicTrackId,
} from "@/constants/audio-sources";
import { useGame } from "@/state/game-store";

/** Crossfade when switching beds (milliseconds). first launch uses 0 ms. */
export const MUSIC_CROSSFADE_MS = 800;

type MusicSessionValue = {
  setTrackId: (id: MusicTrackId) => void;
};

const MusicSessionContext = createContext<MusicSessionValue | null>(null);

/** Must render inside GameProvider */
export function MusicSessionProvider({ children }: PropsWithChildren) {
  const [trackId, setTrackId] = useState<MusicTrackId>("home");
  const value = useMemo(() => ({ setTrackId }), []);

  return (
    <MusicSessionContext.Provider value={value}>
      <CrossfadeMusicPlayback trackId={trackId} />
      {children}
    </MusicSessionContext.Provider>
  );
}

/** Pick a looping bed while this screen is focused — other tabs set theirs on focus. */
export function useMusicTrack(trackId: MusicTrackId) {
  const ctx = useContext(MusicSessionContext);

  if (!ctx) {
    throw new Error("useMusicTrack requires MusicSessionProvider.");
  }

  const { setTrackId } = ctx;

  useFocusEffect(
    useCallback(() => {
      setTrackId(trackId);
    }, [setTrackId, trackId]),
  );
}

function CrossfadeMusicPlayback({ trackId }: { trackId: MusicTrackId }) {
  const { state } = useGame();
  const homePlayer = useAudioPlayer(MUSIC_TRACK_MODULES.home);
  const activePlayer = useAudioPlayer(MUSIC_TRACK_MODULES.activeScavenge);
  const rafRef = useRef<number | undefined>(undefined);
  const prevTrackRef = useRef<MusicTrackId | null>(null);

  useEffect(() => {
    const cancelFade = () => {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
    };

    cancelFade();

    const enabled =
      state.audioSettings.musicEnabled && state.audioSettings.musicVolume > 0;
    const master = state.audioSettings.musicVolume;

    homePlayer.loop = true;
    activePlayer.loop = true;

    if (!enabled) {
      homePlayer.pause();
      activePlayer.pause();
      homePlayer.volume = 0;
      activePlayer.volume = 0;
      prevTrackRef.current = trackId;

      return cancelFade;
    }

    const wasInitial = prevTrackRef.current === null;
    const sameBed = prevTrackRef.current === trackId;

    if (sameBed && !wasInitial) {
      syncSteadyState(homePlayer, activePlayer, trackId, master);

      return cancelFade;
    }

    const fadeMs = wasInitial ? 0 : MUSIC_CROSSFADE_MS;

    prevTrackRef.current = trackId;

    const destHome = trackId === "home" ? master : 0;
    const destActive = trackId === "activeScavenge" ? master : 0;

    const v0Home = homePlayer.volume;
    const v0Active = activePlayer.volume;

    if (fadeMs <= 0) {
      syncSteadyState(homePlayer, activePlayer, trackId, master);

      return cancelFade;
    }

    if (destHome > v0Home) {
      homePlayer.play();
    }

    if (destActive > v0Active) {
      activePlayer.play();
    }

    const startedAt = performance.now();

    const step = () => {
      const elapsed = performance.now() - startedAt;
      const t = Math.min(1, elapsed / fadeMs);
      const u = easeInOutQuad(t);

      homePlayer.volume = v0Home + (destHome - v0Home) * u;
      activePlayer.volume = v0Active + (destActive - v0Active) * u;

      if (homePlayer.volume > 0 && !homePlayer.playing) {
        homePlayer.play();
      }

      if (activePlayer.volume > 0 && !activePlayer.playing) {
        activePlayer.play();
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);

        return;
      }

      rafRef.current = undefined;
      syncSteadyState(homePlayer, activePlayer, trackId, master);
    };

    rafRef.current = requestAnimationFrame(step);

    return cancelFade;
  }, [
    activePlayer,
    homePlayer,
    trackId,
    state.audioSettings.musicEnabled,
    state.audioSettings.musicVolume,
  ]);

  return null;
}

function syncSteadyState(
  homePlayer: AudioPlayer,
  activePlayer: AudioPlayer,
  trackId: MusicTrackId,
  master: number,
) {
  if (trackId === "home") {
    homePlayer.volume = master;
    activePlayer.volume = 0;
    activePlayer.pause();

    if (master > 0) {
      homePlayer.play();
    } else {
      homePlayer.pause();
    }
  } else {
    activePlayer.volume = master;
    homePlayer.volume = 0;
    homePlayer.pause();

    if (master > 0) {
      activePlayer.play();
    } else {
      activePlayer.pause();
    }
  }
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}
