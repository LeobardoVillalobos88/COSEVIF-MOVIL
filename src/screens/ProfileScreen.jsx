import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { getItem, clearSession } from "../config/Storage";
import Toast from "react-native-toast-message";

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [role, setRole] = useState("");
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      const userName = await getItem("name");
      const userEmailOrPhone = await getItem("email") || await getItem("phone");
      const userRole = await getItem("role");

      setName(userName);
      setEmailOrPhone(userEmailOrPhone);
      setRole(userRole);

      // Cambiar la imagen dependiendo del rol
      if (userRole === "RESIDENT") {
        setImageSource(require("../../assets/residente_welcome.png"));
      } else if (userRole === "GUARDIA") {
        setImageSource(require("../../assets/guardia_welcome.png"));
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    await clearSession();
    Toast.show({
      type: "success",
      text1: "Sesión cerrada",
      text2: "Redirigiendo al login",
    });

    setTimeout(() => {
      navigation.replace("LoginScreen");
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      {imageSource && (
        <Image source={imageSource} style={styles.profileImage} />
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.data}>{name}</Text>

        <Text style={styles.label}>Correo o Teléfono:</Text>
        <Text style={styles.data}>{emailOrPhone}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0", // Fondo de color suave
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#E96443",
    marginTop: 30,
    marginBottom: 20,
    alignSelf: "flex-start", // Alineamos el título a la izquierda
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  data: {
    fontSize: 18,
    color: "#666",
    marginBottom: 15,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginTop: 20,
    marginBottom: 30,
    borderColor: "#E96443", // Borde alrededor de la imagen
    borderWidth: 2,
  },
  logoutButton: {
    backgroundColor: "#E96443",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
    width: "80%",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ProfileScreen;
