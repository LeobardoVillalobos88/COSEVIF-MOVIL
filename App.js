import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast, { BaseToast } from "react-native-toast-message";
import { View, Text, Image } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import ResidentScreen from "./src/screens/ResidentScreen";
import CreateVisitScreen from "./src/screens/CreateVisitScreen";
import RegisterWorkerScreen from "./src/screens/RegisterWorkerScreen";
import SplashWelcomeScreen from "./src/screens/SplashWelcomeScreen";

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setIsAuthenticated(true);
    };
    checkAuthentication();
  }, []);

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isAuthenticated ? "ResidentScreen" : "LoginScreen"}>
        <Stack.Screen name="SplashWelcome" component={SplashWelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ResidentScreen" component={ResidentScreen} />
          <Stack.Screen name="CreateVisit" component={CreateVisitScreen} />
          <Stack.Screen name="RegisterWorker" component={RegisterWorkerScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Toast con diseño personalizado */}
      <Toast
        config={{
          success: ({ text1, text2, ...rest }) => (
            <View
              style={{
                backgroundColor: "#ffffff",
                borderLeftColor: "#4BB543",
                borderLeftWidth: 5,
                borderRadius: 12,
                padding: 15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 4,
                marginHorizontal: 10,
              }}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>
                <Text style={{ color: "#333", fontSize: 14 }}>{text2}</Text>
              </View>
              <Image
                source={require("./assets/LogoCosevif.png")}
                style={{ width: 50, height: 50, borderRadius: 10 }}
              />
            </View>
          ),
          error: ({ text1, text2, ...rest }) => (
            <View
              style={{
                backgroundColor: "#2e2e2e",
                borderLeftColor: "#E96443", 
                borderLeftWidth: 5,         
                borderRadius: 12,
                padding: 15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 4,
                marginHorizontal: 10,
              }}
            >          
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>
                <Text style={{ color: "#ddd", fontSize: 14 }}>{text2}</Text>
              </View>
              <Image
                source={require("./assets/error_x.png")}
                style={{ width: 50, height: 50, borderRadius: 10 }}
              />
            </View>
          ),
        }}
      />
    </>
  );
}
