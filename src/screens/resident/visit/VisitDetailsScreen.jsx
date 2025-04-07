import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const VisitDetailsScreen = ({ route }) => {
  const { visit } = route.params;
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#E96443" />
      </TouchableOpacity>

      <Text style={styles.title}>Detalles de la Visita</Text>

      <View style={styles.infoBox}><Text style={styles.label}>Fecha:</Text><Text style={styles.value}>{new Date(visit.dateTime).toLocaleDateString()}</Text></View>
      <View style={styles.infoBox}><Text style={styles.label}>Hora:</Text><Text style={styles.value}>{new Date(visit.dateTime).toLocaleTimeString()}</Text></View>
      <View style={styles.infoBox}><Text style={styles.label}>Visitante:</Text><Text style={styles.value}>{visit.visitorName}</Text></View>
      <View style={styles.infoBox}><Text style={styles.label}>Placas del vehículo:</Text><Text style={styles.value}>{visit.vehiclePlate || 'N/A'}</Text></View>
      <View style={styles.infoBox}><Text style={styles.label}>Personas:</Text><Text style={styles.value}>{visit.numPeople}</Text></View>
      <View style={styles.infoBox}><Text style={styles.label}>Descripción:</Text><Text style={styles.value}>{visit.description || 'Ninguna'}</Text></View>
      <View style={styles.infoBox}><Text style={styles.label}>Contraseña:</Text><Text style={styles.value}>{visit.password || 'Ninguna'}</Text></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#E96443',
    textAlign: 'center',
  },
  infoBox: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
});

export default VisitDetailsScreen;
