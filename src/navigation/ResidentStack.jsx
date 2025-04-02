import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ResidentScreen from '../screens/ResidentScreen';
import CreateVisitScreen from '../screens/CreateVisitScreen';
import RegisterWorkerScreen from '../screens/RegisterWorkerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VisitsListScreen from '../screens/VisitsListScreen';
import VisitQrScreen from '../screens/VisitQrScreen';

const Stack = createNativeStackNavigator();

const ResidentStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ResidentScreen" component={ResidentScreen} />
      <Stack.Screen name="CreateVisit" component={CreateVisitScreen} />
      <Stack.Screen name="RegisterWorker" component={RegisterWorkerScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="VisitsListScreen" component={VisitsListScreen} />
      <Stack.Screen name="VisitQrScreen" component={VisitQrScreen} />
    </Stack.Navigator>
  );
};

export default ResidentStack;
