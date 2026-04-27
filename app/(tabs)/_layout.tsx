import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { gameColors } from '@/components/game/ui';

type TabIconName = keyof typeof MaterialCommunityIcons.glyphMap;

function tabIcon(name: TabIconName) {
  return function TabIcon({ color, size }: { color: string; size: number }) {
    return <MaterialCommunityIcons name={name} color={color} size={size} />;
  };
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: gameColors.orange,
        tabBarInactiveTintColor: '#8C765C',
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
        tabBarStyle: {
          backgroundColor: '#3B2614',
          borderTopColor: '#6A4321',
          minHeight: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Base',
          tabBarIcon: tabIcon('home-variant'),
        }}
      />
      <Tabs.Screen
        name="scavenge"
        options={{
          title: 'Scavenge',
          tabBarIcon: tabIcon('magnify'),
        }}
      />
      <Tabs.Screen
        name="build"
        options={{
          title: 'Build',
          tabBarIcon: tabIcon('hammer-wrench'),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Collection',
          tabBarIcon: tabIcon('book-open-variant'),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: tabIcon('cart'),
        }}
      />
    </Tabs>
  );
}
