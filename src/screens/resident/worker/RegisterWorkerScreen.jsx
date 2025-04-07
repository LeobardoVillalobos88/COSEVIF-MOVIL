import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getItem } from "../../../config/Storage";
import { API_URL } from "../../../config/IP";

const RegisterWorkerScreen = ({ navigation }) => {
  const [workerName, setWorkerName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [inePhoto, setInePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleImagePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setInePhoto(result.assets[0].uri);
    }
  };

  const handleRegisterWorker = async () => {
    if (!workerName || !age || !address || !inePhoto) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Todos los campos son obligatorios.",
      });
      return;
    }

    setLoading(true);

    try {
      const token = await getItem("token");
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Sesión inválida",
          text2: "Token no proporcionado",
        });
        setLoading(false);
        return;
      }

      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(selectedTime.getHours());
      combinedDate.setMinutes(selectedTime.getMinutes());
      combinedDate.setSeconds(0);
      combinedDate.setMilliseconds(0);

      const offset = combinedDate.getTimezoneOffset();
      const localDate = new Date(combinedDate.getTime() - offset * 60000);
      const formattedDate = localDate.toISOString().slice(0, 19); // sin milisegundos ni Z

      const formData = new FormData();
      formData.append("workerName", workerName);
      formData.append("age", parseInt(age));
      formData.append("address", address);
      formData.append("dateTime", formattedDate);
      formData.append("inePhoto", {
        uri: inePhoto,
        type: "image/jpeg",
        name: "ine.jpg",
      });

      const response = await fetch(`${API_URL}/resident/workerVisits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const status = response.status;
      const resText = await response.text();

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Trabajador registrado",
          text2: "El trabajador ha sido registrado exitosamente.",
        });
        navigation.navigate("WorkersListScreen");
      } else {
        throw new Error(`Error al registrar el trabajador. Status: ${status}, Respuesta: ${resText}`);
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

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>
          Fecha: {selectedDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.dateText}>
          Hora: {selectedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, time) => {
            setShowTimePicker(false);
            if (time) setSelectedTime(time);
          }}
        />
      )}

      {inePhoto && <Image source={{ uri: inePhoto }} style={styles.ineImage} />}

      <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
        <Text style={styles.imageButtonText}>
          {inePhoto ? "Imagen seleccionada" : "Seleccionar foto del INE"}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#E96443" />}

      <TouchableOpacity style={styles.button} onPress={handleRegisterWorker} disabled={loading}>
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
  dateButton: {
    backgroundColor: "#E96443",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: "90%",
    alignItems: "center",
  },
  dateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  ineImage: {
    width: 250,
    height: 150,
    marginVertical: 16,
    borderRadius: 12,
    resizeMode: "cover",
    alignSelf: "center",
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
