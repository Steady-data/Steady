import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/i18n';

const { width: SW, height: SH } = Dimensions.get('window');
const SCAN_WINDOW_W = SW * 0.78;
const SCAN_WINDOW_H = 220;

const MOCK_SCAN_RESULTS = [
  { item: 'Campari', qty: 4, category: 'Liqueurs', minQty: 3, supplier: 'Premium Spirits Co.' },
  { item: 'Jameson Whiskey', qty: 2, category: 'Whiskey', minQty: 5, supplier: 'Irish Imports Ltd.' },
  { item: 'Patrón Silver', qty: 0, category: 'Tequila', minQty: 2, supplier: 'Mexican Spirits' },
  { item: 'Grey Goose Vodka', qty: 6, category: 'Vodka', minQty: 4, supplier: 'Premium Spirits Co.' },
  { item: "Hendrick's Gin", qty: 1, category: 'Gin', minQty: 3, supplier: 'Premium Spirits Co.' },
  { item: 'Bacardi Rum', qty: 3, category: 'Rum', minQty: 3, supplier: 'Caribbean Imports' },
  { item: 'Sea Salt', qty: 3, category: 'Dry Goods', minQty: 5, supplier: 'Food Supplies Co.' },
  { item: 'Black Pepper', qty: 0, category: 'Dry Goods', minQty: 2, supplier: 'Food Supplies Co.' },
  { item: 'Olive Oil', qty: 1, category: 'Dry Goods', minQty: 2, supplier: 'Food Supplies Co.' },
];

export default function ScannerScreen() {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { addScannedItems } = useApp();
  const { t } = useTranslation();

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const scanLoopRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (scanning) {
      scanLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      scanLoopRef.current.start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      if (scanLoopRef.current) scanLoopRef.current.stop();
      scanLineAnim.setValue(0);
      pulseAnim.setValue(1);
    }
    return () => {
      if (scanLoopRef.current) scanLoopRef.current.stop();
    };
  }, [scanning]);

  const handleActivateCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(t('cameraPermissionTitle'), t('permissionDenied'));
        return;
      }
    }
    setCameraActive(true);
  };

  const handleScanShelf = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      addScannedItems(MOCK_SCAN_RESULTS);
      Alert.alert(
        t('scanComplete'),
        `${MOCK_SCAN_RESULTS.length} ${t('itemsDetected')}`
      );
    }, 3000);
  };

  const handleStop = () => {
    setScanning(false);
    setCameraActive(false);
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_WINDOW_H - 3],
  });

  if (cameraActive) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" />

        {/* Dark overlay with scan window cutout */}
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddleRow}>
            <View style={styles.overlaySide} />
            <Animated.View style={[styles.scanWindow, { transform: [{ scale: pulseAnim }] }]}>
              {/* Corner brackets */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {/* Scan line */}
              {scanning && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    { transform: [{ translateY: scanLineTranslateY }] },
                  ]}
                />
              )}
            </Animated.View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </View>

        {/* Scanning label */}
        {scanning && (
          <View style={styles.scanningLabel}>
            <Text style={styles.scanningText}>{t('scanning')}</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.cameraControls}>
          {!scanning && (
            <TouchableOpacity style={styles.scanBtn} onPress={handleScanShelf} activeOpacity={0.85}>
              <Ionicons name="scan" size={20} color="#000000" />
              <Text style={styles.scanBtnText}>{t('scanShelf')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop} activeOpacity={0.85}>
            <Text style={styles.stopBtnText}>{t('stop')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inactiveContainer}>
      <View style={styles.cameraPlaceholder}>
        <Ionicons name="camera" size={64} color="#C6C6C8" />
      </View>
      <Text style={styles.inactiveTitle}>Scanner</Text>
      <Text style={styles.inactiveSubtitle}>
        Point your camera at a shelf to{'\n'}automatically detect stock levels.
      </Text>
      <TouchableOpacity
        style={styles.activateBtn}
        onPress={handleActivateCamera}
        activeOpacity={0.85}
      >
        <Ionicons name="camera" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.activateBtnText}>{t('activateCamera')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;
const BORDER_RADIUS = 4;

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayMiddleRow: {
    flexDirection: 'row',
    height: SCAN_WINDOW_H,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanWindow: {
    width: SCAN_WINDOW_W,
    height: SCAN_WINDOW_H,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  overlayBottom: {
    flex: 2,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: '#FFFFFF',
    borderTopRightRadius: BORDER_RADIUS,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: BORDER_RADIUS,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: BORDER_RADIUS,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  scanningLabel: {
    position: 'absolute',
    top: SH * 0.5 + SCAN_WINDOW_H / 2 + 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanningText: {
    color: '#34C759',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  scanBtn: {
    flex: 1,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  stopBtn: {
    height: 54,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inactiveContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  cameraPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  inactiveTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  inactiveSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  activateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    paddingHorizontal: 28,
    backgroundColor: '#000000',
    borderRadius: 14,
  },
  activateBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
