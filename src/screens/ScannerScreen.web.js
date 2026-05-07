import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/i18n';
import { C, R, SPACING } from '../utils/theme';

const { width: SW } = Dimensions.get('window');
const WIN_W = Math.round(SW * 0.80);
const WIN_H = 200;

const MOCK_ITEMS = [
  { item: 'Campari',          qty: 4, category: 'Liqueurs',   minQty: 3, supplier: 'Premium Spirits Co.' },
  { item: 'Jameson Whiskey',  qty: 2, category: 'Whiskey',    minQty: 5, supplier: 'Irish Imports Ltd.'  },
  { item: 'Patrón Silver',    qty: 0, category: 'Tequila',    minQty: 2, supplier: 'Mexican Spirits'     },
  { item: 'Grey Goose Vodka', qty: 6, category: 'Vodka',      minQty: 4, supplier: 'Premium Spirits Co.' },
  { item: "Hendrick's Gin",   qty: 1, category: 'Gin',        minQty: 3, supplier: 'Premium Spirits Co.' },
  { item: 'Bacardi Rum',      qty: 3, category: 'Rum',        minQty: 3, supplier: 'Caribbean Imports'   },
  { item: 'Sea Salt',         qty: 3, category: 'Dry Goods',  minQty: 5, supplier: 'Food Supplies Co.'   },
  { item: 'Black Pepper',     qty: 0, category: 'Dry Goods',  minQty: 2, supplier: 'Food Supplies Co.'   },
  { item: 'Olive Oil',        qty: 1, category: 'Dry Goods',  minQty: 2, supplier: 'Food Supplies Co.'   },
];

const CORNER = 20;
const THICK  = 2;

export default function ScannerScreen() {
  const [scanning, setScanning] = useState(false);
  const { addScannedItems } = useApp();
  const { t } = useTranslation();

  const lineAnim    = useRef(new Animated.Value(0)).current;
  const loopRef     = useRef(null);
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanning) {
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
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

  const lineY = lineAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, WIN_H - 2],
  });

  const handleScan = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      addScannedItems(MOCK_ITEMS);
    }, 3000);
  };

  return (
    <View style={s.root}>

      {/* Viewport frame */}
      <View style={s.viewportFrame}>
        <View style={[s.corner, s.cTL]} />
        <View style={[s.corner, s.cTR]} />
        <View style={[s.corner, s.cBL]} />
        <View style={[s.corner, s.cBR]} />

        {scanning ? (
          <>
            <Animated.View style={[s.sweepLine, { transform: [{ translateY: lineY }] }]} />
            <Animated.View style={[s.scanLabel, { opacity: opacityAnim }]}>
              <View style={s.scanLabelDot} />
              <Text style={s.scanLabelText}>{t('scanning')}</Text>
            </Animated.View>
          </>
        ) : (
          <Ionicons name="camera-outline" size={40} color={C.text2} />
        )}
      </View>

      <Text style={s.idleTitle}>Shelf Scanner</Text>
      <Text style={s.idleBody}>
        {scanning
          ? 'Analyzing shelf...'
          : 'Simulate a shelf scan to\nauto-detect and log stock levels.'}
      </Text>

      {!scanning && (
        <TouchableOpacity style={s.activateBtn} onPress={handleScan} activeOpacity={0.85}>
          <Ionicons name="scan" size={18} color={C.bg} style={{ marginRight: SPACING.s }} />
          <Text style={s.activateBtnText}>{t('scanShelf')}</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex:              1,
    backgroundColor:   C.bg,
    alignItems:        'center',
    justifyContent:    'center',
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
    overflow:        'hidden',
  },
  corner: {
    position: 'absolute',
    width:    CORNER,
    height:   CORNER,
  },
  cTL: { top: 0, left: 0,   borderTopWidth: THICK,    borderLeftWidth: THICK,  borderColor: C.accent, borderTopLeftRadius: R },
  cTR: { top: 0, right: 0,  borderTopWidth: THICK,    borderRightWidth: THICK, borderColor: C.accent, borderTopRightRadius: R },
  cBL: { bottom: 0, left: 0, borderBottomWidth: THICK, borderLeftWidth: THICK,  borderColor: C.accent, borderBottomLeftRadius: R },
  cBR: { bottom: 0, right: 0, borderBottomWidth: THICK, borderRightWidth: THICK, borderColor: C.accent, borderBottomRightRadius: R },
  sweepLine: {
    position:        'absolute',
    left:            0,
    right:           0,
    height:          2,
    backgroundColor: C.accent,
  },
  scanLabel: {
    position:          'absolute',
    bottom:            SPACING.s,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               SPACING.s,
    backgroundColor:   C.surface2,
    paddingHorizontal: SPACING.m,
    paddingVertical:   SPACING.xs,
    borderRadius:      R,
  },
  scanLabelDot: {
    width:           8,
    height:          8,
    borderRadius:    R,
    backgroundColor: C.accent,
  },
  scanLabelText: {
    color:      C.accent,
    fontSize:   13,
    fontWeight: '600',
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
    flexDirection:     'row',
    alignItems:        'center',
    height:            56,
    paddingHorizontal: SPACING.l,
    backgroundColor:   C.accent,
    borderRadius:      R,
  },
  activateBtnText: {
    color:      C.bg,
    fontSize:   16,
    fontWeight: '700',
  },
});
