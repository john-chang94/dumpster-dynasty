import type { BuildingId, RaccoonId } from '@/constants/game';

/**
 * Normalized coords (0–1) inside the safe playfield band so buildings and raccoons
 * stay visible above the bottom HUD. (0,0) ≈ upper-left of the band, (1,1) ≈ lower-right.
 * Larger `ny` sits lower on screen — in the Day Camp art that’s the dirt yard (avoid the fence band).
 */
export const BASE_PLAYFIELD = {
  xMin: 0.05,
  xMax: 0.95,
  yMin: 0.1,
  yMax: 0.86,
} as const;

export type PlayfieldPoint = { nx: number; ny: number };

export function playfieldToPercent(nx: number, ny: number): { left: `${number}%`; top: `${number}%` } {
  const x = BASE_PLAYFIELD.xMin + nx * (BASE_PLAYFIELD.xMax - BASE_PLAYFIELD.xMin);
  const y = BASE_PLAYFIELD.yMin + ny * (BASE_PLAYFIELD.yMax - BASE_PLAYFIELD.yMin);

  return { left: `${x * 100}%`, top: `${y * 100}%` };
}

/** Building anchors (tweak nx/ny only — layout stays HUD-safe). Target the dirt, not the fence line. */
export const BASE_BUILDING_LAYOUT: { id: BuildingId; nx: number; ny: number; size: number }[] = [
  { id: 'snack', nx: 0.12, ny: 0.45, size: 66 },
  { id: 'sort', nx: 0.74, ny: 0.42, size: 70 },
  { id: 'nest', nx: 0.38, ny: 0.58, size: 72 },
  { id: 'vault', nx: 0.78, ny: 0.64, size: 68 },
  { id: 'training', nx: 0.5, ny: 0.78, size: 62 },
];

export type RaccoonRoutePoint = { dx: number; dy: number; moveAnimation: 'walk' | 'carry' };

/** Home positions and wander routes (dx/dy are pixel offsets from each home, unchanged). */
export const BASE_RACCOON_LAYOUT: {
  id: RaccoonId;
  nx: number;
  ny: number;
  size: number;
  route: RaccoonRoutePoint[];
}[] = [
  {
    id: 'scout',
    nx: 0.22,
    ny: 0.72,
    size: 70,
    route: [
      { dx: 28, dy: 8, moveAnimation: 'walk' },
      { dx: -14, dy: -6, moveAnimation: 'walk' },
      { dx: 0, dy: 0, moveAnimation: 'walk' },
    ],
  },
  {
    id: 'hauler',
    nx: 0.8,
    ny: 0.7,
    size: 64,
    route: [
      { dx: -56, dy: -4, moveAnimation: 'walk' },
      { dx: 0, dy: 0, moveAnimation: 'carry' },
      { dx: -16, dy: 10, moveAnimation: 'walk' },
      { dx: 0, dy: 0, moveAnimation: 'walk' },
    ],
  },
  {
    id: 'sniffer',
    nx: 0.42,
    ny: 0.76,
    size: 58,
    route: [
      { dx: 36, dy: -6, moveAnimation: 'walk' },
      { dx: -28, dy: 5, moveAnimation: 'walk' },
      { dx: 0, dy: 0, moveAnimation: 'walk' },
    ],
  },
  {
    id: 'sneak',
    nx: 0.55,
    ny: 0.8,
    size: 52,
    route: [
      { dx: 18, dy: -5, moveAnimation: 'walk' },
      { dx: -20, dy: 6, moveAnimation: 'walk' },
      { dx: 0, dy: 0, moveAnimation: 'walk' },
    ],
  },
];
