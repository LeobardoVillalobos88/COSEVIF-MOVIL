import { saveSession } from "./Storage";

const API_URL = "http://192.168.0.40:8080"; // OYE SI CLONASTE EL REPO ACUERDATE DE CAMBIAR LA IP A LA DE TU MAQUINA SI NO NO JALA

export const login = async (identifier, password) => {
  const isPhone = /^[0-9]{10}$/.test(identifier);

  const url = isPhone
    ? `${API_URL}/auth/guard/login`
    : `${API_URL}/auth/resident/login`;

  const body = isPhone
    ? { phone: identifier, password }
    : { email: identifier, password };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }

    const data = await response.json();
    await saveSession(data);
    return data;
  } catch (error) {
    console.error("Error en login:", error.message);
    throw new Error("No se pudo iniciar sesión");
  }
};