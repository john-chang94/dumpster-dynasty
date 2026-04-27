import { Canvas, Circle, Group, Line, Oval, Rect, RoundedRect } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';

import {
  BUILDINGS,
  BuildingId,
  getBuildingStage,
  LOOT_ITEMS,
  RACCOON_CLASSES,
  RACCOONS,
  RaccoonId,
  ZoneId,
  ZONES,
} from '@/constants/game';

type RaccoonSketchProps = {
  raccoonId: RaccoonId;
  size?: number;
  locked?: boolean;
};

export function RaccoonSketch({ raccoonId, size = 96, locked = false }: RaccoonSketchProps) {
  const raccoon = RACCOONS[raccoonId];
  const classConfig = RACCOON_CLASSES[raccoon.classId];
  const scale = size / 120;

  return (
    <View style={{ height: size, width: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group transform={[{ scale }]}>
          <Oval rect={box(14, 67, 36, 26)} color={locked ? '#5D554D' : '#3C3A39'} />
          <Oval rect={box(16, 68, 28, 13)} color={locked ? '#4B443F' : '#6E6C68'} />
          <Oval rect={box(35, 53, 49, 55)} color={locked ? '#4F4841' : '#4B4845'} />
          <Oval rect={box(43, 68, 33, 34)} color={locked ? '#6B6258' : '#F7E9D3'} />
          <Oval rect={box(38, 11, 20, 34)} color={locked ? '#4F4841' : '#2D2A28'} />
          <Oval rect={box(82, 11, 20, 34)} color={locked ? '#4F4841' : '#2D2A28'} />
          {!locked ? (
            <>
              <Oval rect={box(44, 17, 10, 19)} color="#ECA28D" />
              <Oval rect={box(88, 17, 10, 19)} color="#ECA28D" />
            </>
          ) : null}
          <Oval rect={box(31, 25, 72, 55)} color={locked ? '#56504A' : '#77746D'} />
          <Oval rect={box(39, 38, 56, 25)} color={locked ? '#383530' : '#202020'} />
          <Oval rect={box(39, 33, 21, 25)} color={locked ? '#312E2A' : '#F7E9D3'} />
          <Oval rect={box(74, 33, 21, 25)} color={locked ? '#312E2A' : '#F7E9D3'} />
          {!locked ? (
            <>
              <Circle cx={49} cy={46} r={8} color="#101010" />
              <Circle cx={84} cy={46} r={8} color="#101010" />
              <Circle cx={52} cy={43} r={3} color="#FFFFFF" />
              <Circle cx={87} cy={43} r={3} color="#FFFFFF" />
              <Oval rect={box(57, 51, 20, 17)} color="#F5E4CB" />
              <Circle cx={67} cy={56} r={4} color="#1D1917" />
              <Line p1={{ x: 67, y: 61 }} p2={{ x: 67, y: 67 }} color="#4C2E24" strokeWidth={2} />
              <Line p1={{ x: 63, y: 67 }} p2={{ x: 71, y: 67 }} color="#4C2E24" strokeWidth={2} />
              <RoundedRect x={48} y={73} width={42} height={11} r={5} color={classConfig.color} />
              <RoundedRect x={77} y={76} width={17} height={8} r={4} color={classConfig.darkColor} />
            </>
          ) : null}
          <Oval rect={box(35, 89, 17, 16)} color={locked ? '#3E3833' : '#2C2A28'} />
          <Oval rect={box(78, 89, 17, 16)} color={locked ? '#3E3833' : '#2C2A28'} />
        </Group>
      </Canvas>
    </View>
  );
}

export function BuildingSketch({
  buildingId,
  level,
  size = 90,
}: {
  buildingId: BuildingId;
  level: number;
  size?: number;
}) {
  const building = BUILDINGS[buildingId];
  const stage = getBuildingStage(level);
  const scale = size / 120;

  return (
    <View style={{ height: size, width: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group transform={[{ scale }]}>
          <Oval rect={box(18, 86, 84, 18)} color="rgba(59, 35, 16, 0.18)" />
          {buildingId === 'nest' ? <NestDrawing stage={stage} color={building.color} /> : null}
          {buildingId === 'snack' ? <SnackDrawing stage={stage} color={building.color} /> : null}
          {buildingId === 'sort' ? <SortDrawing stage={stage} color={building.color} /> : null}
          {buildingId === 'vault' ? <VaultDrawing stage={stage} color={building.color} /> : null}
          {buildingId === 'training' ? <TrainingDrawing stage={stage} color={building.color} /> : null}
        </Group>
      </Canvas>
    </View>
  );
}

export function ZoneThumbnail({ zoneId, width = 112, height = 82 }: { zoneId: ZoneId; width?: number; height?: number }) {
  const zone = ZONES[zoneId];
  const xScale = width / 140;
  const yScale = height / 100;

  return (
    <View style={{ height, width }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group transform={[{ scaleX: xScale }, { scaleY: yScale }]}>
          <RoundedRect x={0} y={0} width={140} height={100} r={12} color={zone.palette.sky} />
          <Rect x={0} y={60} width={140} height={40} color={zone.palette.ground} />
          <Rect x={12} y={34} width={22} height={28} color="rgba(44, 50, 58, 0.35)" />
          <Rect x={40} y={26} width={18} height={36} color="rgba(44, 50, 58, 0.32)" />
          <Rect x={65} y={38} width={28} height={24} color="rgba(44, 50, 58, 0.28)" />
          {zoneId === 'store' ? <StoreProps /> : <DumpsterProps color={zone.palette.accent} />}
          {zoneId === 'backlot' ? (
            <>
              <Line p1={{ x: 10, y: 30 }} p2={{ x: 130, y: 26 }} color="#F6DFC0" strokeWidth={3} />
              <RoundedRect x={90} y={65} width={28} height={20} r={3} color="#9B5D30" />
            </>
          ) : null}
          <Circle cx={118} cy={18} r={7} color="#F7D36D" />
          <Circle cx={24} cy={76} r={3} color={zone.palette.shadow} />
          <Circle cx={48} cy={83} r={4} color={zone.palette.shadow} />
        </Group>
      </Canvas>
    </View>
  );
}

export function LootSketch({ lootId, size = 54, locked = false }: { lootId?: string; size?: number; locked?: boolean }) {
  const loot = lootId ? LOOT_ITEMS[lootId] : undefined;
  const scale = size / 80;
  const rarityColor = locked
    ? '#5E554E'
    : loot?.rarity === 'rare'
      ? '#2585C2'
      : loot?.rarity === 'uncommon'
        ? '#8F7AB9'
        : '#B98532';

  return (
    <View style={{ height: size, width: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group transform={[{ scale }]}>
          <RoundedRect x={7} y={8} width={66} height={64} r={13} color={locked ? '#8A7C6D' : '#F5D89E'} />
          <RoundedRect x={12} y={13} width={56} height={54} r={11} color={locked ? '#6D6359' : '#FFF3D7'} />
          {locked ? (
            <>
              <Circle cx={40} cy={37} r={16} color="#4D4640" />
              <RoundedRect x={28} y={35} width={24} height={22} r={4} color="#39342F" />
              <Line p1={{ x: 40, y: 43 }} p2={{ x: 40, y: 51 }} color="#6D6359" strokeWidth={3} />
            </>
          ) : (
            <>
              <Circle cx={40} cy={39} r={17} color={rarityColor} />
              <LootGlyph lootId={lootId} />
              <Circle cx={56} cy={22} r={4} color="#FFFFFF" />
            </>
          )}
        </Group>
      </Canvas>
    </View>
  );
}

export function BaseBackdrop({ height = 310 }: { height?: number }) {
  return (
    <Canvas style={{ height, width: '100%' }}>
      <RoundedRect x={0} y={0} width={430} height={height} r={8} color="#BBD0B9" />
      <Rect x={0} y={112} width={430} height={height - 112} color="#B58B50" />
      <Rect x={0} y={0} width={430} height={112} color="#AFCACB" />
      <Rect x={12} y={58} width={44} height={68} color="rgba(61, 73, 83, 0.32)" />
      <Rect x={66} y={38} width={34} height={88} color="rgba(61, 73, 83, 0.28)" />
      <Rect x={330} y={48} width={46} height={78} color="rgba(61, 73, 83, 0.3)" />
      <Circle cx={144} cy={110} r={48} color="#5D8B45" />
      <Circle cx={102} cy={125} r={35} color="#6C9B4D" />
      <Rect x={0} y={122} width={430} height={20} color="#6C5A36" />
      <Line p1={{ x: 0, y: 132 }} p2={{ x: 430, y: 132 }} color="#4D3D23" strokeWidth={3} />
      <Circle cx={34} cy={251} r={4} color="#6C4E2A" />
      <Circle cx={308} cy={231} r={5} color="#6C4E2A" />
      <Circle cx={378} cy={280} r={4} color="#6C4E2A" />
      <RoundedRect x={164} y={124} width={104} height={56} r={8} color="#28562F" />
      <RoundedRect x={174} y={134} width={84} height={35} r={4} color="#396E3A" />
      <Rect x={164} y={154} width={104} height={18} color="#1F4328" />
      <RoundedRect x={272} y={132} width={30} height={48} r={6} color="#7D7D75" />
      <Line p1={{ x: 276, y: 142 }} p2={{ x: 298, y: 142 }} color="#4E514F" strokeWidth={3} />
      <Line p1={{ x: 281, y: 132 }} p2={{ x: 281, y: 181 }} color="#595B57" strokeWidth={2} />
      <Line p1={{ x: 292, y: 132 }} p2={{ x: 292, y: 181 }} color="#595B57" strokeWidth={2} />
    </Canvas>
  );
}

function NestDrawing({ stage, color }: { stage: 1 | 2 | 3; color: string }) {
  return (
    <>
      <Oval rect={box(28, 57, 66, 32)} color="#7B5428" />
      <Oval rect={box(35, 51, 50, 30)} color="#D6A13F" />
      <Line p1={{ x: 25, y: 68 }} p2={{ x: 91, y: 46 }} color="#5A3A19" strokeWidth={5} />
      <Line p1={{ x: 30, y: 81 }} p2={{ x: 94, y: 61 }} color="#5A3A19" strokeWidth={5} />
      {stage >= 2 ? <RoundedRect x={42} y={47} width={36} height={16} r={7} color="#EBD9B5" /> : null}
      {stage >= 3 ? <Line p1={{ x: 36, y: 41 }} p2={{ x: 86, y: 38 }} color={color} strokeWidth={4} /> : null}
    </>
  );
}

function SnackDrawing({ stage, color }: { stage: 1 | 2 | 3; color: string }) {
  return (
    <>
      <RoundedRect x={27} y={51} width={66} height={42} r={7} color="#8D4F23" />
      <RoundedRect x={32} y={45} width={56} height={14} r={5} color={color} />
      <Circle cx={44} cy={68} r={8} color="#C8482E" />
      <Circle cx={61} cy={67} r={7} color="#EAB348" />
      <Circle cx={77} cy={68} r={8} color="#6BA243" />
      {stage >= 2 ? <RoundedRect x={38} y={33} width={34} height={16} r={4} color="#B98532" /> : null}
      {stage >= 3 ? <RoundedRect x={73} y={35} width={18} height={50} r={4} color="#D9C392" /> : null}
    </>
  );
}

function SortDrawing({ stage, color }: { stage: 1 | 2 | 3; color: string }) {
  return (
    <>
      <RoundedRect x={24} y={48} width={74} height={15} r={5} color={color} />
      <Line p1={{ x: 34, y: 62 }} p2={{ x: 28, y: 92 }} color="#5B3B21" strokeWidth={6} />
      <Line p1={{ x: 88, y: 62 }} p2={{ x: 94, y: 92 }} color="#5B3B21" strokeWidth={6} />
      <Circle cx={46} cy={42} r={8} color="#7D7D75" />
      <Circle cx={62} cy={39} r={7} color="#536D7A" />
      <Circle cx={78} cy={42} r={8} color="#9A9B91" />
      {stage >= 2 ? <RoundedRect x={36} y={66} width={18} height={18} r={3} color="#3E8AC0" /> : null}
      {stage >= 3 ? <Line p1={{ x: 28, y: 35 }} p2={{ x: 94, y: 29 }} color="#386B2A" strokeWidth={5} /> : null}
    </>
  );
}

function VaultDrawing({ stage, color }: { stage: 1 | 2 | 3; color: string }) {
  return (
    <>
      <RoundedRect x={29} y={47} width={62} height={42} r={8} color="#725432" />
      <RoundedRect x={36} y={38} width={48} height={24} r={10} color="#4D3723" />
      <RoundedRect x={34} y={52} width={52} height={31} r={6} color={color} />
      <Circle cx={60} cy={67} r={8} color="#F4CA4D" />
      {stage >= 2 ? <Circle cx={74} cy={58} r={6} color="#57B5E8" /> : null}
      {stage >= 3 ? <Line p1={{ x: 46, y: 41 }} p2={{ x: 77, y: 31 }} color="#CFF5FF" strokeWidth={4} /> : null}
    </>
  );
}

function TrainingDrawing({ stage, color }: { stage: 1 | 2 | 3; color: string }) {
  return (
    <>
      <RoundedRect x={28} y={57} width={56} height={34} r={6} color="#A5652F" />
      <Line p1={{ x: 32, y: 66 }} p2={{ x: 82, y: 82 }} color="#6B3E1C" strokeWidth={5} />
      <Circle cx={87} cy={58} r={11} color="#2E2C2A" />
      <Circle cx={87} cy={58} r={5} color="#A5652F" />
      {stage >= 2 ? <Line p1={{ x: 44, y: 44 }} p2={{ x: 44, y: 89 }} color={color} strokeWidth={5} /> : null}
      {stage >= 3 ? <RoundedRect x={51} y={38} width={28} height={13} r={3} color="#E6B340" /> : null}
    </>
  );
}

function DumpsterProps({ color }: { color: string }) {
  return (
    <>
      <RoundedRect x={38} y={52} width={64} height={32} r={6} color="#213D29" />
      <RoundedRect x={45} y={43} width={50} height={16} r={4} color={color} />
      <Rect x={38} y={64} width={64} height={8} color="#1A2E20" />
      <Circle cx={50} cy={88} r={5} color="#2A2A2A" />
      <Circle cx={91} cy={88} r={5} color="#2A2A2A" />
      <RoundedRect x={15} y={67} width={18} height={17} r={4} color="#654421" />
      <RoundedRect x={106} y={64} width={14} height={20} r={4} color="#2C2C2C" />
    </>
  );
}

function StoreProps() {
  return (
    <>
      <RoundedRect x={31} y={42} width={78} height={44} r={7} color="#D6872C" />
      <Rect x={31} y={42} width={78} height={12} color="#3A5A80" />
      <Rect x={46} y={58} width={21} height={28} color="#2E4E72" />
      <Rect x={73} y={58} width={21} height={28} color="#EFD18F" />
      <Circle cx={107} cy={77} r={8} color="#888985" />
    </>
  );
}

function LootGlyph({ lootId }: { lootId?: string }) {
  switch (lootId) {
    case 'soda_can':
    case 'broken_phone':
    case 'watch':
      return <RoundedRect x={29} y={23} width={22} height={35} r={5} color="#FFF4D8" />;
    case 'banana_peel':
    case 'fish_bone':
      return (
        <>
          <Line p1={{ x: 25, y: 51 }} p2={{ x: 40, y: 27 }} color="#FFF4D8" strokeWidth={7} />
          <Line p1={{ x: 40, y: 27 }} p2={{ x: 57, y: 51 }} color="#FFF4D8" strokeWidth={7} />
          <Circle cx={40} cy={30} r={4} color="#FFF4D8" />
        </>
      );
    case 'gold_ring':
    case 'glowing_bottle_cap':
      return (
        <>
          <Circle cx={40} cy={40} r={17} color="#FFF4D8" />
          <Circle cx={40} cy={40} r={9} color={lootId === 'gold_ring' ? '#2585C2' : '#2585C2'} />
        </>
      );
    default:
      return (
        <>
          <Circle cx={40} cy={29} r={8} color="#FFF4D8" />
          <RoundedRect x={26} y={36} width={28} height={19} r={5} color="#FFF4D8" />
          <Line p1={{ x: 27, y: 59 }} p2={{ x: 54, y: 23 }} color="#FFF4D8" strokeWidth={4} />
        </>
      );
  }
}

function box(x: number, y: number, width: number, height: number) {
  return { x, y, width, height };
}
