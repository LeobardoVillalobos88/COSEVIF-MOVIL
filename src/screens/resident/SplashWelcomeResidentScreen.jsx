import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Image, ImageBackground, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashWelcomeScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadName = async () => {
      const storedName = await AsyncStorage.getItem("name");
      if (storedName) setName(storedName);
    };

    loadName();

    // Animación de opacidad
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace("ResidentStack");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={require("../../../assets/login_bg.png")}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          Bienvenido residente
        </Animated.Text>

        <Animated.Text style={[styles.username, { opacity: fadeAnim }]}>
          {name}
        </Animated.Text>

        <Animated.Image
          source={require("../../../assets/residente_welcome.png")}
          style={[styles.image, { opacity: fadeAnim }]}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    color: "#E96443",
    marginBottom: 30,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 15,
  },
});

export default SplashWelcomeScreen;
