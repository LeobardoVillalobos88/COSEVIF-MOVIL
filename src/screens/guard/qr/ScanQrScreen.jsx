import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ScanQrScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Aquí irá el escáner de QR.</Text>
    </View>
  );
};

export default ScanQrScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E96443",
  },
});
