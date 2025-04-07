import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { getItem, clearSession } from "../../config/Storage";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({});
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      const role = await getItem("role");

      const commonData = {
        name: await getItem("name"),
        lastName: await getItem("lastName"),
        email: await getItem("email"),
        phone: await getItem("phone"),
        address: await getItem("address"),
        street: await getItem("street"),
        age: await getItem("age"),
        birthDate: await getItem("birthDate"),
      };

      if (role === "RESIDENT") {
        setUserData({
          ...commonData,
          houseNumber: await getItem("houseNumber"),
        });

        setImageSource(require("../../../assets/residente_welcome.png"));
      } else if (role === "GUARDIA") {
        setUserData({
          ...commonData,
          username: await getItem("username"),
        });

        setImageSource(require("../../../assets/guardia_welcome.png"));
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
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={28} color="#E96443" />
      </TouchableOpacity>

      <Text style={styles.title}>Perfil</Text>

      {imageSource && (
        <Image source={imageSource} style={styles.profileImage} />
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.data}>
          {userData.name} {userData.lastName}
        </Text>

        {userData.username && (
          <>
            <Text style={styles.label}>Usuario:</Text>
            <Text style={styles.data}>{userData.username}</Text>
          </>
        )}

        {userData.email && (
          <>
            <Text style={styles.label}>Correo:</Text>
            <Text style={styles.data}>{userData.email}</Text>
          </>
        )}

        {userData.phone && (
          <>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.data}>{userData.phone}</Text>
          </>
        )}

        {userData.age && (
          <>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.data}>{userData.age}</Text>
          </>
        )}

        {userData.birthDate && (
          <>
            <Text style={styles.label}>Fecha de nacimiento:</Text>
            <Text style={styles.data}>{userData.birthDate}</Text>
          </>
        )}

        {userData.houseNumber && (
          <>
            <Text style={styles.label}>Número de casa:</Text>
            <Text style={styles.data}>{userData.houseNumber}</Text>
          </>
        )}
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
    backgroundColor: "#F0F0F0",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 999,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#E96443",
    marginTop: 30,
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginTop: 20,
    marginBottom: 30,
    borderColor: "#E96443",
    borderWidth: 2,
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
  logoutButton: {
    backgroundColor: "#E96443",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "80%",
    marginBottom: 30,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ProfileScreen;
