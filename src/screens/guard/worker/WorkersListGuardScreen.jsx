import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Animated, ActivityIndicator, SafeAreaView, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import "moment/locale/es" // Añadir esta línea
import { Ionicons } from "@expo/vector-icons"

const WorkersListGuardScreen = () => {
  const [workers, setWorkers] = useState([])
  const [fadeAnim] = useState(new Animated.Value(0))
  const [loading, setLoading] = useState(true)

  const navigation = useNavigation()

  // Simular carga de datos con un temporizador
  useEffect(() => {
    const timer = setTimeout(() => {
      // Ordenar por fecha más reciente
      const sorted = [...MOCK_WORKERS].sort((a, b) => new Date(b.visit.dateTime) - new Date(a.visit.dateTime))
      setWorkers(sorted)

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()

      setLoading(false)
    }, 1500) // Simular tiempo de carga de 1.5 segundos

    return () => clearTimeout(timer)
  }, [])

  const renderItem = ({ item }) => {
    const { visit, residentName, houseNumber } = item
    const date = moment(visit.dateTime).format("DD/MM/YYYY")
    const time = moment(visit.dateTime).format("hh:mm A")
    const isPast = moment(visit.dateTime).isBefore(moment())
    moment.locale("es")
    const formattedDayName = moment(visit.dateTime).format("dddd")
    const capitalizedDayName = formattedDayName.charAt(0).toUpperCase() + formattedDayName.slice(1)

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={[styles.statusBadge, { backgroundColor: isPast ? "#f5f5f5" : "#edf7ed" }]}>
          <Ionicons
            name={isPast ? "time-outline" : "construct-outline"}
            size={16}
            color={isPast ? "#888888" : "#4BB543"}
          />
          <Text style={[styles.statusText, { color: isPast ? "#888888" : "#4BB543" }]}>
            {isPast ? "Visita pasada" : "Trabajador activo"}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName} numberOfLines={1} ellipsizeMode="tail">
              {visit.workerName}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.infoText}>
                  {capitalizedDayName}, {date}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.infoText}>{time}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.infoText}>{visit.age} años</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="home-outline" size={16} color="#666" />
                <Text style={styles.infoText}>Casa: {houseNumber}</Text>
              </View>
            </View>

            <View style={styles.residentContainer}>
              <Ionicons name="person-circle-outline" size={16} color="#666" />
              <Text style={styles.residentText}>Residente: {residentName}</Text>
            </View>

            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.addressText} numberOfLines={2}>
                {visit.address}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#E96443" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trabajadores Registrados</Text>
          <Text style={styles.headerSubtitle}>Vista de Guardia</Text>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#E96443" />
            <Text style={styles.loadingText}>Cargando trabajadores...</Text>
          </View>
        ) : (
          <FlatList
            data={workers}
            keyExtractor={(item) => item.visit.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="construct-outline" size={80} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No hay trabajadores</Text>
                <Text style={styles.emptyText}>No hay trabajadores registrados actualmente.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const MOCK_WORKERS = [
  {
    visit: {
      id: "1",
      workerName: "Juan Pérez Gómez",
      age: 34,
      address: "Calle Hidalgo #123, Col. Centro",
      dateTime: "2025-04-05T09:30:00",
    },
    residentName: "Ulises López",
    houseNumber: 42,
  },
  {
    visit: {
      id: "2",
      workerName: "Roberto Sánchez López",
      age: 28,
      address: "Av. Revolución #567, Col. Moderna",
      dateTime: "2025-04-06T14:15:00",
    },
    residentName: "Angela Aguilar",
    houseNumber: 15,
  },
  {
    visit: {
      id: "3",
      workerName: "Miguel Ángel Sanchez",
      age: 45,
      address: "Calle Pino Suárez #89, Col. Reforma",
      dateTime: "2025-04-07T10:00:00",
    },
    residentName: "Arantza García",
    houseNumber: 23,
  },
  {
    visit: {
      id: "4",
      workerName: "Luis Ramírez Torres",
      age: 31,
      address: "Av. Universidad #1245, Col. Del Valle",
      dateTime: "2025-04-08T08:45:00",
    },
    residentName: "Sofía Martínez",
    houseNumber: 8,
  },
  {
    visit: {
      id: "5",
      workerName: "Fernando Ortiz Vega",
      age: 39,
      address: "Calle Morelos #456, Col. Juárez",
      dateTime: "2025-04-08T16:30:00",
    },
    residentName: "Javier Fernández",
    houseNumber: 37,
  },
]

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 15,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    marginTop: -30,
    marginBottom: 10,
    alignItems: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  workerInfo: {
    marginBottom: 8,
  },
  workerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  residentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  residentText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
})

export default WorkersListGuardScreen