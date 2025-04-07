import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import AppNavigator from "./src/navigation/AppNavigator";
import { View, Text, Image } from "react-native";
import { LogBox } from "react-native";
LogBox.ignoreLogs(["Error en login: Credenciales incorrectas"]);

export default function App() {
  return (
    <>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>

      <Toast
        config={{
          success: ({ text1, text2 }) => (
            <View style={{
              backgroundColor: "#fff",
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
            }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>
                <Text style={{ color: "#333", fontSize: 14 }}>{text2}</Text>
              </View>
              <Image source={require("./assets/LogoCosevif.png")} style={{ width: 50, height: 50, borderRadius: 10 }} />
            </View>
          ),
          error: ({ text1, text2 }) => (
            <View style={{
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
            }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>
                <Text style={{ color: "#ddd", fontSize: 14 }}>{text2}</Text>
              </View>
              <Image source={require("./assets/error_x.png")} style={{ width: 50, height: 50, borderRadius: 10 }} />
            </View>
          ),
        }}
      />
    </>
  );
}
