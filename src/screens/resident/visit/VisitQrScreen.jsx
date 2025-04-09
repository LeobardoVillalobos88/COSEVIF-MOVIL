import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as MediaLibrary from "expo-media-library"
import * as FileSystem from "expo-file-system"
import Toast from "react-native-toast-message"
import * as Sharing from "expo-sharing"
import { useNavigation } from "@react-navigation/native"

const VisitQrScreen = ({ route }) => {
  const { visit } = route.params
  const navigation = useNavigation()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const permission = await MediaLibrary.requestPermissionsAsync()
      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Permiso denegado",
          text2: "Activa el permiso para guardar imágenes.",
        })
        setIsDownloading(false)
        return
      }

      if (!visit.qrCode) {
        Toast.show({
          type: "error",
          text1: "QR no disponible",
          text2: "No hay QR para descargar.",
        })
        setIsDownloading(false)
        return
      }

      const base64 = visit.qrCode.replace(/^data:image\/png;base64,/, "")
      const filename = `${FileSystem.documentDirectory}qr_${Date.now()}.png`

      await FileSystem.writeAsStringAsync(filename, base64, {
        encoding: FileSystem.EncodingType.Base64,
      })

      await MediaLibrary.saveToLibraryAsync(filename)

      Toast.show({
        type: "success",
        text1: "QR guardado",
        text2: "Se ha guardado en tu galería.",
      })
    } catch (error) {
      console.error("Error al guardar QR:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo guardar el QR.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      if (!visit.qrCode) {
        Toast.show({
          type: "error",
          text1: "QR no disponible",
          text2: "No hay QR para compartir.",
        })
        setIsSharing(false)
        return
      }
      const base64 = visit.qrCode.replace(/^data:image\/png;base64,/, "")
      const path = `${FileSystem.cacheDirectory}qr_to_share.png`

      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const available = await Sharing.isAvailableAsync()
      if (!available) {
        Toast.show({
          type: "error",
          text1: "No disponible",
          text2: "No se puede compartir en este dispositivo.",
        })
        setIsSharing(false)
        return
      }

      await Sharing.shareAsync(path, {
        mimeType: "image/png",
        dialogTitle: "Compartir QR de visita",
      })
    } catch (error) {
      console.error("Error al compartir QR:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo compartir el QR.",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#E96443" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Código QR de Visita</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color="#E96443" />
            <Text style={styles.cardTitle}>Información de la Visita</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#E96443" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>{formatDate(visit.dateTime)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#E96443" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Hora</Text>
                <Text style={styles.infoValue}>{formatTime(visit.dateTime)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={20} color="#E96443" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Visitante</Text>
                <Text style={styles.infoValue}>{visit.visitorName}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="car-outline" size={20} color="#E96443" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Placas</Text>
                <Text style={styles.infoValue}>{visit.vehiclePlate || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={20} color="#E96443" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Personas</Text>
                <Text style={styles.infoValue}>{visit.numPeople}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="document-text-outline" size={20} color="#E96443" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Descripción</Text>
                <Text style={styles.infoValue}>{visit.description || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="key-outline" size={20} color="#E96443" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Contraseña</Text>
                <Text style={styles.infoValue}>{visit.password || "Ninguna"}</Text>
              </View>
            </View>
          </View>
        </View>

        {visit.qrCode ? (
          <View style={styles.qrContainer}>
            <View style={styles.qrCard}>
              <Image source={{ uri: visit.qrCode }} style={styles.qrImage} resizeMode="contain" />
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                onPress={handleShare}
                style={[styles.actionButton, isSharing && styles.disabledButton]}
                disabled={isSharing}
              >
                {isSharing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="share-social-outline" size={22} color="#fff" />
                    <Text style={styles.actionButtonText}>Compartir</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDownload}
                style={[styles.actionButton, isDownloading && styles.disabledButton]}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={22} color="#fff" />
                    <Text style={styles.actionButtonText}>Descargar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noQrContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#E96443" />
            <Text style={styles.noQRText}>El código QR aún no está disponible</Text>
            <Text style={styles.noQRSubText}>
              El código QR se generará automáticamente cuando la visita sea aprobada
            </Text>
          </View>
        )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    padding: 5,
  },
  scrollContainer: {
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
  infoGrid: {
    flexDirection: "column",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  qrImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E96443",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#E96443",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 140,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  noQrContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  noQRText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  noQRSubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
})

export default VisitQrScreen;