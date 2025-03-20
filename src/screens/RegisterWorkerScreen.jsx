// src/screens/RegisterWorkerScreen.jsx

import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const RegisterWorkerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Trabajador</Text>

      <TextInput placeholder="Nombre" style={styles.input} />
      <TextInput placeholder="Edad" style={styles.input} />
      <TextInput placeholder="Dirección" style={styles.input} />
      <TextInput placeholder="Número de Casa" style={styles.input} />

      <View style={styles.uploadContainer}>
        <Text style={styles.uploadText}>Foto INE</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Subir imagen</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#E96443",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E96443",
    borderRadius: 10,
    color: "#000",
  },
  uploadContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#E96443",
  },
  uploadButton: {
    backgroundColor: "#E96443",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#E96443",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RegisterWorkerScreen;