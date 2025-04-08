import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GuardScreen from '../screens/guard/GuardScreen';
import ProfileScreen from '../screens/auth/ProfileScreen';
import WorkersListGuardScreen from '../screens/guard/worker/WorkersListGuardScreen';
import ScanQrScreen from '../screens/guard/qr/ScanQrScreen';

const Stack = createNativeStackNavigator();

const GuardiaStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuardScreen" component={GuardScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="WorkersListGuardScreen" component={WorkersListGuardScreen} />
      <Stack.Screen name="ScanQrScreen" component={ScanQrScreen} />
    </Stack.Navigator>
  );
};

export default GuardiaStack;
