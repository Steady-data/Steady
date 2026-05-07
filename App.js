import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import { useTranslation } from './src/utils/i18n';
import LoginScreen from './src/screens/LoginScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import GlobalFABs from './src/components/GlobalFABs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { logout } = useApp();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Scanner: focused ? 'scan' : 'scan-outline',
            Inventory: focused ? 'cube' : 'cube-outline',
            Orders: focused ? 'cart' : 'cart-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#C6C6C8',
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={logout}
            style={styles.saveExitBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.saveExitText}>{t('saveExit')}</Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{ title: t('scanner') }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ title: t('inventory') }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: t('orders') }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isLoggedIn } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <View style={styles.root}>
          <NavigationContainer>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
          <GlobalFABs />
        </View>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  saveExitBtn: {
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  saveExitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
});
