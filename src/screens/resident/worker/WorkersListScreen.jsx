import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { getItem } from "../../../config/Storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import AwesomeAlert from "react-native-awesome-alerts";
import { API_URL } from "../../../config/IP";

const WorkersListScreen = () => {
  const [workers, setWorkers] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchWorkers();
    }, [])
  );

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const token = await getItem("token");
      const response = await fetch(`${API_URL}/resident/workerVisits`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        const sorted = data.sort(
          (a, b) => new Date(b.visit.dateTime) - new Date(a.visit.dateTime)
        );
        setWorkers(sorted);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error("Error fetching worker visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteWorker = (id) => {
    setSelectedWorkerId(id);
    setAlertVisible(true);
  };

  const handleDeleteWorker = async () => {
    try {
      const token = await getItem("token");
      const res = await fetch(
        `${API_URL}/resident/workerVisits/${selectedWorkerId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Trabajador eliminado correctamente",
        });
        fetchWorkers();
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
      setSelectedWorkerId(null);
    }
  };

  const renderItem = ({ item }) => {
    const { visit, houseNumber } = item;
    const date = moment(visit.dateTime).format("DD/MM/YYYY");
    const time = moment(visit.dateTime).format("hh:mm A");

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

        <Text style={styles.label}>Fecha y hora:</Text>
        <Text style={styles.value}>{`${date} - ${time}`}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate("WorkerEditScreen", { worker: item })
            }
          >
            <Ionicons name="pencil-outline" size={24} color="#FFA000" />
            <Text style={styles.iconLabel}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => confirmDeleteWorker(visit.id)}
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
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={28} color="#E96443" />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E96443" />
        </View>
      ) : workers.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No hay trabajadores registrados aún.</Text>
        </View>
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item) => item.visit.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 100 }}
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
        overlayStyle={{ backgroundColor: "transparent" }}
        onCancelPressed={() => setAlertVisible(false)}
        onConfirmPressed={handleDeleteWorker}
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  iconButton: {
    alignItems: "center",
    marginLeft: 25,
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default WorkersListScreen;
