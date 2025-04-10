import { useState, useEffect } from "react"
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Image, StatusBar, Dimensions } from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"
import { registerQrScan, getQrScanData } from "../../../config/QrScanData"

const { width } = Dimensions.get("window")

export default function ScanQrScreen() {
  const [facing, setFacing] = useState("back")
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [visitData, setVisitData] = useState(null)
  const [observations, setObservations] = useState("")
  const [status, setStatus] = useState("pending") // 'pending', 'in_progress', 'completed'
  const [trunkPhoto, setTrunkPhoto] = useState(null)
  const [platePhoto, setPlatePhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanAnimation, setScanAnimation] = useState(0)
  const [scanCount, setScanCount] = useState(0)

  // Modificar el estado del checklist para incluir el nuevo check de nombre
  const [checklist, setChecklist] = useState({
    nameMatch: false,
    peopleMatch: false,
    vehicleMatch: false,
    authorized: false,
  })

  // Animación de escaneo
  useEffect(() => {
    if (!scanned) {
      const interval = setInterval(() => {
        setScanAnimation((prev) => (prev >= 200 ? 0 : prev + 5))
      }, 50)
      return () => clearInterval(interval)
    }
  }, [scanned])

  // Solicitar permisos al montar el componente
  useEffect(() => {
    ;(async () => {
      await requestPermission()
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Se necesitan permisos de cámara para tomar fotos")
      }
    })()
  }, [])

  // Función para parsear los datos del QR
  const parseVisitData = (qrText) => {
    try {
      // Intentar parsear como JSON primero
      const jsonData = JSON.parse(qrText)
      return jsonData
    } catch (e) {
      // Si no es JSON, intentar parsear como texto formateado
      const lines = qrText.split("\n")
      const data = {}

      lines.forEach((line) => {
        if (line.includes("Casa:")) {
          data.houseId = line.split("Casa:")[1].trim()
        } else if (line.includes("Visitante:")) {
          data.visitorName = line.split("Visitante:")[1].trim()
        } else if (line.includes("Fecha y Hora:")) {
          data.visitDate = line.split("Fecha y Hora:")[1].trim()
        } else if (line.includes("Vehículo:")) {
          data.vehicle = line.split("Vehículo:")[1].trim()
        } else if (line.includes("Clave de acceso:")) {
          data.accessKey = line.split("Clave de acceso:")[1].trim()
        } else if (line.includes("Personas:")) {
          data.peopleCount = Number.parseInt(line.split("Personas:")[1].trim())
        } else if (line.includes("Descripción:")) {
          data.description = line.split("Descripción:")[1].trim()
        }
      })

      // Agregar un código QR único basado en los datos
      data.qrCode = `${data.houseId}-${data.visitorName}`.replace(/\s+/g, "-").toLowerCase()

      return data
    }
  }

  // Manejar escaneo de QR
  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true)
    setLoading(true)

    try {
      // Parsear datos del QR en formato de texto
      const parsedData = parseVisitData(data)

      // Validar que se hayan obtenido datos mínimos
      if (!parsedData.visitorName || !parsedData.houseId) {
        throw new Error("Datos incompletos")
      }

      // Obtener el código QR único
      const qrCode = parsedData.qrCode

      // Verificar si ya se ha escaneado este QR antes
      const existingData = await getQrScanData(qrCode)

      if (existingData && existingData.scanCount >= 2) {
        // Si ya se escaneó 2 veces, mostrar mensaje y no permitir más escaneos
        Alert.alert("QR ya procesado", "Este código QR ya ha sido escaneado 2 veces y está completado.", [
          { text: "OK", onPress: () => setScanned(false) },
        ])
        setLoading(false)
        return
      }

      // Registrar el escaneo
      const scanResult = await registerQrScan(qrCode)

      // Actualizar el estado según el resultado del escaneo
      setVisitData({
        ...parsedData,
        status: scanResult.status,
        scanCount: scanResult.scanCount,
      })

      setStatus(scanResult.status)
      setScanCount(scanResult.scanCount)

      setLoading(false)
    } catch (e) {
      setLoading(false)
      Alert.alert(
        "QR inválido",
        "El código escaneado no contiene datos de visita válidos.\n\nFormato esperado:\nVISITA REGISTRADA\nCasa: [ID]\nVisitante: [Nombre]...",
        [{ text: "OK", onPress: () => setScanned(false) }],
      )
    }
  }

  // Tomar foto de cajuela
  const takeTrunkPhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      })

      if (!result.canceled) {
        setLoading(true)
        // Simular procesamiento de imagen
        setTimeout(() => {
          setTrunkPhoto(result.assets[0].uri)
          setLoading(false)
        }, 1000)
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo tomar la foto. Intente nuevamente.")
    }
  }

  // Tomar foto de placas
  const takePlatePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      })

      if (!result.canceled) {
        setLoading(true)
        // Simular procesamiento de imagen
        setTimeout(() => {
          setPlatePhoto(result.assets[0].uri)
          setLoading(false)
        }, 1000)
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo tomar la foto. Intente nuevamente.")
    }
  }

  // Actualizar checklist
  const toggleChecklistItem = (item) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: !prev[item],
    }))
  }

  // Modificar la función canConfirm para que solo sea obligatorio el check de autorización
  const canConfirm = () => {
    // Solo verificar que la visita esté autorizada
    const isAuthorized = checklist.authorized

    // Verificar que se hayan tomado ambas fotos si es un vehículo
    const hasVehicle =
      visitData?.vehicle && visitData.vehicle.toLowerCase() !== "no" && visitData.vehicle.toLowerCase() !== "ninguno"
    const photosRequired = hasVehicle
    const hasPhotos = trunkPhoto && platePhoto

    return isAuthorized && (!photosRequired || hasPhotos)
  }

  // Finalizar proceso
  const finishProcess = () => {
    if (!canConfirm()) {
      Alert.alert(
        "Datos incompletos",
        "Por favor complete todas las verificaciones y tome las fotos requeridas antes de confirmar.",
        [{ text: "OK" }],
      )
      return
    }

    setLoading(true)

    // Simular envío al servidor
    setTimeout(() => {
      const visitRecord = {
        ...visitData,
        status,
        observations,
        checklist,
        trunkPhotoUri: trunkPhoto,
        platePhotoUri: platePhoto,
        processedAt: new Date().toISOString(),
      }

      console.log("Registro de visita:", visitRecord)
      setLoading(false)

      Alert.alert(
        "Proceso completado",
        status === "in_progress" ? "La visita ha sido registrada como en progreso." : "La visita ha sido completada.",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm()
            },
          },
        ],
      )
    }, 2000)
  }

  // Reiniciar formulario
  const resetForm = () => {
    setScanned(false)
    setVisitData(null)
    setObservations("")
    setStatus("pending")
    setScanCount(0)
    setTrunkPhoto(null)
    setPlatePhoto(null)
    setChecklist({
      nameMatch: false,
      peopleMatch: false,
      vehicleMatch: false,
      authorized: false,
    })
  }

  if (!permission) {
    return <View style={styles.container} />
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color="#007AFF" style={{ marginBottom: 20 }} />
        <Text style={styles.permissionText}>Necesitamos permisos para acceder a la cámara</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Otorgar Permisos</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Pantalla de escaneo
  if (!scanned) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>COSEVIF</Text>
              <Text style={styles.headerSubtitle}>Control de Acceso</Text>
            </View>

            <View style={styles.qrFrameContainer}>
              <View style={styles.qrFrame} />
              <View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanAnimation }],
                  },
                ]}
              />
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>

            <Text style={styles.overlayText}>Escanear código QR de visita</Text>
            <Text style={styles.overlaySubText}>Coloque el código QR dentro del marco</Text>

            <TouchableOpacity style={styles.flipButton} onPress={() => setFacing(facing === "back" ? "front" : "back")}>
              <Ionicons name="camera-reverse-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    )
  }

  // Pantalla de verificación
  return (
    <ScrollView contentContainerStyle={styles.verificationContainer}>
      <StatusBar barStyle="dark-content" />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E96443" />
          <Text style={styles.loadingText}>Procesando información...</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.verificationTitle}>
          {status === "in_progress" ? "REGISTRAR ENTRADA" : "REGISTRAR SALIDA"}
        </Text>
      </View>

      {/* Datos de la visita */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={22} color="#E96443" />
          <Text style={styles.sectionTitle}>Información de la visita</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Casa:</Text>
          <Text style={styles.dataValue}>{visitData?.houseId || "No especificado"}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Visitante:</Text>
          <Text style={styles.dataValue}>{visitData?.visitorName || "No especificado"}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Fecha y hora:</Text>
          <Text style={styles.dataValue}>{visitData?.visitDate || "No especificada"}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Vehículo:</Text>
          <Text style={styles.dataValue}>{visitData?.vehicle || "No registrado"}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>N° de personas:</Text>
          <Text style={styles.dataValue}>{visitData?.peopleCount || "0"}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Estado:</Text>
          <Text
            style={[
              styles.dataValue,
              {
                color: status === "pending" ? "#FFA000" : status === "in_progress" ? "#2196F3" : "#4BB543",
              },
            ]}
          >
            {status === "pending" ? "Pendiente" : status === "in_progress" ? "En progreso" : "Completado"}
          </Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Escaneos:</Text>
          <Text style={styles.dataValue}>{scanCount}/2</Text>
        </View>

        {visitData?.accessKey && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Clave de acceso:</Text>
            <Text style={[styles.dataValue, styles.accessKeyText]}>{visitData.accessKey}</Text>
          </View>
        )}

        {visitData?.description && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Descripción:</Text>
            <Text style={styles.dataValue}>{visitData.description}</Text>
          </View>
        )}
      </View>

      {/* Agregar el nuevo check de nombre y actualizar los textos de los checks existentes en la sección de verificación */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle" size={22} color="#E96443" />
          <Text style={styles.sectionTitle}>Verificación</Text>
        </View>

        <TouchableOpacity style={styles.checklistItem} onPress={() => toggleChecklistItem("nameMatch")}>
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, checklist.nameMatch && styles.checkboxChecked]}>
              {checklist.nameMatch && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checklistText}>Nombre del visitante coincide</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checklistItem} onPress={() => toggleChecklistItem("peopleMatch")}>
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, checklist.peopleMatch && styles.checkboxChecked]}>
              {checklist.peopleMatch && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checklistText}>Número de personas coincide (opcional)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checklistItem} onPress={() => toggleChecklistItem("vehicleMatch")}>
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, checklist.vehicleMatch && styles.checkboxChecked]}>
              {checklist.vehicleMatch && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checklistText}>Información del vehículo coincide (opcional)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checklistItem} onPress={() => toggleChecklistItem("authorized")}>
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, checklist.authorized && styles.checkboxChecked]}>
              {checklist.authorized && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={[styles.checklistText, styles.requiredField]}>Visita autorizada (obligatorio)</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Observaciones */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="create" size={22} color="#E96443" />
          <Text style={styles.sectionTitle}>Observaciones</Text>
        </View>
        <TextInput
          style={styles.observationsInput}
          multiline
          numberOfLines={4}
          placeholder="Ej: Llegaron 5 personas en lugar de 4..."
          value={observations}
          onChangeText={setObservations}
        />
      </View>

      {/* Captura de fotos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="camera" size={22} color="#E96443" />
          <Text style={styles.sectionTitle}>Evidencia fotográfica</Text>
        </View>

        <View style={styles.photoContainer}>
          <TouchableOpacity
            style={[styles.photoButton, trunkPhoto && styles.photoButtonTaken]}
            onPress={takeTrunkPhoto}
          >
            <Ionicons
              name={trunkPhoto ? "checkmark-circle" : "camera-outline"}
              size={24}
              color={trunkPhoto ? "#198754" : "#6c757d"}
            />
            <Text style={[styles.photoButtonText, trunkPhoto && styles.photoButtonTextTaken]}>
              {trunkPhoto ? "Foto de cajuela tomada" : "Tomar foto de cajuela"}
            </Text>
          </TouchableOpacity>

          {trunkPhoto && (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: trunkPhoto }} style={styles.photoPreview} />
              <TouchableOpacity style={styles.retakeButton} onPress={takeTrunkPhoto}>
                <Text style={styles.retakeButtonText}>Volver a tomar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.photoContainer}>
          <TouchableOpacity
            style={[styles.photoButton, platePhoto && styles.photoButtonTaken]}
            onPress={takePlatePhoto}
          >
            <Ionicons
              name={platePhoto ? "checkmark-circle" : "camera-outline"}
              size={24}
              color={platePhoto ? "#198754" : "#6c757d"}
            />
            <Text style={[styles.photoButtonText, platePhoto && styles.photoButtonTextTaken]}>
              {platePhoto ? "Foto de placas tomada" : "Tomar foto de placas"}
            </Text>
          </TouchableOpacity>

          {platePhoto && (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: platePhoto }} style={styles.photoPreview} />
              <TouchableOpacity style={styles.retakeButton} onPress={takePlatePhoto}>
                <Text style={styles.retakeButtonText}>Volver a tomar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {(!trunkPhoto || !platePhoto) &&
          visitData?.vehicle &&
          visitData.vehicle.toLowerCase() !== "no" &&
          visitData.vehicle.toLowerCase() !== "ninguno" && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={18} color="#dc3545" />
              <Text style={styles.photoWarning}>Fotos obligatorias para vehículos</Text>
            </View>
          )}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={resetForm}>
          <Ionicons name="close-circle-outline" size={20} color="white" style={{ marginRight: 5 }} />
          <Text style={styles.actionButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.confirmButton, !canConfirm() && styles.disabledButton]}
          onPress={finishProcess}
          disabled={!canConfirm() || loading}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{ marginRight: 5 }} />
          <Text style={styles.actionButtonText}>
            {status === "in_progress" ? "Confirmar entrada" : "Confirmar salida"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  // Mantener los estilos existentes...
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  permissionButton: {
    backgroundColor: "#E96443",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  header: {
    position: "absolute",
    top: 40,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "white",
    fontSize: 16,
    opacity: 0.8,
  },
  qrFrameContainer: {
    position: "relative",
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  scanLine: {
    position: "absolute",
    width: 230,
    height: 2,
    backgroundColor: "#E96443",
    top: 30,
  },
  cornerTL: {
    position: "absolute",
    top: 15,
    left: 15,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
    borderTopRightRadius: 10,
  },
  cornerBL: {
    position: "absolute",
    bottom: 15,
    left: 15,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    position: "absolute",
    bottom: 15,
    right: 15,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
    borderBottomRightRadius: 10,
  },
  overlayText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
  },
  overlaySubText: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
    marginTop: 10,
  },
  flipButton: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "rgba(233, 100, 67, 0.8)",
    padding: 15,
    borderRadius: 50,
  },
  verificationContainer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#E96443",
    fontWeight: "500",
  },
  verificationTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    marginTop: 10,
    color: "#E96443",
  },
  section: {
    marginBottom: 25,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e9ecef",
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  dataLabel: {
    fontSize: 16,
    color: "#495057",
    fontWeight: "600",
  },
  dataValue: {
    fontSize: 16,
    color: "#212529",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  accessKeyText: {
    fontWeight: "bold",
    color: "#28a745",
  },
  checklistItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#6c757d",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#E96443",
    borderColor: "#E96443",
  },
  checklistText: {
    fontSize: 16,
    color: "#212529",
  },
  observationsInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "white",
    fontSize: 16,
  },
  photoContainer: {
    marginBottom: 15,
  },
  photoButton: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6d8db",
  },
  photoButtonTaken: {
    backgroundColor: "#d1e7dd",
    borderColor: "#badbcc",
  },
  photoButtonText: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
    marginLeft: 10,
  },
  photoButtonTextTaken: {
    color: "#198754",
  },
  photoPreviewContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  photoPreview: {
    width: width - 80,
    height: (width - 80) * 0.75,
    borderRadius: 8,
    marginBottom: 10,
  },
  retakeButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  retakeButtonText: {
    color: "white",
    fontSize: 14,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  photoWarning: {
    fontSize: 14,
    color: "#dc3545",
    marginLeft: 5,
    fontStyle: "italic",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  confirmButton: {
    backgroundColor: "#198754",
  },
  disabledButton: {
    backgroundColor: "#6c757d",
    opacity: 0.7,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  requiredField: {
    fontWeight: "bold",
    color: "#E96443",
  },
})
