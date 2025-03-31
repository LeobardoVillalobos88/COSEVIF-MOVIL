import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { clearSession } from "../config/Storage";
import Toast from "react-native-toast-message";

const GuardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido guardia</Text>

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

export default GuardScreen;