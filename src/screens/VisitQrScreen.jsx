import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import * as Sharing from "expo-sharing";

const VisitQrScreen = ({ route }) => {
  const { visit } = route.params;

  // Convierte Base64 a archivo físico y lo guarda en la galería
  const handleDownload = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Permiso denegado",
          text2: "Activa el permiso para guardar imágenes.",
        });
        return;
      }

      // Extraer Base64 limpio
      const base64 = visit.qrCode.replace(/^data:image\/png;base64,/, "");
      const filename = `${FileSystem.documentDirectory}qr_${Date.now()}.png`;

      await FileSystem.writeAsStringAsync(filename, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.saveToLibraryAsync(filename);

      Toast.show({
        type: "success",
        text1: "QR guardado",
        text2: "Se ha guardado en tu galería.",
      });
    } catch (error) {
      console.error("Error al guardar QR:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo guardar el QR.",
      });
    }
  };

  // Compartir la imagen del QR generada
  const handleShare = async () => {
    try {
      const base64 = visit.qrCode.replace(/^data:image\/png;base64,/, "");
      const path = `${FileSystem.cacheDirectory}qr_to_share.png`;
  
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Toast.show({
          type: "error",
          text1: "No disponible",
          text2: "No se puede compartir en este dispositivo.",
        });
        return;
      }
  
      await Sharing.shareAsync(path, {
        mimeType: "image/png",
        dialogTitle: "Compartir QR de visita",
      });
    } catch (error) {
      console.error("Error al compartir QR:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo compartir el QR.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR DE VISITA</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Fecha:{" "}
          {new Date(visit.dateTime).toLocaleDateString("es-MX", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Text style={styles.infoText}>
          Hora:{" "}
          {new Date(visit.dateTime).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      <Image
        source={{ uri: visit.qrCode }}
        style={styles.qrImage}
        resizeMode="contain"
      />

      <View style={styles.iconRow}>
        <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
          <Ionicons name="share-social-outline" size={30} color="#E96443" />
          <Text style={styles.iconText}>Compartir</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDownload} style={styles.iconButton}>
          <Ionicons name="download-outline" size={30} color="#E96443" />
          <Text style={styles.iconText}>Descargar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 50,
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#E96443",
  },
  infoContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  qrImage: {
    width: 260,
    height: 260,
    borderRadius: 16,
    marginVertical: 30,
    borderWidth: 2,
    borderColor: "#E96443",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  iconButton: {
    alignItems: "center",
  },
  iconText: {
    color: "#E96443",
    marginTop: 5,
    fontWeight: "bold",
  },
});

export default VisitQrScreen;
