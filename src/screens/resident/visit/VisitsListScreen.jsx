import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Animated, ActivityIndicator } from "react-native";
import { getItem } from "../../../config/Storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import AwesomeAlert from "react-native-awesome-alerts";
import { API_URL } from "../../../config/IP";

const VisitsListScreen = () => {
  const [visits, setVisits] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchVisits();
    }, [])
  );

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const token = await getItem("token");
      const response = await fetch(`${API_URL}/resident/visits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        const sorted = data.sort(
          (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
        );
        setVisits(sorted);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteVisit = (visitId) => {
    setSelectedVisitId(visitId);
    setAlertVisible(true);
  };

  const handleDeleteVisit = async () => {
    try {
      const token = await getItem("token");
      const res = await fetch(`${API_URL}/resident/visit/${selectedVisitId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Visita eliminada correctamente",
        });
        fetchVisits();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "No se pudo eliminar",
        text2: err.message,
      });
    } finally {
      setAlertVisible(false);
      setSelectedVisitId(null);
    }
  };

  const isPast = (date) => moment(date).isBefore(moment());

  const renderItem = ({ item }) => {
    const visitDate = moment(item.dateTime).format("DD/MM/YYYY");
    const visitTime = moment(item.dateTime).format("hh:mm A");
    const past = isPast(item.dateTime);
    const hasQR = item.qrCode !== null && item.qrCode !== "";

    return (
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            backgroundColor: past ? "#d3d3d3" : "#fcdcd1",
          },
        ]}
      >
        <Text style={styles.title}>VISITA</Text>
        <View style={styles.row}>
          <Text style={styles.date}>{visitDate}</Text>
          <Text style={styles.time}>{visitTime}</Text>
        </View>

        {hasQR && <Text style={styles.qrNotice}>✅ Código QR generado</Text>}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate("VisitQrScreen", { visit: item })
            }
          >
            <Ionicons name="qr-code-outline" size={24} color="#4BB543" />
            <Text style={styles.iconLabel}>QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate("VisitDetailsScreen", { visit: item })
            }
          >
            <Ionicons name="eye-outline" size={24} color="#2196F3" />
            <Text style={styles.iconLabel}>Ver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate("VisitEditScreen", { visit: item })
            }
          >
            <Ionicons name="pencil-outline" size={24} color="#FFA000" />
            <Text style={styles.iconLabel}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => confirmDeleteVisit(item.id)}
          >
            <Ionicons name="trash-outline" size={24} color="#D32F2F" />
            <Text style={styles.iconLabel}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E96443" />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E96443" />
        </View>
      ) : visits.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No tienes visitas registradas aún.</Text>
        </View>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 100 }}
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
        overlayStyle={{ backgroundColor: "transparent" }}
        onCancelPressed={() => setAlertVisible(false)}
        onConfirmPressed={handleDeleteVisit}
      />
    </View>
  );
};

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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  card: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: "#333",
  },
  time: {
    fontSize: 16,
    color: "#333",
  },
  qrNotice: {
    fontSize: 14,
    marginBottom: 8,
    color: "green",
    fontWeight: "bold",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  iconButton: {
    alignItems: "center",
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default VisitsListScreen;