import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
} from 'react-native';
import { getItem } from '../config/Storage';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const API_URL = 'http://192.168.0.40:8080';

const VisitsListScreen = () => {
  const [visits, setVisits] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    fetchVisits();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchVisits = async () => {
    const token = await getItem('token');
    const response = await fetch(`${API_URL}/resident/visits`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    // Orden descendente
    const sorted = data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    setVisits(sorted);
  };

  const isPast = (date) => moment(date).isBefore(moment());

  const renderItem = ({ item }) => {
    const visitDate = moment(item.dateTime).format('DD/MM/YYYY');
    const visitTime = moment(item.dateTime).format('hh:mm A');
    const past = isPast(item.dateTime);
    const hasQR = item.qrCode !== null;

    return (
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            backgroundColor: past ? '#d3d3d3' : '#fcdcd1',
          },
        ]}
      >
        <Text style={styles.title}>VISITA</Text>
        <View style={styles.row}>
          <Text style={styles.date}>{visitDate}</Text>
          <Text style={styles.time}>{visitTime}</Text>
        </View>

        {hasQR && (
          <Text style={styles.qrNotice}>✅ Código QR generado</Text>
        )}

        <TouchableOpacity
          style={[
            styles.qrButton,
            {
              backgroundColor: past ? '#808080' : '#4BB543',
            },
          ]}
          disabled={past}
          onPress={() =>
            navigation.navigate('VisitQrScreen', { visit: item })
          }
        >
          <Text style={styles.qrText}>
            {past ? 'Expirada' : 'Ver QR'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {visits.length === 0 ? (
        <Text style={styles.emptyText}>No tienes visitas registradas aún.</Text>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  card: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: '#333',
  },
  time: {
    fontSize: 16,
    color: '#333',
  },
  qrNotice: {
    fontSize: 14,
    marginBottom: 8,
    color: 'green',
    fontWeight: 'bold',
  },
  qrButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  qrText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default VisitsListScreen;
