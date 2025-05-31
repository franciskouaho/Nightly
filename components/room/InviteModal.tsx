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
    backgroundColor: 'rgba(10, 6, 20, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '88%',
    borderRadius: 28,
    backgroundColor: '#2B1845',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
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
    fontSize: 22,
    letterSpacing: 0.5,
  },
  label: {
    color: '#C7B8F5',
    fontSize: 15,
    marginBottom: 7,
    marginLeft: 2,
    fontWeight: '500',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#3D2956',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 18,
    marginTop: 2,
    minWidth: 220,
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
    marginLeft: 10,
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#866BF5',
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
    color: '#C7B8F5',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 18,
    marginTop: 2,
    lineHeight: 18,
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
