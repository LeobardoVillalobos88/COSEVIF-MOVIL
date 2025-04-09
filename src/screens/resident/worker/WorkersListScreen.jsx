import { useState, useCallback } from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Animated, ActivityIndicator, SafeAreaView, StatusBar } from "react-native"
import { getItem } from "../../../config/Storage"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import moment from "moment"
import "moment/locale/es" // Añadir esta línea
import Toast from "react-native-toast-message"
import { Ionicons } from "@expo/vector-icons"
import AwesomeAlert from "react-native-awesome-alerts"
import { API_URL } from "../../../config/IP"

const WorkersListScreen = () => {
  const [workers, setWorkers] = useState([])
  const [fadeAnim] = useState(new Animated.Value(0))
  const [alertVisible, setAlertVisible] = useState(false)
  const [selectedWorkerId, setSelectedWorkerId] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigation = useNavigation()

  useFocusEffect(
    useCallback(() => {
      fetchWorkers()
    }, []),
  )

  const fetchWorkers = async () => {
    try {
      setLoading(true)
      const token = await getItem("token")
      const response = await fetch(`${API_URL}/resident/workerVisits`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => new Date(b.visit.dateTime) - new Date(a.visit.dateTime))
        setWorkers(sorted)

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start()
      }
    } catch (error) {
      console.error("Error fetching worker visits:", error)
      Toast.show({
        type: "error",
        text1: "Error al cargar trabajadores",
        text2: "No se pudieron obtener los trabajadores",
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmDeleteWorker = (id) => {
    setSelectedWorkerId(id)
    setAlertVisible(true)
  }

  const handleDeleteWorker = async () => {
    try {
      const token = await getItem("token")
      const res = await fetch(`${API_URL}/resident/workerVisits/${selectedWorkerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Trabajador eliminado correctamente",
        })
        fetchWorkers()
      } else {
        throw new Error("Error al eliminar")
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "No se pudo eliminar",
        text2: err.message,
      })
    } finally {
      setAlertVisible(false)
      setSelectedWorkerId(null)
    }
  }

  const renderItem = ({ item }) => {
    const { visit, houseNumber } = item
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

            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.addressText} numberOfLines={2}>
                {visit.address}
              </Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, isPast && styles.disabledActionButton]}
              onPress={() => !isPast && navigation.navigate("WorkerEditScreen", { worker: item })}
              disabled={isPast}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: isPast ? "#f5f5f5" : "#fff8e1" }]}>
                <Ionicons name="pencil-outline" size={20} color={isPast ? "#bdbdbd" : "#FFA000"} />
              </View>
              <Text style={[styles.actionText, isPast && styles.disabledActionText]}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => confirmDeleteWorker(visit.id)}>
              <View style={[styles.actionIconContainer, { backgroundColor: "#feebee" }]}>
                <Ionicons name="trash-outline" size={20} color="#D32F2F" />
              </View>
              <Text style={styles.actionText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    )
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Mis Trabajadores</Text>
    </View>
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>No hay trabajadores</Text>
      <Text style={styles.emptyText}>No tienes trabajadores registrados aún.</Text>
    </View>
  )

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

        {renderHeader()}

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#E96443" />
          </View>
        ) : (
          <FlatList
            data={workers}
            keyExtractor={(item) => item.visit.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
          />
        )}

        <AwesomeAlert
          show={alertVisible}
          title="¿Eliminar trabajador?"
          message="¿Estás seguro de que deseas eliminar esta visita de trabajador?"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={true}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText="Cancelar"
          confirmText="Eliminar"
          confirmButtonColor="#D32F2F"
          cancelButtonColor="#aaa"
          overlayStyle={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          titleStyle={{ color: "#333", fontSize: 20, fontWeight: "bold" }}
          messageStyle={{ color: "#666", fontSize: 16 }}
          onCancelPressed={() => setAlertVisible(false)}
          onConfirmPressed={handleDeleteWorker}
        />
      </View>
    </SafeAreaView>
  )
}

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
    top: 20,
    left: 20,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#E96443",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E96443",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
    marginBottom: 16,
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
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    gap: 20,
  },
  actionButton: {
    alignItems: "center",
  },
  disabledActionButton: {
    opacity: 0.5,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#666",
  },
  disabledActionText: {
    color: "#bdbdbd",
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#E96443",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#E96443",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default WorkersListScreen