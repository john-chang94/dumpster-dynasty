import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';

import { navigationIconSources, TabKey } from '@/components/game/asset-sources';
import { HapticTab } from '@/components/haptic-tab';
import { gameColors } from '@/components/game/ui';

function tabIcon(tabKey: TabKey) {
  return function TabIcon({ focused, size }: { focused: boolean; color: string; size: number }) {
    return (
      <Image
        accessibilityIgnoresInvertColors
        contentFit="contain"
        source={navigationIconSources[tabKey][focused ? 'active' : 'inactive']}
        style={{ height: size + 5, width: size + 5 }}
      />
    );
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
          tabBarIcon: tabIcon('base'),
        }}
      />
      <Tabs.Screen
        name="scavenge"
        options={{
          title: 'Scavenge',
          tabBarIcon: tabIcon('scavenge'),
        }}
      />
      <Tabs.Screen
        name="build"
        options={{
          title: 'Build',
          tabBarIcon: tabIcon('build'),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Collection',
          tabBarIcon: tabIcon('collection'),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: tabIcon('shop'),
        }}
      />
    </Tabs>
  );
}
