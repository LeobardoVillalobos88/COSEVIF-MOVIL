import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { getItem } from "../config/Storage";

const API_URL = "http://192.168.0.40:8080";

const CreateVisitScreen = ({ navigation }) => {
  const [visitorName, setVisitorName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [numPeople, setNumPeople] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (_, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const onChangeTime = (_, time) => {
    setShowTimePicker(false);
    if (time) setSelectedTime(time);
  };

  const handleCreateVisit = async () => {
    setLoading(true);
  
    try {
      const token = await getItem("token");
      const residentId = await getItem("id");
      const houseId = await getItem("houseId");
  
      if (!token || !residentId || !houseId) {
        Toast.show({
          type: "error",
          text1: "Sesión inválida",
          text2: "Faltan datos del residente",
        });
        setLoading(false);
        return;
      }
  
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(selectedTime.getHours());
      combinedDate.setMinutes(selectedTime.getMinutes());
      combinedDate.setSeconds(0);
      combinedDate.setMilliseconds(0);
  
      const offset = combinedDate.getTimezoneOffset(); // en minutos
      const localDate = new Date(combinedDate.getTime() - offset * 60000);
      const dateTimeIso = localDate.toISOString().slice(0, 19); // sin zona
  
      const visitData = {
        visitorName,
        vehiclePlate,
        numPeople: parseInt(numPeople),
        description,
        password,
        dateTime: dateTimeIso,
      };
  
      const response = await fetch(`${API_URL}/resident/visit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(visitData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la visita");
      }
  
      const data = await response.json();
      console.log("✅ Visita creada:", data);
  
      Toast.show({
        type: "success",
        text1: "Visita creada",
        text2: data.qrCode ? "QR generado exitosamente" : "QR aún no disponible",
      });
      
      // ✅ Navegar correctamente dentro del stack
      navigation.navigate("ResidentStack", {
        screen: "VisitsListScreen",
      });
    } catch (error) {
      console.error("❌ Error:", error);
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
        onChangeText={setNumPeople}
        keyboardType="numeric"
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

      {/* FECHA */}
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
          onChange={onChangeDate}
        />
      )}

      {/* HORA */}
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
          onChange={onChangeTime}
        />
      )}

      {loading && <ActivityIndicator size="large" color="#E96443" />}

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateVisit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Crear Visita</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateVisitScreen;

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
