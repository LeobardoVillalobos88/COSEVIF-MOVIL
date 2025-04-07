# COSEVIF - App Móvil

Aplicación móvil para residentes y guardias del sistema **COSEVIF**, desarrollada con **React Native + Expo**.

## 🛠 Tecnologías

- React Native
- Expo
- Axios
- AsyncStorage
- React Navigation
- Toasts (react-native-toast-message)
- DateTime Picker
- Document Picker
- Animated & moment

## 📁 Estructura

```
/expo-app/
 ├── src/
 │    ├── modules/
 │    │     ├── auth/
 │    │     ├── visits/
 │    │     ├── workers/
 │    │     └── resident/
 │    ├── config/
 │    └── kernel/
 ├── navigation/
 └── assets/
```

## 📦 Funcionalidades actuales

### ✅ Residentes
- Login con token JWT
- Crear Visitas (con fecha/hora y clave)
- Generar y ver código QR
- Registrar Trabajadores (con foto del INE y fecha)
- Editar y eliminar trabajadores
- Ver listado de visitas y trabajadores
- Animación de bienvenida
- Perfil con información del usuario

## ⚙️ Cómo correr

1. Clona el repo:

```bash
git clone https://github.com/LeobardoVillalobos88/COSEVIF-MOVIL.git
cd COSEVIF-MOVIL
npm install
npm start
```

2. Escanea el QR en tu dispositivo móvil con Expo Go.

## 📌 Estado actual

- La app está en desarrollo activo.
- Funcionalidad del residente implementada al 100%
- Guardias: pendiente de implementar escaneo de QR y fotos

> 💬 El diseño está basado en Figma personalizado.