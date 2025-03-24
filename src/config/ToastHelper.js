import Toast from 'react-native-root-toast';

export const showToast = (message, type = "error") => {
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    backgroundColor: type === "error" ? "#E96443" : "#4BB543",
    textColor: "#fff",
    shadowColor: "#000",
    opacity: 0.9,
  });
};