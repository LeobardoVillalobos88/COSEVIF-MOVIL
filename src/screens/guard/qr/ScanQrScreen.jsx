import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function ScanQrScreen() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [visitData, setVisitData] = useState(null);
  const [observations, setObservations] = useState('');
  const [status, setStatus] = useState('pending'); // 'pending', 'in_progress', 'completed'
  const [trunkPhoto, setTrunkPhoto] = useState(null);
  const [platePhoto, setPlatePhoto] = useState(null);

  // Estados del checklist
  const [checklist, setChecklist] = useState({
    peopleMatch: false,
    vehicleMatch: false,
    authorized: false
  });

  // Solicitar permisos al montar el componente
  useEffect(() => {
    (async () => {
      await requestPermission();
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Se necesitan permisos de cámara para tomar fotos');
      }
    })();
  }, []);

  // Función para parsear los datos del QR
  const parseVisitData = (qrText) => {
    const lines = qrText.split('\n');
    const data = {};
    
    lines.forEach(line => {
      if (line.includes('Casa:')) {
        data.houseId = line.split('Casa:')[1].trim();
      } else if (line.includes('Visitante:')) {
        data.visitorName = line.split('Visitante:')[1].trim();
      } else if (line.includes('Fecha y Hora:')) {
        data.visitDate = line.split('Fecha y Hora:')[1].trim();
      } else if (line.includes('Vehículo:')) {
        data.vehicle = line.split('Vehículo:')[1].trim();
      } else if (line.includes('Clave de acceso:')) {
        data.accessKey = line.split('Clave de acceso:')[1].trim();
      } else if (line.includes('Personas:')) {
        data.peopleCount = parseInt(line.split('Personas:')[1].trim());
      } else if (line.includes('Descripción:')) {
        data.description = line.split('Descripción:')[1].trim();
      }
    });

    return data;
  };

  // Manejar escaneo de QR
  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    try {
      // Parsear datos del QR en formato de texto
      const parsedData = parseVisitData(data);
      
      // Validar que se hayan obtenido datos mínimos
      if (!parsedData.visitorName || !parsedData.houseId) {
        throw new Error('Datos incompletos');
      }
      
      setVisitData(parsedData);
      
      // Cambiar estado según si es entrada o salida
      if (status === 'pending') {
        setStatus('in_progress');
      } else if (status === 'in_progress') {
        setStatus('completed');
      }
    } catch (e) {
      Alert.alert(
        'QR inválido', 
        'El código escaneado no contiene datos de visita válidos.\n\nFormato esperado:\nVISITA REGISTRADA\nCasa: [ID]\nVisitante: [Nombre]...',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  // Tomar foto de cajuela
  const takeTrunkPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setTrunkPhoto(result.assets[0].uri);
    }
  };

  // Tomar foto de placas
  const takePlatePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPlatePhoto(result.assets[0].uri);
    }
  };

  // Actualizar checklist
  const toggleChecklistItem = (item) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  // Validar si se pueden confirmar los datos
  const canConfirm = () => {
    // Verificar que todas las casillas del checklist estén marcadas
    const allChecklistItems = Object.values(checklist).every(item => item);
    
    // Verificar que se hayan tomado ambas fotos si es un vehículo
    const hasVehicle = visitData?.vehicle && visitData.vehicle.toLowerCase() !== 'no' && visitData.vehicle.toLowerCase() !== 'ninguno';
    const photosRequired = hasVehicle;
    const hasPhotos = trunkPhoto && platePhoto;
    
    return allChecklistItems && (!photosRequired || hasPhotos);
  };

  // Finalizar proceso
  const finishProcess = () => {
    if (!canConfirm()) {
      Alert.alert(
        'Datos incompletos',
        'Por favor complete todas las verificaciones y tome las fotos requeridas antes de confirmar.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Aquí iría la lógica para enviar los datos al servidor
    const visitRecord = {
      ...visitData,
      status,
      observations,
      checklist,
      trunkPhotoUri: trunkPhoto,
      platePhotoUri: platePhoto,
      processedAt: new Date().toISOString()
    };

    console.log('Registro de visita:', visitRecord);
    Alert.alert(
      'Proceso completado',
      status === 'completed' 
        ? 'La visita ha sido registrada como finalizada' 
        : 'La visita ha sido registrada como en progreso',
      [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
          }
        }
      ]
    );
  };

  // Reiniciar formulario
  const resetForm = () => {
    setScanned(false);
    setVisitData(null);
    setObservations('');
    setStatus('pending');
    setTrunkPhoto(null);
    setPlatePhoto(null);
    setChecklist({
      peopleMatch: false,
      vehicleMatch: false,
      authorized: false
    });
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Necesitamos permisos para acceder a la cámara</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Otorgar Permisos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pantalla de escaneo
  if (!scanned) {
    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.qrFrame} />
            <Text style={styles.overlayText}>Escanear código QR de visita</Text>
          </View>
        </CameraView>
      </View>
    );
  }

  // Pantalla de verificación
  return (
    <ScrollView contentContainerStyle={styles.verificationContainer}>
      <Text style={styles.title}>
        {status === 'in_progress' ? 'REGISTRAR ENTRADA' : 'REGISTRAR SALIDA'}
      </Text>
      
      {/* Datos de la visita */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la visita</Text>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Casa:</Text>
          <Text style={styles.dataValue}>{visitData?.houseId || 'No especificado'}</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Visitante:</Text>
          <Text style={styles.dataValue}>{visitData?.visitorName || 'No especificado'}</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Fecha y hora:</Text>
          <Text style={styles.dataValue}>{visitData?.visitDate || 'No especificada'}</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Vehículo:</Text>
          <Text style={styles.dataValue}>{visitData?.vehicle || 'No registrado'}</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>N° de personas:</Text>
          <Text style={styles.dataValue}>{visitData?.peopleCount || '0'}</Text>
        </View>
        
        {visitData?.accessKey && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Clave de acceso:</Text>
            <Text style={[styles.dataValue, styles.accessKeyText]}>{visitData.accessKey}</Text>
          </View>
        )}
        
        {visitData?.description && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Descripción:</Text>
            <Text style={styles.dataValue}>{visitData.description}</Text>
          </View>
        )}
      </View>

      {/* Checklist de verificación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verificación</Text>
        
        <TouchableOpacity 
          style={styles.checklistItem} 
          onPress={() => toggleChecklistItem('peopleMatch')}
        >
          <Text style={styles.checklistText}>
            {checklist.peopleMatch ? '✓' : '○'} Número de personas coincide
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.checklistItem} 
          onPress={() => toggleChecklistItem('vehicleMatch')}
        >
          <Text style={styles.checklistText}>
            {checklist.vehicleMatch ? '✓' : '○'} Información del vehículo coincide
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.checklistItem} 
          onPress={() => toggleChecklistItem('authorized')}
        >
          <Text style={styles.checklistText}>
            {checklist.authorized ? '✓' : '○'} Visita autorizada
          </Text>
        </TouchableOpacity>
      </View>

      {/* Observaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observaciones</Text>
        <TextInput
          style={styles.observationsInput}
          multiline
          numberOfLines={4}
          placeholder="Ej: Llegaron 5 personas en lugar de 4..."
          value={observations}
          onChangeText={setObservations}
        />
      </View>

      {/* Captura de fotos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evidencia fotográfica</Text>
        
        <TouchableOpacity 
          style={[
            styles.photoButton, 
            trunkPhoto && styles.photoButtonTaken
          ]} 
          onPress={takeTrunkPhoto}
        >
          <Text style={styles.photoButtonText}>
            {trunkPhoto ? '✔ Foto de cajuela' : 'Tomar foto de cajuela'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.photoButton, 
            platePhoto && styles.photoButtonTaken
          ]} 
          onPress={takePlatePhoto}
        >
          <Text style={styles.photoButtonText}>
            {platePhoto ? '✔ Foto de placas' : 'Tomar foto de placas'}
          </Text>
        </TouchableOpacity>
        
        {(!trunkPhoto || !platePhoto) && visitData?.vehicle && 
          visitData.vehicle.toLowerCase() !== 'no' && 
          visitData.vehicle.toLowerCase() !== 'ninguno' && (
          <Text style={styles.photoWarning}>
            * Fotos obligatorias para vehículos
          </Text>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={resetForm}
        >
          <Text style={styles.actionButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            styles.confirmButton,
            !canConfirm() && styles.disabledButton
          ]}
          onPress={finishProcess}
          disabled={!canConfirm()}
        >
          <Text style={styles.actionButtonText}>
            {status === 'in_progress' ? 'Confirmar entrada' : 'Confirmar salida'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  overlayText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
  },
  verificationContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#495057',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dataLabel: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
  },
  dataValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  accessKeyText: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  checklistItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  checklistText: {
    fontSize: 16,
    color: '#212529',
  },
  observationsInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    fontSize: 16,
  },
  photoButton: {
    backgroundColor: '#e2e3e5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d6d8db',
  },
  photoButtonTaken: {
    backgroundColor: '#d1e7dd',
    borderColor: '#badbcc',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  photoWarning: {
    fontSize: 14,
    color: '#dc3545',
    marginTop: 5,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  confirmButton: {
    backgroundColor: '#198754',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});