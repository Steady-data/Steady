import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#121212', padding: 24 }} contentContainerStyle={{ paddingTop: 60 }}>
        <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>CRASH — copy this and send to developer:</Text>
        <Text style={{ color: '#F9FAFB', fontSize: 12, fontFamily: 'monospace' }}>{String(this.state.error)}{'\n\n'}{this.state.error?.stack}</Text>
      </ScrollView>
    );
  }
}
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import { useTranslation } from './src/utils/i18n';
import { C } from './src/utils/theme';
import LoginScreen from './src/screens/LoginScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import GlobalFABs from './src/components/GlobalFABs';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary:      C.accent,
    background:   C.bg,
    card:         C.bg,
    text:         C.text,
    border:       C.surface2,
    notification: C.accent,
  },
};

function MainTabs() {
  const { logout } = useApp();
  const { t }      = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          const icons = {
            Scanner:   focused ? 'scan'         : 'scan-outline',
            Inventory: focused ? 'cube'          : 'cube-outline',
            Orders:    focused ? 'cart'          : 'cart-outline',
          };
          return (
            <Ionicons
              name={icons[route.name]}
              size={size}
              color={focused ? C.accent : C.text2}
            />
          );
        },
        tabBarActiveTintColor:   C.accent,
        tabBarInactiveTintColor: C.text2,
        tabBarStyle: {
          backgroundColor:  C.bg,
          borderTopWidth:   StyleSheet.hairlineWidth,
          borderTopColor:   C.surface2,
        },
        tabBarLabelStyle: {
          fontSize:   11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: C.bg,
        },
        headerShadowVisible: false,
        headerTintColor: C.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize:   17,
          color:      C.text,
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
      <Tab.Screen name="Scanner"   component={ScannerScreen}   options={{ title: t('scanner') }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: t('inventory') }} />
      <Tab.Screen name="Orders"    component={OrdersScreen}    options={{ title: t('orders') }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isLoggedIn } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn
        ? <Stack.Screen name="Login" component={LoginScreen} />
        : <Stack.Screen name="Main"  component={MainTabs} />
      }
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <View style={styles.root}>
            <NavigationContainer theme={NavTheme}>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
            <GlobalFABs />
          </View>
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  saveExitBtn: {
    marginRight: 16,
    paddingVertical: 4,
  },
  saveExitText: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.text2,
  },
});
