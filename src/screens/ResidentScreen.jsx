import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { clearSession } from "../config/Storage";
import Toast from "react-native-toast-message";

const ResidentScreen = ({ navigation }) => {
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

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ProfileScreen")}
      >
        <Text style={styles.buttonText}>Ver perfil</Text>
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
});

export default ResidentScreen;