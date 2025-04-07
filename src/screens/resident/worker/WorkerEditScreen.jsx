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
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { getItem } from "../../../config/Storage";
import { API_URL } from "../../../config/IP";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

const WorkerEditScreen = ({ route, navigation }) => {
  const { worker } = route.params;
  const visit = worker.visit;
  const workerId = visit.id;

  const [workerName, setWorkerName] = useState(visit.workerName || "");
  const [age, setAge] = useState(visit.age?.toString() || "");
  const [address, setAddress] = useState(visit.address || "");
  const [inePhoto, setInePhoto] = useState(null);

  const initialDate = visit.dateTime
    ? new Date(visit.dateTime.replace(" ", "T"))
    : new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChangeDate = (_, date) => {
    setShowDatePicker(false);
    if (date) {
      const updated = new Date(selectedDate);
      updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(updated);
    }
  };

  const onChangeTime = (_, time) => {
    setShowTimePicker(false);
    if (time) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.getHours());
      newDate.setMinutes(time.getMinutes());
      setSelectedDate(newDate);
    }
  };

  const handleImagePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
    });

    if (!result.canceled && result.assets?.length > 0) {
      setInePhoto(result.assets[0].uri);
    }
  };

  const handleUpdateWorker = async () => {
    if (!workerName || !age || !address) {
      Toast.show({
        type: "error",
        text1: "Campos obligatorios",
        text2: "Por favor completa todos los campos.",
      });
      return;
    }

    setLoading(true);

    try {
      const token = await getItem("token");
      const formData = new FormData();

      formData.append("workerName", workerName);
      formData.append("age", parseInt(age));
      formData.append("address", address);

      const localDate = new Date(
        selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
      );
      const dateTimeIso = localDate.toISOString().slice(0, 19);
      formData.append("dateTime", dateTimeIso);

      if (inePhoto) {
        formData.append("inePhoto", {
          uri: inePhoto,
          type: "image/jpeg",
          name: "ine.jpg",
        });
      }

      const response = await fetch(`${API_URL}/resident/workerVisits/${workerId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Trabajador actualizado",
        });
        navigation.navigate("ResidentStack", { screen: "WorkersListScreen" });
      } else {
        throw new Error("Error al actualizar trabajador");
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={28} color="#E96443" />
      </TouchableOpacity>

      <Text style={styles.title}>Editar Trabajador</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
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

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>
          Fecha: {selectedDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
        />
      )}

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.dateText}>
          Hora: {moment(selectedDate).format("hh:mm A")}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeTime}
        />
      )}

      {(inePhoto || visit.inePhoto) && (
        <Image
          source={{
            uri: inePhoto || `data:image/jpeg;base64,${visit.inePhoto}`,
          }}
          style={styles.ineImage}
        />
      )}

      <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
        <Text style={styles.imageButtonText}>
          {inePhoto ? "Nueva imagen seleccionada" : "Cambiar foto INE"}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#E96443" />}

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdateWorker}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Actualizar</Text>
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
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
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
  imageButton: {
    backgroundColor: "#E96443",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
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
  ineImage: {
    width: 250,
    height: 150,
    marginVertical: 16,
    borderRadius: 12,
    resizeMode: "cover",
    alignSelf: "center",
  },  
});

export default WorkerEditScreen;