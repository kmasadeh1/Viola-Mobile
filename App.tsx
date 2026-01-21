import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

// --- CORRECT IMPORT PATHS ---
// Since all files are now directly in the 'app/' folder, we import them from there.
// ... keep React imports ...

// --- CORRECT IMPORTS ---
import AdminDashboardScreen from './app/AdminDashboardScreen'; // Updated path
import BusScreen from './app/BusScreen';
import CheckoutScreen from './app/CheckoutScreen';
import GalleryScreen from './app/GalleryScreen';
import HomeScreen from './app/HomeScreen';
import LoginScreen from './app/LoginScreen';
import LunchScreen from './app/LunchScreen';
import ParentDashboardScreen from './app/ParentDashboardScreen';
import ScheduleScreen from './app/ScheduleScreen';
import ShopScreen from './app/ShopScreen';
import TeacherDashboardScreen from './app/TeacherDashboardScreen'; // Updated path

// ... rest of the code remains the same ...

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

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userJson = await AsyncStorage.getItem('viola_current_user');
        const studentId = await AsyncStorage.getItem('viola_current_student_id');
        const teacherEmail = await AsyncStorage.getItem('viola_current_teacher_email');
        const adminPreview = await AsyncStorage.getItem('viola_preview_student_id');

        // Logic to decide which screen to show first
        if (adminPreview || studentId) {
          setInitialRoute('ParentDashboard');
        } else if (teacherEmail) {
          setInitialRoute('TeacherDashboard');
        } else if (userJson) {
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
          headerShown: false,
          cardStyle: { backgroundColor: '#f0f2f5' }
        }}
      >
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