import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { saveSession, getItem } from "../config/Storage";
//import { API_URL } from "../config/Api";  // Configura tu API_URL
import Toast from "react-native-toast-message";
const API_URL = "http://192.168.110.134:8080";
const CreateVisitScreen = ({ navigation }) => {
  const [visitorName, setVisitorName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [numPeople, setNumPeople] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQRCode] = useState("");

  const handleCreateVisit = async () => {
    setLoading(true);
  
    try {
      const token = await getItem("token");
      const residentId = await getItem("id");
      const houseId = await getItem("houseId");
  
      console.log("TOKEN:", token);
      console.log("RESIDENT ID:", residentId);
      console.log("HOUSE ID:", houseId);
  
      if (!residentId || !houseId || !token) {
        Toast.show({
          type: "error",
          text1: "Sesión inválida",
          text2: "Faltan datos del residente",
        });
        setLoading(false);
        return;
      }
  
      const visitData = {
        visitorName,
        vehiclePlate,
        numPeople: parseInt(numPeople),
        description,
        password,
        dateTime: new Date().toISOString(),
      };
  
      console.log("Visit data a enviar:", visitData);
  
      const response = await fetch(`${API_URL}/resident/visit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(visitData),
      });
  
      console.log("RESPONSE STATUS:", response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Error al crear visita");
      }
  
      const data = await response.json();
      console.log("Respuesta exitosa:", data);
  
      setQRCode(data.qrCode);
      Toast.show({
        type: "success",
        text1: "Visita creada",
        text2: "El código QR ha sido generado",
      });
  
      setTimeout(() => navigation.navigate("ResidentScreen"), 2000);
    } catch (error) {
      console.error("Error en handleCreateVisit:", error);
      Toast.show({
        type: "error",
        text1: "Error al crear la visita",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Visita</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del visitante"
        value={visitorName}
        onChangeText={setVisitorName}
      />
      <TextInput
        style={styles.input}
        placeholder="Placas del vehículo"
        value={vehiclePlate}
        onChangeText={setVehiclePlate}
      />
      <TextInput
        style={styles.input}
        placeholder="Número de personas"
        value={numPeople}
        keyboardType="numeric"
        onChangeText={setNumPeople}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Clave de acceso"
        value={password}
        onChangeText={setPassword}
      />

      {loading && <ActivityIndicator size="large" color="#E96443" />}

      <TouchableOpacity style={styles.button} onPress={handleCreateVisit} disabled={loading}>
        <Text style={styles.buttonText}>Crear Visita</Text>
      </TouchableOpacity>

      {qrCode ? (
        <View style={styles.qrContainer}>
          <Text style={styles.qrText}>Código QR de la visita:</Text>
          <Image source={{ uri: qrCode }} style={styles.qrImage} />
        </View>
      ) : null}
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
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#E96443",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  qrContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  qrText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  qrImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
});

export default CreateVisitScreen;
