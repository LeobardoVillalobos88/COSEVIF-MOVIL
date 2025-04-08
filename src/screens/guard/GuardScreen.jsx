import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GuardScreen = ({ navigation }) => {
  const mainOptions = [
    {
      title: "Escanear QR",
      icon: "qr-code-outline",
      screen: "ScanQrScreen",
      color: "#E96443",
    },
    {
      title: "Lista de Trabajadores",
      icon: "people-outline",
      screen: "WorkersListGuardScreen",
      color: "#388E3C",
    },
  ];

  const profileOption = {
    title: "Ver Perfil",
    icon: "person-circle-outline",
    screen: "ProfileScreen",
    color: "#1976D2",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenido Guardia</Text>

      <View style={styles.grid}>
        {mainOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Ionicons name={item.icon} size={50} color={item.color} />
            <Text style={styles.label}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.card, { marginTop: 30 }]}
        onPress={() => navigation.navigate(profileOption.screen)}
      >
        <Ionicons name={profileOption.icon} size={50} color={profileOption.color} />
        <Text style={styles.label}>{profileOption.title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GuardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  welcome: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 50,
    color: "#E96443",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  card: {
    width: 140,
    height: 140,
    backgroundColor: "#fcdcd1",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
    color: "#333",
  },
});