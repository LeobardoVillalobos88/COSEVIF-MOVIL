import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { getItem } from '../../../config/Storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from "../../../config/IP";

const VisitEditScreen = ({ route }) => {
  const { visit } = route.params;
  const navigation = useNavigation();

  const [visitorName, setVisitorName] = useState(visit.visitorName);
  const [vehiclePlate, setVehiclePlate] = useState(visit.vehiclePlate);
  const [numPeople, setNumPeople] = useState(String(visit.numPeople));
  const [description, setDescription] = useState(visit.description);
  const [password, setPassword] = useState(visit.password);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date(visit.dateTime));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedTime, setSelectedTime] = useState(new Date(visit.dateTime));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (_, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const onChangeTime = (_, time) => {
    setShowTimePicker(false);
    if (time) setSelectedTime(time);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = await getItem('token');
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(selectedTime.getHours());
      combinedDate.setMinutes(selectedTime.getMinutes());
      combinedDate.setSeconds(0);
      combinedDate.setMilliseconds(0);

      const offset = combinedDate.getTimezoneOffset();
      const localDate = new Date(combinedDate.getTime() - offset * 60000);
      const dateTimeIso = localDate.toISOString().slice(0, 19);

      const data = {
        visitorName,
        vehiclePlate,
        numPeople: parseInt(numPeople),
        description,
        password,
        dateTime: dateTimeIso,
      };

      const response = await fetch(`${API_URL}/resident/visit/${visit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al actualizar la visita');

      Toast.show({
        type: 'success',
        text1: 'Visita actualizada',
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E96443" />
      </TouchableOpacity>

      <Text style={styles.title}>Editar Visita</Text>

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

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>
          Fecha: {selectedDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onChangeDate} />
      )}

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.dateText}>
          Hora: {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker value={selectedTime} mode="time" is24Hour={false} display="default" onChange={onChangeTime} />
      )}

      {loading && <ActivityIndicator size="large" color="#E96443" />}

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#E96443',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dateButton: {
    backgroundColor: '#E96443',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#E96443',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default VisitEditScreen;
