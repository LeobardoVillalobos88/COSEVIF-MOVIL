import { useState, useRef } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ScrollView, KeyboardAvoidingView, SafeAreaView, Keyboard, TouchableWithoutFeedback } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import Toast from "react-native-toast-message"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { getItem } from "../../../config/Storage"
import { API_URL } from "../../../config/IP"

const VisitEditScreen = ({ route }) => {
  const { visit } = route.params
  const navigation = useNavigation()
  const scrollViewRef = useRef(null)

  const [visitorName, setVisitorName] = useState(visit.visitorName)
  const [vehiclePlate, setVehiclePlate] = useState(visit.vehiclePlate || "")
  const [numPeople, setNumPeople] = useState(String(visit.numPeople))
  const [description, setDescription] = useState(visit.description || "")
  const [password, setPassword] = useState(visit.password || "")
  const [loading, setLoading] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  const [selectedDate, setSelectedDate] = useState(new Date(visit.dateTime))
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [selectedTime, setSelectedTime] = useState(new Date(visit.dateTime))
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

  const handleUpdate = async () => {
    // Cerrar el teclado primero
    dismissKeyboard()

    // Validación básica
    if (!visitorName.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El nombre del visitante es obligatorio",
      })
      return
    }

    if (!numPeople.trim() || isNaN(Number.parseInt(numPeople))) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingrese un número válido de personas",
      })
      return
    }

    if (!password.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "La clave de acceso es obligatoria",
      })
      return
    }

    setLoading(true)
    try {
      const token = await getItem("token")
      const combinedDate = new Date(selectedDate)
      combinedDate.setHours(selectedTime.getHours())
      combinedDate.setMinutes(selectedTime.getMinutes())
      combinedDate.setSeconds(0)
      combinedDate.setMilliseconds(0)

      const offset = combinedDate.getTimezoneOffset()
      const localDate = new Date(combinedDate.getTime() - offset * 60000)
      const dateTimeIso = localDate.toISOString().slice(0, 19)

      const data = {
        visitorName,
        vehiclePlate,
        numPeople: Number.parseInt(numPeople),
        description,
        password,
        dateTime: dateTimeIso,
      }

      const response = await fetch(`${API_URL}/resident/visit/${visit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al actualizar la visita")

      Toast.show({
        type: "success",
        text1: "Visita actualizada",
      })

      navigation.goBack()
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
              <Text style={styles.title}>Editar Visita</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del visitante</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Juan Pérez"
                    placeholderTextColor="#aaa"
                    value={visitorName}
                    onChangeText={setVisitorName}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Placas del vehículo</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="car-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. ABC-123"
                    placeholderTextColor="#aaa"
                    value={vehiclePlate}
                    onChangeText={setVehiclePlate}
                    autoCapitalize="characters"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número de personas</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="people-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. 2"
                    placeholderTextColor="#aaa"
                    value={numPeople}
                    onChangeText={setNumPeople}
                    keyboardType="numeric"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="document-text-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Visita familiar"
                    placeholderTextColor="#aaa"
                    value={description}
                    onChangeText={setDescription}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Clave de acceso</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa una clave"
                    placeholderTextColor="#aaa"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={dismissKeyboard}
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

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Guardar Cambios</Text>
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
    paddingBottom: Platform.OS === "ios" ? 120 : 40, // Más espacio en iOS
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
    marginBottom: 30,
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

export default VisitEditScreen