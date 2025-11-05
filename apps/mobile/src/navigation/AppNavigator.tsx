/**
 * App Navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import NewOrderScreen from '../screens/NewOrderScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QuotationsScreen from '../screens/QuotationsScreen';
import UsersScreen from '../screens/UsersScreen';

// Icons (using text emojis for simplicity)
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <span style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{icon}</span>
);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0369a1',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'الرئيسية',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'الطلبات',
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'الإشعارات',
          tabBarIcon: ({ focused }) => <TabIcon icon="🔔" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'الحساب',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// إضافة تعريف أنواع المسارات
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  OrderDetails: { orderId: string };
  NewOrder: undefined;
  Quotations: undefined;
  Users: undefined;
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // أو شاشة تحميل
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeTabs} />
            <Stack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
              options={{ headerShown: true, title: 'تفاصيل الطلب' }}
            />
            <Stack.Screen
              name="NewOrder"
              component={NewOrderScreen}
              options={{ headerShown: true, title: 'طلب جديد' }}
            />
            <Stack.Screen
              name="Quotations"
              component={QuotationsScreen}
              options={{ headerShown: true, title: 'عروض الأسعار' }}
            />
            <Stack.Screen
              name="Users"
              component={UsersScreen}
              options={{ headerShown: true, title: 'إدارة المستخدمين' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

