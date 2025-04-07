import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/auth/ProfileScreen';
//Importaciones de residente
import ResidentScreen from '../screens/resident/ResidentScreen';
import CreateVisitScreen from '../screens/resident/visit/CreateVisitScreen';
import VisitsListScreen from '../screens/resident/visit/VisitsListScreen';
import VisitQrScreen from '../screens/resident/visit/VisitQrScreen';
import VisitDetailsScreen from '../screens/resident/visit/VisitDetailsScreen';
import VisitEditScreen from '../screens/resident/visit/VisitEditScreen';
import RegisterWorkerScreen from '../screens/resident/worker/RegisterWorkerScreen';
//Importaciones de guardia


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
      <Stack.Screen name="VisitDetailsScreen" component={VisitDetailsScreen} />
      <Stack.Screen name="VisitEditScreen" component={VisitEditScreen} />
    </Stack.Navigator>
  );
};

export default ResidentStack;
