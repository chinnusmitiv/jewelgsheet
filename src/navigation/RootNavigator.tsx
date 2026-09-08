import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { AppTabs } from './AppTabs';
import { NewEntryScreen } from '../screens/transactions/NewEntryScreen';
import { EntryDetailsScreen } from '../screens/transactions/EntryDetailsScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { AuditLogsScreen } from '../screens/admin/AuditLogsScreen';
import { PALETTE } from '../constants/theme';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: PALETTE.background },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={AppTabs} />
          <Stack.Screen
            name="NewEntry"
            component={NewEntryScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Record Entry',
              headerTintColor: PALETTE.text,
              headerStyle: { backgroundColor: '#ffffff' },
            }}
          />
          <Stack.Screen
            name="EntryDetails"
            component={EntryDetailsScreen}
            options={{
              headerShown: true,
              title: 'Transaction Details',
              headerTintColor: PALETTE.text,
              headerStyle: { backgroundColor: '#ffffff' },
            }}
          />
          <Stack.Screen
            name="UserManagement"
            component={UserManagementScreen}
            options={{
              headerShown: true,
              title: 'Staff Accounts',
              headerTintColor: PALETTE.text,
              headerStyle: { backgroundColor: '#ffffff' },
            }}
          />
          <Stack.Screen
            name="AuditLogs"
            component={AuditLogsScreen}
            options={{
              headerShown: true,
              title: 'Audit Logs',
              headerTintColor: PALETTE.text,
              headerStyle: { backgroundColor: '#ffffff' },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
