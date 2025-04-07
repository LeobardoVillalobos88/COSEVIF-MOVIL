import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import Toast from "react-native-toast-message";
import * as DocumentPicker from "expo-document-picker";
import { getItem } from "../../../config/Storage";
import { API_URL } from "../../../config/IP";

const RegisterWorkerScreen = ({ navigation }) => {
  const [workerName, setWorkerName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [inePhoto, setInePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Selección de imagen usando DocumentPicker de Expo
  const handleImagePick = async () => {
    console.debug("Iniciando selección de imagen con DocumentPicker");
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
    });
    console.debug("Resultado del DocumentPicker:", result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.debug("Imagen seleccionada:", result.assets[0].uri);
      setInePhoto(result.assets[0].uri);
    } else {
      console.debug("Selección de imagen cancelada o sin resultado válido");
    }
  };

  // Registrar trabajador (para que el residente cree trabajadores)
  const handleRegisterWorker = async () => {
    // Validar que todos los campos requeridos tengan datos
    if (!workerName || !age || !address || !inePhoto) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Todos los campos son obligatorios.",
      });
      return;
    }

    setLoading(true);
    console.debug("Iniciando registro del trabajador");

    try {
      // Solo se requiere el token; el backend extrae residentId y houseId desde él
      const token = await getItem("token");

      if (!token) {
        console.error("Token no encontrado");
        Toast.show({
          type: "error",
          text1: "Sesión inválida",
          text2: "Token no proporcionado",
        });
        setLoading(false);
        return;
      }

      console.debug("Convirtiendo imagen a Base64...");
      const imageResponse = await fetch(inePhoto);
      const blob = await imageResponse.blob();
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.debug("Imagen convertida a Base64");
          resolve(reader.result);
        };
        reader.onerror = (error) => {
          console.error("Error al convertir imagen a Base64:", error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });

      const workerData = {
        workerName,
        age: parseInt(age),
        address,
        inePhoto: base64Image,
      };

      console.debug("Datos del trabajador a enviar:", workerData);

      const workerResponse = await fetch(`${API_URL}/resident/workerVisits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workerData),
      });

      const status = workerResponse.status;
      const responseText = await workerResponse.text();
      console.debug("Status de la respuesta:", status);
      console.debug("Contenido de la respuesta:", responseText);

      if (workerResponse.ok) {
        console.debug("✅ Trabajador registrado (status:", status, ")");
        Toast.show({
          type: "success",
          text1: "Trabajador registrado",
          text2: "El trabajador ha sido registrado exitosamente.",
        });
        navigation.navigate("AdminStack", { screen: "WorkersListScreen" });
      } else {
        throw new Error(
          `Error al registrar el trabajador. Status: ${status}, Respuesta: ${responseText}`
        );
      }
    } catch (error) {
      console.error("❌ Error en el registro:", error);
      Toast.show({
        type: "error",
        text1: "Error al registrar el trabajador",
        text2: error.message,
      });
    } finally {
      setLoading(false);
      console.debug("Proceso de registro finalizado");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Trabajador</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del trabajador"
        value={workerName}
        onChangeText={setWorkerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Edad"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={address}
        onChangeText={setAddress}
      />

      {/* Preview de la imagen seleccionada */}
      {inePhoto && (
        <Image source={{ uri: inePhoto }} style={styles.ineImage} />
      )}

      <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
        <Text style={styles.imageButtonText}>
          {inePhoto ? "Imagen seleccionada" : "Seleccionar foto del INE"}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#E96443" />}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegisterWorker}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Registrar Trabajador</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
  },
  input: {
    width: "90%",
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  ineImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
  },
  imageButton: {
    backgroundColor: "#E96443",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: "90%",
    alignItems: "center",
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#E96443",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});

export default RegisterWorkerScreen;