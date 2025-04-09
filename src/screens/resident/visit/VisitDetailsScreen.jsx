import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const { width } = Dimensions.get("window")

const VisitDetailsScreen = ({ route }) => {
  const { visit } = route.params
  const navigation = useNavigation()

  // Formatear fecha y hora de manera más legible
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString("es-ES", options)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#E96443" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalles de la Visita</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color="#E96443" />
            <Text style={styles.cardTitle}>Información de la Visita</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#E96443" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Fecha</Text>
                <Text style={styles.value}>{formatDate(visit.dateTime)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={20} color="#E96443" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Hora</Text>
                <Text style={styles.value}>{formatTime(visit.dateTime)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color="#E96443" />
            <Text style={styles.cardTitle}>Información del Visitante</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color="#E96443" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Nombre</Text>
                <Text style={styles.value}>{visit.visitorName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="car-outline" size={20} color="#E96443" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Placas del vehículo</Text>
                <Text style={styles.value}>{visit.vehiclePlate || "N/A"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={20} color="#E96443" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Número de personas</Text>
                <Text style={styles.value}>{visit.numPeople}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color="#E96443" />
            <Text style={styles.cardTitle}>Detalles Adicionales</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text-outline" size={20} color="#E96443" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Descripción</Text>
                <Text style={styles.value}>{visit.description || "Ninguna"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="key-outline" size={20} color="#E96443" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <Text style={styles.value}>{visit.password || "Ninguna"}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 16,
  },
  infoBox: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 10,
    paddingTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
})

export default VisitDetailsScreen