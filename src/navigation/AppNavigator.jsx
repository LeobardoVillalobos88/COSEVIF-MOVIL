import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SplashWelcomeResidentScreen from '../screens/resident/SplashWelcomeResidentScreen';
import SplashWelcomeGuardScreen from '../screens/guard/SplashWelcomeGuardScreen';
import ResidentStack from './ResidentStack';
import GuardiaStack from './GuardiaStack';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SplashWelcomeResident" component={SplashWelcomeResidentScreen} />
      <Stack.Screen name="SplashWelcomeGuard" component={SplashWelcomeGuardScreen} />
      <Stack.Screen name="ResidentStack" component={ResidentStack} />
      <Stack.Screen name="GuardiaStack" component={GuardiaStack} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
