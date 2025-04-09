import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Platform, SafeAreaView, StatusBar, Image, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getItem } from "../../config/Storage"
import { useEffect, useState } from "react"

const GuardScreen = ({ navigation }) => {
  const [guardName, setGuardName] = useState("")

  useEffect(() => {
    const loadUserData = async () => {
      const name = await getItem("name")
      setGuardName(name || "")
    }
    loadUserData()
  }, [])

  const mainOptions = [
    {
      title: "Escanear QR",
      icon: "qr-code-outline",
      screen: "ScanQrScreen",
      color: "#E96443",
      description: "Escanea códigos QR de visitantes",
    },
    {
      title: "Lista de Trabajadores",
      icon: "people-outline",
      screen: "WorkersListGuardScreen",
      color: "#388E3C",
      description: "Ver trabajadores registrados",
    },
  ]

  const profileOption = {
    title: "Mi Perfil",
    icon: "person-circle-outline",
    screen: "ProfileScreen",
    color: "#1976D2",
    description: "Ver y editar información personal",
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require("../../../assets/guardia_welcome.png")} style={styles.headerImage} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeSmall}>Bienvenido</Text>
            <Text style={styles.welcomeName}>{guardName}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.roleText}>Guardia</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acciones rápidas</Text>

        <View style={styles.cardsContainer}>
          {mainOptions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={32} color={item.color} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#bbb" style={styles.cardArrow} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Mi cuenta</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate(profileOption.screen)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${profileOption.color}20` }]}>
            <Ionicons name={profileOption.icon} size={32} color={profileOption.color} />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{profileOption.title}</Text>
            <Text style={styles.cardDescription}>{profileOption.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#bbb" style={styles.cardArrow} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  headerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#E96443",
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeSmall: {
    fontSize: 14,
    color: "#666",
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E96443",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 30,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    padding: 16,
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
    marginHorizontal: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#666",
  },
  cardArrow: {
    marginLeft: 10,
  },
})

export default GuardScreen