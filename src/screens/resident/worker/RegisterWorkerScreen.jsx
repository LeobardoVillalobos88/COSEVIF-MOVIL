import { useState, useRef } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Platform, ScrollView, KeyboardAvoidingView, SafeAreaView, Keyboard, TouchableWithoutFeedback } from "react-native"
import Toast from "react-native-toast-message"
import * as DocumentPicker from "expo-document-picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import { getItem } from "../../../config/Storage"
import { API_URL } from "../../../config/IP"
import { Ionicons } from "@expo/vector-icons"

const RegisterWorkerScreen = ({ navigation }) => {
  const [workerName, setWorkerName] = useState("")
  const [age, setAge] = useState("")
  const [address, setAddress] = useState("")
  const [inePhoto, setInePhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  const scrollViewRef = useRef(null)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  // Función para cerrar el teclado
  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  // Detectar cuando el teclado aparece/desaparece
  useState(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true)
      // Desplazar el ScrollView hacia arriba cuando aparece el teclado
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 100, animated: true })
      }
    })
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false)
    })

    // Limpiar listeners cuando el componente se desmonta
    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const onChangeDate = (_, date) => {
    setShowDatePicker(false)
    if (date) setSelectedDate(date)
  }

  const onChangeTime = (_, time) => {
    setShowTimePicker(false)
    if (time) setSelectedTime(time)
  }

  const handleImagePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setInePhoto(result.assets[0].uri)
    }
  }

  const handleRegisterWorker = async () => {
    // Cerrar el teclado primero
    dismissKeyboard()

    if (!workerName || !age || !address || !inePhoto) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Todos los campos son obligatorios.",
      })
      return
    }

    setLoading(true)

    try {
      const token = await getItem("token")
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Sesión inválida",
          text2: "Token no proporcionado",
        })
        setLoading(false)
        return
      }

      const combinedDate = new Date(selectedDate)
      combinedDate.setHours(selectedTime.getHours())
      combinedDate.setMinutes(selectedTime.getMinutes())
      combinedDate.setSeconds(0)
      combinedDate.setMilliseconds(0)

      const offset = combinedDate.getTimezoneOffset()
      const localDate = new Date(combinedDate.getTime() - offset * 60000)
      const formattedDate = localDate.toISOString().slice(0, 19) // sin milisegundos ni Z

      const formData = new FormData()
      formData.append("workerName", workerName)
      formData.append("age", parseInt(age))
      formData.append("address", address)
      formData.append("dateTime", formattedDate)
      formData.append("inePhoto", {
        uri: inePhoto,
        type: "image/jpeg",
        name: "ine.jpg",
      })

      const response = await fetch(`${API_URL}/resident/workerVisits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const status = response.status
      const resText = await response.text()

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Trabajador registrado",
          text2: "El trabajador ha sido registrado exitosamente.",
        })
        navigation.navigate("WorkersListScreen")
      } else {
        throw new Error(`Error al registrar el trabajador. Status: ${status}, Respuesta: ${resText}`)
      }
    } catch (error) {
      console.error("❌ Error en el registro:", error)
      Toast.show({
        type: "error",
        text1: "Error al registrar el trabajador",
        text2: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#E96443" />
        </TouchableOpacity>

        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Registrar Trabajador</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del trabajador</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Juan Pérez"
                    placeholderTextColor="#aaa"
                    value={workerName}
                    onChangeText={setWorkerName}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Edad</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. 35"
                    placeholderTextColor="#aaa"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dirección</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="home-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Calle Principal #123"
                    placeholderTextColor="#aaa"
                    value={address}
                    onChangeText={setAddress}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeGroup}>
                  <Text style={styles.inputLabel}>Fecha</Text>
                  <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color="#E96443" />
                    <Text style={styles.dateTimeText}>{selectedDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dateTimeGroup}>
                  <Text style={styles.inputLabel}>Hora</Text>
                  <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
                    <Ionicons name="time-outline" size={20} color="#E96443" />
                    <Text style={styles.dateTimeText}>
                      {selectedTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                  minimumDate={new Date()}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeTime}
                />
              )}

              <View style={styles.photoSection}>
                <Text style={styles.inputLabel}>Foto de identificación (INE)</Text>
                {inePhoto ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image source={{ uri: inePhoto }} style={styles.photoPreview} />
                    <TouchableOpacity style={styles.changePhotoButton} onPress={handleImagePick}>
                      <Ionicons name="camera-outline" size={20} color="#fff" />
                      <Text style={styles.changePhotoText}>Cambiar foto</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.photoUploadButton} onPress={handleImagePick}>
                    <Ionicons name="camera-outline" size={24} color="#E96443" />
                    <Text style={styles.photoUploadText}>Seleccionar foto del INE</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleRegisterWorker}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Registrar Trabajador</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: Platform.OS === "ios" ? 120 : 40,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 999,
    padding: 5,
  },
  headerContainer: {
    marginTop: -30,
    marginBottom: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateTimeGroup: {
    width: "48%",
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E96443",
  },
  dateTimeText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  photoSection: {
    marginBottom: 25,
  },
  photoUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#E96443",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  photoUploadText: {
    color: "#E96443",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  photoPreviewContainer: {
    alignItems: "center",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E96443",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  changePhotoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E96443",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 10,
    shadowColor: "#E96443",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default RegisterWorkerScreen