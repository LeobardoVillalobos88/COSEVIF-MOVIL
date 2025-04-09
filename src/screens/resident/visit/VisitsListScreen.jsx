import { useState, useCallback } from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Animated, ActivityIndicator, SafeAreaView, StatusBar } from "react-native"
import { getItem } from "../../../config/Storage"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import moment from "moment"
import Toast from "react-native-toast-message"
import { Ionicons } from "@expo/vector-icons"
import AwesomeAlert from "react-native-awesome-alerts"
import { API_URL } from "../../../config/IP"

const VisitsListScreen = () => {
  const [visits, setVisits] = useState([])
  const [fadeAnim] = useState(new Animated.Value(0))
  const [alertVisible, setAlertVisible] = useState(false)
  const [selectedVisitId, setSelectedVisitId] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigation = useNavigation()

  useFocusEffect(
    useCallback(() => {
      fetchVisits()
    }, []),
  )

  const fetchVisits = async () => {
    try {
      setLoading(true)
      const token = await getItem("token")
      const response = await fetch(`${API_URL}/resident/visits`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        setVisits(sorted)

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start()
      }
    } catch (error) {
      console.error("Error fetching visits:", error)
      Toast.show({
        type: "error",
        text1: "Error al cargar visitas",
        text2: "No se pudieron obtener las visitas",
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmDeleteVisit = (visitId) => {
    setSelectedVisitId(visitId)
    setAlertVisible(true)
  }

  const handleDeleteVisit = async () => {
    try {
      const token = await getItem("token")
      const res = await fetch(`${API_URL}/resident/visit/${selectedVisitId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Visita eliminada correctamente",
        })
        fetchVisits()
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
      setSelectedVisitId(null)
    }
  }

  const isPast = (date) => moment(date).isBefore(moment())

  const getStatusInfo = (item) => {
    const past = isPast(item.dateTime)
    const hasQR = item.qrCode !== null && item.qrCode !== ""

    if (past) {
      return {
        icon: "time-outline",
        label: "Visita pasada",
        color: "#888888",
        bgColor: "#f5f5f5",
      }
    } else {
      return {
        icon: "checkmark-circle-outline",
        label: "Visita activa",
        color: "#4BB543",
        bgColor: "#edf7ed",
      }
    }
  }

  const renderItem = ({ item }) => {
    const visitDate = moment(item.dateTime).format("DD/MM/YYYY")
    const visitTime = moment(item.dateTime).format("hh:mm A")
    const statusInfo = getStatusInfo(item)
    const dayName = moment(item.dateTime).format("dddd")
    const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1)
    const past = isPast(item.dateTime)
    const hasQR = item.qrCode !== null && item.qrCode !== ""

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>

          {hasQR && (
            <View style={styles.qrBadge}>
              <Ionicons name="qr-code-outline" size={14} color="#4BB543" />
              <Text style={styles.qrBadgeText}>QR generado</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.visitorInfo}>
            <Text style={styles.visitorName} numberOfLines={1} ellipsizeMode="tail">
              {item.visitorName}
            </Text>
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.dateText}>
                  {formattedDayName}, {visitDate}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.timeText}>{visitTime}</Text>
              </View>
            </View>
            {item.vehiclePlate && (
              <View style={styles.plateContainer}>
                <Ionicons name="car-outline" size={16} color="#666" />
                <Text style={styles.plateText}>{item.vehiclePlate}</Text>
              </View>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, past && styles.disabledActionButton]}
              onPress={() => !past && navigation.navigate("VisitQrScreen", { visit: item })}
              disabled={past}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: past ? "#f5f5f5" : "#edf7ed" }]}>
                <Ionicons name="qr-code-outline" size={20} color={past ? "#bdbdbd" : "#4BB543"} />
              </View>
              <Text style={[styles.actionText, past && styles.disabledActionText]}>QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, past && styles.disabledActionButton]}
              onPress={() => !past && navigation.navigate("VisitDetailsScreen", { visit: item })}
              disabled={past}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: past ? "#f5f5f5" : "#e8f4fd" }]}>
                <Ionicons name="eye-outline" size={20} color={past ? "#bdbdbd" : "#2196F3"} />
              </View>
              <Text style={[styles.actionText, past && styles.disabledActionText]}>Ver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, past && styles.disabledActionButton]}
              onPress={() => !past && navigation.navigate("VisitEditScreen", { visit: item })}
              disabled={past}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: past ? "#f5f5f5" : "#fff8e1" }]}>
                <Ionicons name="pencil-outline" size={20} color={past ? "#bdbdbd" : "#FFA000"} />
              </View>
              <Text style={[styles.actionText, past && styles.disabledActionText]}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => confirmDeleteVisit(item.id)}>
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
      <Text style={styles.headerTitle}>Mis Visitas</Text>
    </View>
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>No hay visitas</Text>
      <Text style={styles.emptyText}>No tienes visitas registradas aún.</Text>
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
            data={visits}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
          />
        )}

        <AwesomeAlert
          show={alertVisible}
          title="¿Eliminar visita?"
          message="¿Estás seguro de que deseas eliminar esta visita?"
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
          onConfirmPressed={handleDeleteVisit}
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
    justifyContent: "space-between",
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
  qrBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4BB543",
  },
  qrBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4BB543",
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  visitorInfo: {
    marginBottom: 16,
  },
  visitorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: "row",
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  plateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  plateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
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

export default VisitsListScreen