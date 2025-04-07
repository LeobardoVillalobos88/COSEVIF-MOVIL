import { saveSession } from "./Storage";
import { API_URL } from "./IP";

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

    if (!response.ok) throw new Error("Credenciales incorrectas");

    const data = await response.json();

    await saveSession(data);
    return data;
  } catch (error) {
    console.error("Error en login:", error.message);
    throw new Error("No se pudo iniciar sesión");
  }
};