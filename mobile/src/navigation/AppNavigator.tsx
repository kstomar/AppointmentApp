import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuthStore } from '../stores/authStore';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';

// Main Screens
import { HomeScreen } from '../screens/HomeScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { BookingDetailScreen } from '../screens/BookingDetailScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Booking Flow Screens
import { SelectServiceScreen } from '../screens/booking/SelectServiceScreen';
import { SelectStaffScreen } from '../screens/booking/SelectStaffScreen';
import { SelectDateTimeScreen } from '../screens/booking/SelectDateTimeScreen';
import { ClientInfoScreen } from '../screens/booking/ClientInfoScreen';
import { BookingConfirmationScreen } from '../screens/booking/BookingConfirmationScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  SignUp: undefined;
  SelectService: { businessSlug: string };
  SelectStaff: { businessSlug: string };
  SelectDateTime: { businessSlug: string };
  ClientInfo: { businessSlug: string };
  BookingConfirmation: { bookingId: string };
  BookingDetail: { bookingId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="SelectService"
              component={SelectServiceScreen}
              options={{ headerShown: true, title: 'Select Service' }}
            />
            <Stack.Screen
              name="SelectStaff"
              component={SelectStaffScreen}
              options={{ headerShown: true, title: 'Select Staff' }}
            />
            <Stack.Screen
              name="SelectDateTime"
              component={SelectDateTimeScreen}
              options={{ headerShown: true, title: 'Select Date & Time' }}
            />
            <Stack.Screen
              name="ClientInfo"
              component={ClientInfoScreen}
              options={{ headerShown: true, title: 'Your Information' }}
            />
            <Stack.Screen
              name="BookingConfirmation"
              component={BookingConfirmationScreen}
              options={{ headerShown: true, title: 'Booking Confirmed' }}
            />
            <Stack.Screen
              name="BookingDetail"
              component={BookingDetailScreen}
              options={{ headerShown: true, title: 'Booking Details' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
