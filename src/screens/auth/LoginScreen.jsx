import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, ActivityIndicator} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { login } from "../../config/Api";
import Toast from "react-native-toast-message";

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(""); // puede ser email o phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await login(identifier, password);

      if (data && data.role === "RESIDENT") {
        Toast.show({
          type: "success",
          text1: "¡Bienvenido!",
          text2: "Redirigiendo...",
        });
        setTimeout(() => {
          navigation.replace("SplashWelcomeResident");
        }, 1000);
      } else if (data && data.role === "GUARDIA") {
        Toast.show({
          type: "success",
          text1: "¡Bienvenido guardia!",
          text2: "Accediendo al panel...",
        });
        setTimeout(() => {
          navigation.replace("SplashWelcomeGuard");
        }, 1000);
      } else {
        Toast.show({
          type: "error",
          text1: "Acceso denegado",
          text2: "No tienes acceso móvil",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Credenciales incorrectas",
        text2: "Por favor, verifique sus credenciales",
      });
      setTimeout(() => {
        Toast.hide();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/login_bg.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Bienvenido a COSEVIF</Text>

          <Text style={styles.label}>Correo o número de telefono</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#fff"
              style={styles.icon}
            />
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Correo o número"
              placeholderTextColor="#ccc"
              style={styles.input}
              keyboardType="default"
              autoCapitalize="none"
            />
          </View>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="key-outline"
              size={20}
              color="#fff"
              style={styles.icon}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword}
              style={styles.input}
              keyboardType="default"
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {loading && (
            <ActivityIndicator
              size="large"
              color="#E96443"
              style={{ marginBottom: 10 }}
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
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
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 30,
  },
  label: {
    alignSelf: "flex-start",
    color: "#fff",
    marginBottom: 5,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#E96443",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;
