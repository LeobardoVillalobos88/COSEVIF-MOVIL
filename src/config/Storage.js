import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveSession = async (session) => {
  try {
    const sessionData = Object.entries(session)
      .filter(([key, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)]);

    await AsyncStorage.multiSet(sessionData);
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
    await AsyncStorage.multiRemove([
      "token",
      "id",
      "role",
      "name",
      "email",
      "phone",
      "username",
      "lastName",
      "address",
      "street",
      "age",
      "birthDate",
      "houseId",
      "houseNumber",
    ]);
  } catch (error) {
    console.error("Error limpiando sesión:", error);
  }
};
