import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { clearSession } from "../config/Storage";
import Toast from "react-native-toast-message";

const GuardScreen = ({ navigation }) => {
  const handleLogout = async () => {
    Toast.show({
      type: "logout",
      text1: "Cerrando sesión",
      text2: "Gracias por usar COSEVIF",
    });
  
    setTimeout(async () => {
      await clearSession();
      navigation.replace("LoginScreen");
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido guardia</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E96443",
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
});

export default GuardScreen;
