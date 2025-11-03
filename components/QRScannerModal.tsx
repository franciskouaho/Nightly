import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';

// Import conditionnel d'expo-camera
let CameraView: any;
let useCameraPermissions: any;

try {
  const cameraModule = require('expo-camera');
  CameraView = cameraModule.CameraView;
  useCameraPermissions = cameraModule.useCameraPermissions;
} catch (error) {
  console.warn('expo-camera not available, using fallback');
}

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export default function QRScannerModal({ visible, onClose, onScanSuccess }: QRScannerModalProps) {
  const { t } = useTranslation();
  const cameraPermissions = useCameraPermissions ? useCameraPermissions() : null;
  const permission = cameraPermissions ? cameraPermissions[0] : null;
  const requestPermission = cameraPermissions ? cameraPermissions[1] : () => Promise.resolve({ granted: false });
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    console.log('QR Code scanné:', data);
    
    try {
      // Parser le QR code - format: nightly://room/{code} ou juste le code
      const parsed = Linking.parse(data);
      let roomCode = data.trim();
      
      // Si c'est un deep link nightly://room/{code}
      if (parsed.scheme === 'nightly' && parsed.path) {
        if (parsed.path.startsWith('/room/')) {
          roomCode = parsed.path.split('/room/')[1] || data.trim();
        } else if (parsed.path === '/room' && parsed.hostname) {
          roomCode = parsed.hostname || data.trim();
        }
      }
      
      // Extraire le code si c'est un URL complet
      if (roomCode && roomCode.includes('/room/')) {
        const parts = roomCode.split('/room/');
        if (parts.length > 1) {
          const lastPart = parts[parts.length - 1];
          if (lastPart) {
            roomCode = lastPart;
          }
        }
      }
      
      // Nettoyer le code (enlever les espaces, etc.)
      roomCode = roomCode.trim().replace(/[^0-9]/g, '').slice(0, 6);
      
      if (roomCode && roomCode.length === 6) {
        onScanSuccess(roomCode);
        onClose();
      } else {
        Alert.alert(
          t('common.error'),
          t('home.errors.invalidCode') || 'Code de room invalide'
        );
        setScanned(false);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du QR code:', error);
      Alert.alert(
        t('common.error'),
        t('home.errors.invalidCode') || 'Code de room invalide'
      );
      setScanned(false);
    }
  };

  if (!visible) return null;

  const handleManualSubmit = () => {
    if (manualCode.trim().length >= 6) {
      handleBarCodeScanned({ data: manualCode.trim() });
    } else {
      Alert.alert(t('common.error'), t('home.errors.invalidCode') || 'Code de room invalide');
    }
  };

  // Si expo-camera n'est pas disponible, utiliser un fallback avec saisie manuelle
  if (!CameraView || !useCameraPermissions) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('home.scanQR')}</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color="#E8B4B8" />
              </TouchableOpacity>
            </View>
            <Text style={styles.permissionText}>
              Entrez le code de la room à 6 chiffres
            </Text>
            <TextInput
              style={styles.manualInput}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="123456"
              placeholderTextColor="#E8B4B8"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleManualSubmit}
              disabled={manualCode.trim().length < 6}
            >
              <LinearGradient
                colors={manualCode.trim().length >= 6 ? ["#C41E3A", "#8B1538"] : ["#555", "#333"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.permissionButtonGradient}
              >
                <Text style={styles.permissionButtonText}>{t('common.validate')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission) {
    // La permission est en cours de vérification
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.loadingText}>Vérification des permissions...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    // La permission n'a pas été accordée
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('home.scanQR')}</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color="#E8B4B8" />
              </TouchableOpacity>
            </View>
            <Text style={styles.permissionText}>
              Nous avons besoin de l'accès à votre caméra pour scanner le QR code.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <LinearGradient
                colors={["#C41E3A", "#8B1538"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.permissionButtonGradient}
              >
                <Text style={styles.permissionButtonText}>Autoriser la caméra</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.permissionText}>
              Ou entrez le code manuellement :
            </Text>
            <TextInput
              style={styles.manualInput}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="123456"
              placeholderTextColor="#E8B4B8"
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleManualSubmit}
              disabled={manualCode.trim().length < 6}
            >
              <LinearGradient
                colors={manualCode.trim().length >= 6 ? ["#C41E3A", "#8B1538"] : ["#555", "#333"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.permissionButtonGradient}
              >
                <Text style={styles.permissionButtonText}>{t('common.validate')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.cameraContainer}>
          {CameraView && (
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
          )}
          
          {/* Overlay avec fenêtre de scan */}
          <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanArea}>
                <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
                <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
                <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
                <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom}>
              <Text style={styles.instructionText}>
                Positionnez le QR code dans le cadre
              </Text>
              <Text style={[styles.instructionText, { marginTop: 10, fontSize: 14, opacity: 0.8 }]}>
                Ou entrez le code manuellement
              </Text>
            </View>
          </View>

          {/* Bouton de fermeture */}
          <TouchableOpacity
            style={styles.closeIconButton}
            onPress={onClose}
          >
            <View style={styles.closeIconContainer}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    minWidth: 300,
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
  },
  overlayMiddle: {
    flexDirection: 'row',
    width: '100%',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#C41E3A',
    borderWidth: 3,
  },
  scanCornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  scanCornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  scanCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  scanCornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
    justifyContent: 'flex-start',
    paddingTop: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeIconButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
  },
  closeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  loadingText: {
    color: '#E8B4B8',
    fontSize: 16,
    marginBottom: 20,
  },
  permissionText: {
    color: '#E8B4B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    width: '100%',
  },
  permissionButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: '#E8B4B8',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  manualInput: {
    backgroundColor: 'rgba(196, 30, 58, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(196, 30, 58, 0.4)',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
});

