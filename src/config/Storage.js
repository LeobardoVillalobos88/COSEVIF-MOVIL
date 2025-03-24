import AsyncStorage from "@react-native-async-storage/async-storage";

// Guardar sesión completa
export const saveSession = async ({ token, id, username, role }) => {
  try {
    await AsyncStorage.multiSet([
      ["token", token],
      ["id", id],
      ["username", username],
      ["role", role],
    ]);
  } catch (error) {
    console.error("Error guardando sesión:", error);
  }
};

// Obtener un dato específico
export const getItem = async (key) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error("Error obteniendo valor:", error);
    return null;
  }
};

// Cerrar sesión
export const clearSession = async () => {
  try {
    await AsyncStorage.multiRemove(["token", "id", "username", "role"]);
  } catch (error) {
    console.error("Error limpiando sesión:", error);
  }
};
