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
import { C, R, SPACING } from '../utils/theme';

const { width: SW, height: SH } = Dimensions.get('window');
const WIN_W = Math.round(SW * 0.80);
const WIN_H = 200;

const MOCK_ITEMS = [
  { item: 'Campari',          qty: 4, category: 'Liqueurs', minQty: 3,  supplier: 'Premium Spirits Co.' },
  { item: 'Jameson Whiskey',  qty: 2, category: 'Whiskey',  minQty: 5,  supplier: 'Irish Imports Ltd.'  },
  { item: 'Patrón Silver',    qty: 0, category: 'Tequila',  minQty: 2,  supplier: 'Mexican Spirits'      },
  { item: 'Grey Goose Vodka', qty: 6, category: 'Vodka',    minQty: 4,  supplier: 'Premium Spirits Co.' },
  { item: "Hendrick's Gin",   qty: 1, category: 'Gin',      minQty: 3,  supplier: 'Premium Spirits Co.' },
  { item: 'Bacardi Rum',      qty: 3, category: 'Rum',      minQty: 3,  supplier: 'Caribbean Imports'   },
  { item: 'Sea Salt',         qty: 3, category: 'Dry Goods',minQty: 5,  supplier: 'Food Supplies Co.'   },
  { item: 'Black Pepper',     qty: 0, category: 'Dry Goods',minQty: 2,  supplier: 'Food Supplies Co.'   },
  { item: 'Olive Oil',        qty: 1, category: 'Dry Goods',minQty: 2,  supplier: 'Food Supplies Co.'   },
];

export default function ScannerScreen() {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning,     setScanning]     = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { addScannedItems } = useApp();
  const { t } = useTranslation();

  const lineAnim    = useRef(new Animated.Value(0)).current;
  const loopRef     = useRef(null);
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanning) {
      // Fade-in label
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      // Sweep line loop
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(lineAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(lineAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      lineAnim.setValue(0);
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
    return () => loopRef.current?.stop();
  }, [scanning]);

  const handleActivate = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(t('cameraPermissionTitle'), t('permissionDenied'));
        return;
      }
    }
    setCameraActive(true);
  };

  const handleScan = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      addScannedItems(MOCK_ITEMS);
      Alert.alert(t('scanComplete'), `${MOCK_ITEMS.length} ${t('itemsDetected')}`);
    }, 3000);
  };

  const handleStop = () => {
    setScanning(false);
    setCameraActive(false);
  };

  const lineY = lineAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, WIN_H - 2],
  });

  /* ── ACTIVE CAMERA ── */
  if (cameraActive) {
    return (
      <View style={s.cameraRoot}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" />

        {/* Dark vignette overlay with scan-window cutout */}
        <View style={s.overlay} pointerEvents="none">
          <View style={s.ovTop} />
          <View style={s.ovRow}>
            <View style={s.ovSide} />
            <View style={{ width: WIN_W, height: WIN_H }}>
              {/* Corner brackets */}
              <View style={[s.corner, s.cTL]} />
              <View style={[s.corner, s.cTR]} />
              <View style={[s.corner, s.cBL]} />
              <View style={[s.corner, s.cBR]} />
              {/* Sweep line */}
              {scanning && (
                <Animated.View
                  style={[s.sweepLine, { transform: [{ translateY: lineY }] }]}
                />
              )}
            </View>
            <View style={s.ovSide} />
          </View>
          <View style={s.ovBottom}>
            {/* Inline scanning label — lives inside the bottom overlay band */}
            <Animated.View style={[s.scanLabel, { opacity: opacityAnim }]}>
              <View style={s.scanLabelDot} />
              <Text style={s.scanLabelText}>{t('scanning')}</Text>
            </Animated.View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={s.ctrlRow}>
          {!scanning && (
            <TouchableOpacity style={s.primaryBtn} onPress={handleScan} activeOpacity={0.85}>
              <Ionicons name="scan" size={18} color={C.bg} />
              <Text style={s.primaryBtnText}>{t('scanShelf')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.ghostBtn} onPress={handleStop} activeOpacity={0.8}>
            <Text style={s.ghostBtnText}>{t('stop')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── INACTIVE STATE ── */
  return (
    <View style={s.idleRoot}>

      {/* Viewport mockup */}
      <View style={s.viewportFrame}>
        <View style={[s.corner, s.cTL]} />
        <View style={[s.corner, s.cTR]} />
        <View style={[s.corner, s.cBL]} />
        <View style={[s.corner, s.cBR]} />
        <Ionicons name="camera-outline" size={40} color={C.text2} />
      </View>

      <Text style={s.idleTitle}>Shelf Scanner</Text>
      <Text style={s.idleBody}>
        Point at a shelf to automatically{'\n'}detect and log stock levels.
      </Text>

      <TouchableOpacity style={s.activateBtn} onPress={handleActivate} activeOpacity={0.85}>
        <Ionicons name="camera" size={18} color={C.bg} style={{ marginRight: SPACING.s }} />
        <Text style={s.activateBtnText}>{t('activateCamera')}</Text>
      </TouchableOpacity>

    </View>
  );
}

const CORNER = 20;
const THICK  = 2;

const s = StyleSheet.create({
  /* Camera active */
  cameraRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ovTop: {
    flex: 1,
    backgroundColor: 'rgba(18,18,18,0.68)',
  },
  ovRow: {
    flexDirection: 'row',
    height: WIN_H,
  },
  ovSide: {
    flex: 1,
    backgroundColor: 'rgba(18,18,18,0.68)',
  },
  ovBottom: {
    flex: 2,
    backgroundColor: 'rgba(18,18,18,0.68)',
    alignItems: 'center',
    paddingTop: SPACING.m,
  },

  /* Corner brackets (shared idle + active) */
  corner: {
    position: 'absolute',
    width:  CORNER,
    height: CORNER,
  },
  cTL: { top: 0, left: 0,
    borderTopWidth: THICK, borderLeftWidth: THICK,
    borderColor: C.accent, borderTopLeftRadius: R },
  cTR: { top: 0, right: 0,
    borderTopWidth: THICK, borderRightWidth: THICK,
    borderColor: C.accent, borderTopRightRadius: R },
  cBL: { bottom: 0, left: 0,
    borderBottomWidth: THICK, borderLeftWidth: THICK,
    borderColor: C.accent, borderBottomLeftRadius: R },
  cBR: { bottom: 0, right: 0,
    borderBottomWidth: THICK, borderRightWidth: THICK,
    borderColor: C.accent, borderBottomRightRadius: R },

  /* Sweep line */
  sweepLine: {
    position:        'absolute',
    left:            0,
    right:           0,
    height:          2,
    backgroundColor: C.accent,
  },

  /* Scanning label */
  scanLabel: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             SPACING.s,
    backgroundColor: C.surface,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius:    R,
  },
  scanLabelDot: {
    width:           8,
    height:          8,
    borderRadius:    R,
    backgroundColor: C.accent,
  },
  scanLabelText: {
    color:      C.accent,
    fontSize:   14,
    fontWeight: '600',
  },

  /* Control row */
  ctrlRow: {
    position: 'absolute',
    bottom:   48,
    left:     SPACING.m,
    right:    SPACING.m,
    flexDirection: 'row',
    gap: SPACING.s,
  },
  primaryBtn: {
    flex:            1,
    height:          56,
    backgroundColor: C.accent,
    borderRadius:    R,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             SPACING.s,
  },
  primaryBtnText: {
    color:      C.bg,
    fontSize:   16,
    fontWeight: '700',
  },
  ghostBtn: {
    height:          56,
    paddingHorizontal: SPACING.m,
    backgroundColor: C.surface,
    borderRadius:    R,
    alignItems:      'center',
    justifyContent:  'center',
  },
  ghostBtnText: {
    color:      C.text2,
    fontSize:   15,
    fontWeight: '600',
  },

  /* Idle state */
  idleRoot: {
    flex:             1,
    backgroundColor:  C.bg,
    alignItems:       'center',
    justifyContent:   'center',
    paddingHorizontal: SPACING.xl,
  },
  viewportFrame: {
    width:           WIN_W * 0.7,
    height:          WIN_H * 0.75,
    backgroundColor: C.surface,
    borderRadius:    R,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.xl,
  },
  idleTitle: {
    fontSize:      24,
    fontWeight:    '700',
    color:         C.text,
    marginBottom:  SPACING.s,
    letterSpacing: -0.5,
  },
  idleBody: {
    fontSize:     15,
    color:        C.text2,
    textAlign:    'center',
    lineHeight:   22,
    marginBottom: SPACING.xl,
  },
  activateBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    height:          56,
    paddingHorizontal: SPACING.l,
    backgroundColor: C.accent,
    borderRadius:    R,
  },
  activateBtnText: {
    color:      C.bg,
    fontSize:   16,
    fontWeight: '700',
  },
});
