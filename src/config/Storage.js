import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveSession = async ({
  token,
  id,
  role,
  name,
  email,
  phone,
  houseId,
  houseID, // por si viene así
}) => {
  try {
    const sessionData = [
      ["token", token],
      ["id", id],
      ["role", role],
      ["name", name],
    ];

    if (email) sessionData.push(["email", email]);
    if (phone) sessionData.push(["phone", phone]);

    // ✅ Solución: usa houseID si viene con esa forma
    const finalHouseId = houseId ?? houseID ?? "";
    sessionData.push(["houseId", finalHouseId]);

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
    await AsyncStorage.multiRemove(["token", "id", "role", "name", "email", "phone"]);
  } catch (error) {
    console.error("Error limpiando sesión:", error);
  }
};
