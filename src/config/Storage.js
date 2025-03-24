import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveSession = async ({ token, id, role, name }) => {
  try {
    await AsyncStorage.multiSet([
      ["token", token],
      ["id", id],
      ["role", role],
      ["name", name],
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
    await AsyncStorage.multiRemove(["token", "id", "role", "name"]);
  } catch (error) {
    console.error("Error limpiando sesión:", error);
  }
};
