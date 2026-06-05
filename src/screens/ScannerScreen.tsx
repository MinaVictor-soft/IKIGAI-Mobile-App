import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
  TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';
import ConferenceHeader from '../components/ConferenceHeader';

type ScanMode = 'attendance' | 'bonus' | 'staffAward';

export default function ScannerScreen() {
  const { refreshUser, user } = useAuth();
  const { t } = useLang();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [mode, setMode] = useState<ScanMode>('attendance');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [staffAwardTarget, setStaffAwardTarget] = useState<string | null>(null);
  const [awardAmount, setAwardAmount] = useState('10');
  const [awardReason, setAwardReason] = useState('');

  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.permissionTitle}>{t('cameraRequired')}</Text>
        <Text style={styles.permissionText}>
          {t('cameraExplanation')}
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>{t('grantPermission')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || scanning) return;
    setScanned(true);
    setScanning(true);
    Vibration.vibrate(100);

    try {
      let response;
      if (mode === 'attendance') {
        response = await api.post('/attendance/scan', { qrCode: data });
        setResult({ success: true, message: response.data.message || `+${response.data.data?.xpEarned || response.data.data?.xpAwarded || ''} XP earned!` });
        await refreshUser();
      } else if (mode === 'bonus') {
        response = await api.post('/bonus/claim', { qrCode: data });
        setResult({ success: true, message: response.data.message || `+${response.data.data?.xpEarned || ''} XP earned!` });
        await refreshUser();
      } else if (mode === 'staffAward') {
        // Staff scanned a user QR - show award form
        setStaffAwardTarget(data);
        setResult(null);
        setScanning(false);
        return;
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || error?.response?.data?.message || 'Scan failed. Try again.';
      setResult({ success: false, message: msg });
    } finally {
      setScanning(false);
    }
  };

  const handleStaffAward = async () => {
    if (!staffAwardTarget || !awardReason.trim()) {
      Alert.alert('Error', 'Please enter a reason');
      return;
    }
    setScanning(true);
    try {
      const response = await api.post('/bonus/staff-award', {
        userQrToken: staffAwardTarget,
        amount: parseInt(awardAmount) || 10,
        reason: awardReason.trim(),
      });
      const userName = response.data?.data?.user?.name || 'User';
      setResult({ success: true, message: `✨ Awarded ${awardAmount} XP to ${userName}!` });
      setStaffAwardTarget(null);
      setAwardReason('');
      setAwardAmount('10');
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || 'Award failed. Try again.';
      setResult({ success: false, message: msg });
      setStaffAwardTarget(null);
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setResult(null);
    setStaffAwardTarget(null);
  };

  return (
    <View style={styles.container}>
      <ConferenceHeader />
      {/* Mode Selector */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('scanQrCode')}</Text>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'attendance' && styles.modeButtonActive]}
            onPress={() => { setMode('attendance'); resetScanner(); }}
          >
            <Ionicons name="calendar" size={16} color={mode === 'attendance' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.modeText, mode === 'attendance' && styles.modeTextActive]}>
              {t('attendance')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'bonus' && styles.modeButtonActive]}
            onPress={() => { setMode('bonus'); resetScanner(); }}
          >
            <Ionicons name="gift" size={16} color={mode === 'bonus' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.modeText, mode === 'bonus' && styles.modeTextActive]}>
              {t('bonus')}
            </Text>
          </TouchableOpacity>
          {isStaff && (
            <TouchableOpacity
              style={[styles.modeButton, mode === 'staffAward' && styles.modeButtonActive]}
              onPress={() => { setMode('staffAward'); resetScanner(); }}
            >
              <Ionicons name="star" size={16} color={mode === 'staffAward' ? '#fff' : COLORS.textMuted} />
              <Text style={[styles.modeText, mode === 'staffAward' && styles.modeTextActive]}>
                Award
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        {/* Scanner overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        {/* Scanning indicator */}
        {scanning && (
          <View style={styles.scanningOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.scanningText}>{t('processing')}</Text>
          </View>
        )}
      </View>

      {/* Staff Award Form */}
      {staffAwardTarget && mode === 'staffAward' && (
        <View style={styles.staffAwardForm}>
          <Text style={styles.staffAwardTitle}>⭐ Award XP to Attendee</Text>
          <View style={styles.staffAwardRow}>
            <Text style={styles.staffAwardLabel}>Amount:</Text>
            <TextInput
              style={styles.staffAwardInput}
              value={awardAmount}
              onChangeText={setAwardAmount}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="10"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.staffAwardUnit}>XP</Text>
          </View>
          <TextInput
            style={styles.staffAwardReasonInput}
            value={awardReason}
            onChangeText={setAwardReason}
            placeholder="Reason (e.g. Great participation)"
            placeholderTextColor={COLORS.textMuted}
            maxLength={200}
          />
          <View style={styles.staffAwardButtons}>
            <TouchableOpacity style={styles.staffAwardCancel} onPress={resetScanner}>
              <Text style={styles.staffAwardCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.staffAwardSubmit, (!awardReason.trim()) && { opacity: 0.5 }]}
              onPress={handleStaffAward}
              disabled={!awardReason.trim() || scanning}
            >
              {scanning ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.staffAwardSubmitText}>Award ⭐</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Result */}
      {result && (
        <View style={[styles.resultContainer, result.success ? styles.resultSuccess : styles.resultError]}>
          <Ionicons
            name={result.success ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={result.success ? COLORS.success : COLORS.error}
          />
          <Text style={styles.resultText}>{result.message}</Text>
          <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
            <Text style={styles.scanAgainText}>{t('scanAgain')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!result && !staffAwardTarget && (
        <Text style={styles.instruction}>
          {mode === 'attendance' ? t('pointCameraAttendance') : mode === 'bonus' ? t('pointCameraBonus') : 'Scan attendee\'s QR code to award points'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modeText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  modeTextActive: {
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
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
  scanFrame: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  scanningText: {
    color: COLORS.text,
    fontSize: 16,
  },
  resultContainer: {
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  resultSuccess: {
    backgroundColor: COLORS.success + '20',
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  resultError: {
    backgroundColor: COLORS.error + '20',
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  resultText: {
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'center',
  },
  scanAgainButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  instruction: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.lg,
    fontSize: 14,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  permissionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  staffAwardForm: {
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
    gap: SPACING.md,
  },
  staffAwardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  staffAwardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  staffAwardLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  staffAwardInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  staffAwardUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  staffAwardReasonInput: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  staffAwardButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  staffAwardCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  staffAwardCancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  staffAwardSubmit: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    backgroundColor: COLORS.accent,
  },
  staffAwardSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
