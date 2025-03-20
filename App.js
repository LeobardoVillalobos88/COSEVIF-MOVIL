import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AsyncStorage } from "@react-native-async-storage/async-storage";
import LoginScreen from "./src/screens/LoginScreen";
import ResidentScreen from "./src/screens/ResidentScreen";
import CreateVisitScreen from "./src/screens/CreateVisitScreen";
import RegisterWorkerScreen from "./src/screens/RegisterWorkerScreen";

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay un token almacenado en AsyncStorage
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
      }
    };

    checkAuthentication();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "ResidentScreen" : "LoginScreen"}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ResidentScreen" component={ResidentScreen} />
        <Stack.Screen name="CreateVisit" component={CreateVisitScreen} />
        <Stack.Screen name="RegisterWorker" component={RegisterWorkerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
