import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import RoundedButton from '@/components/RoundedButton';
import { useTranslation } from 'react-i18next';

type InviteModalProps = {
  visible: boolean;
  roomId: string;
  onClose: () => void;
  onCopyCode: () => void;
  onShareCode: () => void;
};

const InviteModal = ({ visible, roomId, onClose, onCopyCode, onShareCode }: InviteModalProps) => {
  const { t } = useTranslation();

  // Ne pas afficher le modal si roomId n'existe pas
  if (!roomId) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('inviteModal.title')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('inviteModal.roomCode')}</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code} selectable>
              {roomId.toUpperCase()}
            </Text>
            <TouchableOpacity onPress={onCopyCode} style={styles.copyBtn}>
              <MaterialCommunityIcons name="content-copy" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.qrContainer}>
            <QRCode
              value={`nightly://room/${roomId}`}
              size={150}
              color="#fff"
              backgroundColor="transparent"
            />
          </View>

          <Text style={styles.instruction}>
            {t('inviteModal.instruction')}
          </Text>

          <RoundedButton
            title={t('inviteModal.shareButton')}
            onPress={onShareCode}
            style={styles.shareBtn}
            textStyle={styles.shareBtnText}
            icon={<Ionicons name="share-social" size={20} color="#fff" />}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    borderRadius: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(196, 30, 58, 0.3)',
    shadowColor: '#C41E3A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    color: '#E8B4B8',
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 2,
    fontWeight: '600',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(196, 30, 58, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
    marginTop: 5,
    minWidth: 240,
    borderWidth: 1.5,
    borderColor: 'rgba(196, 30, 58, 0.4)',
  },
  code: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 4,
    fontFamily: 'monospace',
    flex: 1,
  },
  copyBtn: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#C41E3A',
    shadowColor: '#C41E3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  qrContainer: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 10,
    marginBottom: 18,
    marginTop: 2,
  },
  instruction: {
    color: '#E8B4B8',
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 20,
    marginTop: 5,
    lineHeight: 20,
    fontWeight: '500',
  },
  shareBtn: {
    borderRadius: 16,
    paddingVertical: 0,
    marginTop: 2,
    minWidth: '100%',
    alignSelf: 'center',
  },
  shareBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
});

export default InviteModal;
