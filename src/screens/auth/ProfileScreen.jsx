import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, SafeAreaView, Platform, KeyboardAvoidingView, Alert } from "react-native"
import { getItem, clearSession } from "../../config/Storage"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-toast-message"
import { Ionicons } from "@expo/vector-icons"
import { API_URL } from "../../config/IP"

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({})
  const [imageSource, setImageSource] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Campos editables
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("") // Para guardia es lastName, para residente es surnames
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("") // Añadido para cambiar contraseña
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [street, setStreet] = useState("")
  const [age, setAge] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [houseNumber, setHouseNumber] = useState("")
  const [username, setUsername] = useState("")

  // Función para guardar un elemento en AsyncStorage
  const saveItem = async (key, value) => {
    try {
      if (value !== undefined && value !== null) {
        await AsyncStorage.setItem(key, String(value))
      }
    } catch (error) {
      console.error(`Error guardando ${key}:`, error)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userRole = await getItem("role")
      setRole(userRole || "")

      // Datos comunes para ambos roles
      const name = await getItem("name")
      const phone = await getItem("phone")
      
      setName(name || "")
      setPhone(phone || "")

      // Datos específicos según el rol
      if (userRole === "RESIDENT") {
        // Para residentes
        const surnames = await getItem("surnames")
        const email = await getItem("email")
        const address = await getItem("address")
        const street = await getItem("street")
        const age = await getItem("age")
        const birthDate = await getItem("birthDate")
        const houseNumber = await getItem("houseNumber")
        
        setLastName(surnames || "") // Usamos lastName como campo unificado
        setEmail(email || "")
        setAddress(address || "")
        setStreet(street || "")
        setAge(age || "")
        setBirthDate(birthDate || "")
        setHouseNumber(houseNumber || "")
        
        setUserData({
          name,
          lastName: surnames,
          email,
          phone,
          address,
          street,
          age,
          birthDate,
          houseNumber,
        })

        setImageSource(require("../../../assets/residente_welcome.png"))
      } else if (userRole === "GUARDIA") {
        // Para guardias
        const lastName = await getItem("lastName")
        const username = await getItem("username")
        
        setLastName(lastName || "")
        setUsername(username || "")
        
        setUserData({
          name,
          lastName,
          phone,
          username,
        })

        setImageSource(require("../../../assets/guardia_welcome.png"))
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cargar la información del usuario",
      })
    }
  }

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sí, cerrar sesión",
        onPress: async () => {
          await clearSession()
          Toast.show({
            type: "success",
            text1: "Sesión cerrada",
            text2: "Redirigiendo al login",
          })

          setTimeout(() => {
            navigation.replace("LoginScreen")
          }, 1000)
        },
      },
    ])
  }

  const handleSaveChanges = async () => {
    // Solo permitir actualizar para residentes
    if (role !== "RESIDENT") {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No tienes permisos para actualizar tu perfil",
      })
      setIsEditing(false)
      return
    }

    setLoading(true)
    setSuccessMessage("")

    try {
      const token = await getItem("token")

      if (!token) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudo obtener la información de sesión",
        })
        setLoading(false)
        return
      }

      // Preparar los datos para la actualización (solo para residentes)
      const updateData = {
        name,
        surnames: lastName,
        email,
        phone,
        address,
        street,
        age: age ? parseInt(age, 10) : undefined,
        birthDate,
        houseNumber: houseNumber ? parseInt(houseNumber, 10) : undefined,
      }
      
      // Si hay contraseña, incluirla
      if (password) {
        updateData.password = password
      }
      
      // Usar el endpoint que funciona en la versión web
      const endpoint = `${API_URL}/auth/resident/profile`

      console.log("Datos a actualizar:", updateData)
      console.log("URL:", endpoint)

      // Realizar la petición PUT al endpoint
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      // Para depuración, imprimir la respuesta completa
      const responseText = await response.text()
      console.log("Respuesta del servidor:", responseText)

      if (!response.ok) {
        throw new Error(`Error al actualizar el perfil: ${response.status} - ${responseText}`)
      }

      // Actualizar los datos en el almacenamiento local
      await saveItem("name", name)
      await saveItem("phone", phone)
      await saveItem("surnames", lastName)
      await saveItem("email", email)
      await saveItem("address", address)
      await saveItem("street", street)
      await saveItem("age", age)
      await saveItem("birthDate", birthDate)
      await saveItem("houseNumber", houseNumber)

      setSuccessMessage("¡Perfil actualizado correctamente!")
      
      Toast.show({
        type: "success",
        text1: "Perfil actualizado",
        text2: "Los cambios se han guardado correctamente",
      })

      // Esperar un momento antes de cerrar el modo edición
      setTimeout(() => {
        setIsEditing(false)
        setPassword("") // Limpiar la contraseña
        loadUserData() // Recargar datos actualizados
      }, 1500)
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "No se pudo actualizar el perfil",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderField = (label, value, setter, visible = true, isPassword = false) => {
    if (!visible) return null;
    
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing && role === "RESIDENT" ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setter}
            placeholder={`Ingresa tu ${label.toLowerCase()}`}
            placeholderTextColor="#aaa"
            secureTextEntry={isPassword}
          />
        ) : (
          <Text style={styles.fieldValue}>
            {isPassword ? "••••••••" : (value || "No especificado")}
          </Text>
        )}
      </View>
    )
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

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Mi Perfil</Text>
            {!isEditing && role === "RESIDENT" && (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil-outline" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileImageContainer}>
            {imageSource && <Image source={imageSource} style={styles.profileImage} />}
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role === "RESIDENT" ? "Residente" : "Guardia"}</Text>
            </View>
          </View>

          {successMessage ? (
            <View style={styles.successMessage}>
              <Ionicons name="checkmark-circle" size={24} color="#4BB543" />
              <Text style={styles.successMessageText}>{successMessage}</Text>
            </View>
          ) : null}

          {role === "GUARDIA" && (
            <View style={styles.infoMessage}>
              <Ionicons name="information-circle" size={24} color="#1976D2" />
              <Text style={styles.infoMessageText}>
                Los guardias no pueden modificar su información de perfil. Por favor, contacta al administrador.
              </Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            {renderField("Nombre", name, setName)}
            {renderField("Apellido", lastName, setLastName)}
            {renderField("Correo electrónico", email, setEmail, role === "RESIDENT")}
            {isEditing && role === "RESIDENT" && renderField("Contraseña (opcional)", password, setPassword, true, true)}
            {renderField("Teléfono", phone, setPhone)}
            {renderField("Edad", age, setAge, role === "RESIDENT")}
            {renderField("Fecha de nacimiento", birthDate, setBirthDate, role === "RESIDENT")}

            {role === "RESIDENT" && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Dirección</Text>
                {renderField("Calle", street, setStreet)}
                {renderField("Dirección", address, setAddress)}
              </>
            )}

            {role === "RESIDENT" && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Información de Residencia</Text>
                {renderField("Número de casa", houseNumber, setHouseNumber)}
              </>
            )}

            {role === "GUARDIA" && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Información de Cuenta</Text>
                {renderField("Nombre de usuario", username, setUsername)}
              </>
            )}

            {isEditing && role === "RESIDENT" && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, loading && styles.disabledButton]}
                  onPress={() => {
                    setIsEditing(false)
                    setPassword("") // Limpiar la contraseña al cancelar
                  }}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.disabledButton]}
                  onPress={handleSaveChanges}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={18} color="#fff" />
                      <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 999,
    padding: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E96443",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#E96443",
  },
  roleBadge: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "#E96443",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  roleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  successMessageText: {
    color: "#4BB543",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  infoMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  infoMessageText: {
    color: "#1976D2",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  input: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E96443",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E96443",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default ProfileScreen