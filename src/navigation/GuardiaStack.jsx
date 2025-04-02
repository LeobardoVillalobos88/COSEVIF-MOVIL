import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GuardScreen from '../screens/GuardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const GuardiaStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuardScreen" component={GuardScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default GuardiaStack;
