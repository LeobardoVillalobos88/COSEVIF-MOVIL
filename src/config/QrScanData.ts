import AsyncStorage from '@react-native-async-storage/async-storage'

// Clave para almacenar los datos de escaneos de QR
const QR_SCANS_STORAGE_KEY = 'cosevif_qr_scans'

// Interfaz para los datos de escaneo
interface QrScanData {
  qrCode: string
  scanCount: number
  lastScanTime: number
  status: 'pending' | 'in_progress' | 'completed'
}

/**
 * Obtiene todos los escaneos de QR almacenados
 */
export const getQrScans = async (): Promise<Record<string, QrScanData>> => {
  try {
    const scansData = await AsyncStorage.getItem(QR_SCANS_STORAGE_KEY)
    return scansData ? JSON.parse(scansData) : {}
  } catch (error) {
    console.error('Error al obtener datos de escaneos:', error)
    return {}
  }
}

/**
 * Obtiene los datos de un QR específico
 */
export const getQrScanData = async (qrCode: string): Promise<QrScanData | null> => {
  try {
    const scans = await getQrScans()
    return scans[qrCode] || null
  } catch (error) {
    console.error('Error al obtener datos del QR:', error)
    return null
  }
}

/**
 * Registra un escaneo de QR
 * Retorna el estado actualizado y el contador de escaneos
 */
export const registerQrScan = async (qrCode: string): Promise<{ status: string; scanCount: number }> => {
  try {
    const scans = await getQrScans()
    
    // Si el QR ya existe, actualizar su contador y estado
    if (scans[qrCode]) {
      const currentScan = scans[qrCode]
      
      // Si ya se escaneó 2 veces, no hacer nada
      if (currentScan.scanCount >= 2) {
        return { 
          status: currentScan.status, 
          scanCount: currentScan.scanCount 
        }
      }
      
      // Incrementar contador y actualizar estado
      currentScan.scanCount += 1
      currentScan.lastScanTime = Date.now()
      
      if (currentScan.scanCount === 1) {
        currentScan.status = 'in_progress'
      } else if (currentScan.scanCount === 2) {
        currentScan.status = 'completed'
      }
      
      scans[qrCode] = currentScan
    } else {
      // Si es la primera vez que se escanea este QR
      scans[qrCode] = {
        qrCode,
        scanCount: 1,
        lastScanTime: Date.now(),
        status: 'in_progress'
      }
    }
    
    // Guardar los cambios
    await AsyncStorage.setItem(QR_SCANS_STORAGE_KEY, JSON.stringify(scans))
    
    return {
      status: scans[qrCode].status,
      scanCount: scans[qrCode].scanCount
    }
  } catch (error) {
    console.error('Error al registrar escaneo de QR:', error)
    return { status: 'error', scanCount: 0 }
  }
}

/**
 * Actualiza el estado de las visitas en la lista basado en los escaneos
 */
export const updateVisitsWithScanData = async (visits: any[]): Promise<any[]> => {
  try {
    const scans = await getQrScans()
    
    // Crear una copia de las visitas para no modificar el original
    const updatedVisits = [...visits]
    
    // Actualizar cada visita con los datos de escaneo si existen
    updatedVisits.forEach(visit => {
      const qrCode = visit.qrCode
      if (scans[qrCode]) {
        visit.status = scans[qrCode].status
        visit.scanCount = scans[qrCode].scanCount
      }
    })
    
    return updatedVisits
  } catch (error) {
    console.error('Error al actualizar visitas con datos de escaneo:', error)
    return visits
  }
}

/**
 * Limpia todos los datos de escaneos (útil para pruebas)
 */
export const clearAllQrScans = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(QR_SCANS_STORAGE_KEY)
  } catch (error) {
    console.error('Error al limpiar datos de escaneos:', error)
  }
}