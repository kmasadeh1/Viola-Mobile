import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// --- IMPORT SCREENS ---
// Ensure all these files are in the same directory or adjust paths accordingly
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import ParentDashboardScreen from './ParentDashboardScreen';
import TeacherDashboardScreen from './TeacherDashboardScreen';
import AdminDashboardScreen from './AdminDashboardScreen';
import ScheduleScreen from './ScheduleScreen';
import BusScreen from './BusScreen';
import ShopScreen from './ShopScreen';
import LunchScreen from './LunchScreen';
import GalleryScreen from './GalleryScreen';
import CheckoutScreen from './CheckoutScreen';

// --- DEFINE STACK PARAMS ---
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  ParentDashboard: undefined;
  TeacherDashboard: undefined;
  AdminDashboard: undefined;
  Schedule: undefined;
  Bus: undefined;
  Shop: undefined;
  Lunch: undefined;
  Gallery: undefined;
  Checkout: { source: 'shop' | 'lunch'; cart?: any[] };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Home');
  const [loading, setLoading] = useState(true);

  // Optional: Check if user is already logged in to redirect them immediately
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userJson = await AsyncStorage.getItem('viola_current_user');
        const studentId = await AsyncStorage.getItem('viola_current_student_id');
        const teacherEmail = await AsyncStorage.getItem('viola_current_teacher_email');
        const adminPreview = await AsyncStorage.getItem('viola_preview_student_id');

        if (adminPreview || studentId) {
          setInitialRoute('ParentDashboard');
        } else if (teacherEmail) {
          setInitialRoute('TeacherDashboard');
        } else if (userJson) {
          // If using a generic user object structure
          const user = JSON.parse(userJson);
          if (user.role === 'admin') setInitialRoute('AdminDashboard');
          else if (user.role === 'teacher') setInitialRoute('TeacherDashboard');
        }
      } catch (e) {
        console.log('Session check failed', e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6a1b9a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false, // We created custom headers in each screen
          cardStyle: { backgroundColor: '#f0f2f5' }
        }}
      >
        {/* Public Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Dashboards */}
        <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />

        {/* Features */}
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="Bus" component={BusScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} />
        <Stack.Screen name="Lunch" component={LunchScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}