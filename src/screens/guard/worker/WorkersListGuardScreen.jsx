import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Animated, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { Ionicons } from "@expo/vector-icons"

const MOCK_WORKERS = [
  {
    visit: {
      id: "1",
      workerName: "Juan Pérez Gómez",
      age: 34,
      address: "Calle Hidalgo #123, Col. Centro",
      dateTime: "2025-04-05T09:30:00",
    },
    residentName: "María Rodríguez",
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
    residentName: "Carlos Mendoza",
    houseNumber: 15,
  },
  {
    visit: {
      id: "3",
      workerName: "Miguel Ángel Hernández",
      age: 45,
      address: "Calle Pino Suárez #89, Col. Reforma",
      dateTime: "2025-04-07T10:00:00",
    },
    residentName: "Ana González",
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

const WorkersListGuardScreen = () => {
  const [workers, setWorkers] = useState([])
  const [fadeAnim] = useState(new Animated.Value(0))
  const [loading, setLoading] = useState(true)

  const navigation = useNavigation()

  // Simular carga de datos
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

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.title}>TRABAJADOR</Text>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{visit.workerName}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Casa:</Text>
            <Text style={styles.value}>{houseNumber}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.value}>{visit.age}</Text>
          </View>
          <View style={{ flex: 2 }}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>{visit.address}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Residente:</Text>
            <Text style={styles.value}>{residentName}</Text>
          </View>
        </View>

        <Text style={styles.label}>Fecha y hora:</Text>
        <Text style={styles.value}>{`${date} - ${time}`}</Text>
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
          keyExtractor={(item) => item.visit.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 120, paddingBottom: 100 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  header: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
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
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  card: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    backgroundColor: "#DFF6E2",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#333",
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#555",
  },
  value: {
    fontSize: 15,
    marginBottom: 6,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
})

export default WorkersListGuardScreen;
