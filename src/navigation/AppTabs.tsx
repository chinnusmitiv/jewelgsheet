import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PALETTE } from '../constants/theme';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { EntriesListScreen } from '../screens/transactions/EntriesListScreen';
import { DailyClosingScreen } from '../screens/closing/DailyClosingScreen';
import { ReportsHomeScreen } from '../screens/reports/ReportsHomeScreen';
import { MoreMenuScreen } from '../screens/admin/MoreMenuScreen';

const Tab = createBottomTabNavigator();

export const AppTabs: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PALETTE.primary,
        tabBarInactiveTintColor: PALETTE.textSecondary,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: PALETTE.border,
          height: 60 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Entries"
        component={EntriesListScreen}
        options={{
          tabBarLabel: 'Entries',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📝</Text>,
        }}
      />
      <Tab.Screen
        name="Closing"
        component={DailyClosingScreen}
        options={{
          tabBarLabel: 'Closing',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔒</Text>,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsHomeScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📈</Text>,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreMenuScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
