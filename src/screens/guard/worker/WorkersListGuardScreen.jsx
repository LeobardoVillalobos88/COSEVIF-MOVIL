import React, { useState } from "react";
import {
  View,
  Text,
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
import { API_URL } from "../../../config/IP";

const WorkersListGuardScreen = () => {
  const [workers, setWorkers] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
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
      const response = await fetch(`${API_URL}/admin/guards`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setWorkers(data);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error("Error fetching worker list:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const { workerName, age, address, visitDate, houseNumber } = item;
    const date = moment(visitDate).format("DD/MM/YYYY");
    const time = moment(visitDate).format("hh:mm A");

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.title}>TRABAJADOR</Text>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{workerName}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Casa:</Text>
            <Text style={styles.value}>{houseNumber}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.value}>{age}</Text>
          </View>
          <View style={{ flex: 2 }}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>{address}</Text>
          </View>
        </View>

        <Text style={styles.label}>Fecha y hora:</Text>
        <Text style={styles.value}>{`${date} - ${time}`}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
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
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
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
});

export default WorkersListGuardScreen;