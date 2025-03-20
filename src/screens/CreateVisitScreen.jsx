// src/screens/CreateVisitScreen.jsx

import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const CreateVisitScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Visita</Text>

      <TextInput placeholder="Fecha" style={styles.input} />
      <TextInput placeholder="Hora" style={styles.input} />
      <TextInput placeholder="Número de Personas" style={styles.input} />
      <TextInput placeholder="Estatus" style={styles.input} />
      <TextInput placeholder="Placas de Vehículo" style={styles.input} />
      <TextInput placeholder="Contraseña de Acceso" style={styles.input} />
      <TextInput placeholder="Nombre del Visitante" style={styles.input} />
      <TextInput placeholder="Descripción" style={styles.input} />

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
  button: {
    backgroundColor: "#E96443",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CreateVisitScreen;
