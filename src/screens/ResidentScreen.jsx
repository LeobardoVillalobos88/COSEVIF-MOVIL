import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert} from "react-native";
import { clearSession } from "../config/Storage";
import Toast from "react-native-toast-message";

const ResidentScreen = ({ navigation }) => {
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
      <Text style={styles.welcomeText}>Bienvenido Residente</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateVisit")}
      >
        <Text style={styles.buttonText}>Crear Visita</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("RegisterWorker")}
      >
        <Text style={styles.buttonText}>Registrar Trabajador</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#E96443",
  },
  button: {
    backgroundColor: "#E96443",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 30,
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

export default ResidentScreen;
