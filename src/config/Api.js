import { saveSession } from "./Storage";

const API_URL = "http://192.168.0.40:8080"; // tu IP local

export const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/resident/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      // ✅ Verificamos si la respuesta es 200 antes de intentar hacer .json()
      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }
  
      const data = await response.json();
      await saveSession(data);
      return data;
    } catch (error) {
      console.log("Error en login:", error.message);
      throw new Error("No se pudo iniciar sesión");
    }
  };
  
