import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { AsyncStorage } from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8080/auth/resident/login", {
        username,
        password,
      });

      if (response.status === 200) {
        const { token } = response.data;
        await AsyncStorage.setItem("token", token);  // Guardar token en AsyncStorage
        navigation.replace("ResidentScreen");  // Redirigir al residente
      }
    } catch (error) {
      Alert.alert("Error", "Los datos son incorrectos o el usuario no existe.");
    }
  };

  return (
    <ImageBackground source={require("../../assets/login_bg.png")} style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Bienvenido a COSEVIF</Text>

          <Text style={styles.label}>Correo o Teléfono</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#fff" style={styles.icon} />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Correo o Teléfono"
              placeholderTextColor="#ccc"
              style={styles.input}
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="key-outline" size={20} color="#fff" style={styles.icon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // Asegura que la imagen ocupe todo el fondo
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Agregar una capa de fondo oscuro para que el contenido sea legible
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fondo oscuro para que el contenido resalte
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 28, // Aumento el tamaño del título
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20, // Separa el título de los siguientes elementos
  },
  subtitle: {
    fontSize: 16, // Aumento ligeramente el tamaño del subtítulo
    color: "#ccc",
    marginBottom: 30, // Añadí más espacio entre el subtítulo y los campos de entrada
  },
  label: {
    alignSelf: "flex-start",
    color: "#fff",
    marginBottom: 5,
    fontSize: 14, // Establece un tamaño consistente para las etiquetas
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Fondo claro pero semi-transparente para los campos
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20, // Aumenté el espacio entre los campos
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 12,
    fontSize: 16, // Aumenté ligeramente el tamaño de la fuente
  },
  button: {
    backgroundColor: "#E96443", // Mantengo el color de botón
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18, // Aumenté el tamaño del texto en el botón
    fontWeight: "bold",
  },
});

export default LoginScreen;
