import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { C, R, SPACING } from '../utils/theme';

export default function GlobalFABs() {
  const { isLoggedIn, language, toggleLanguage } = useApp();

  if (!isLoggedIn) return null;

  return (
    <View style={s.wrap} pointerEvents="box-none">
      <TouchableOpacity style={s.fab} onPress={toggleLanguage} activeOpacity={0.85}>
        <Text style={s.fabText}>{language === 'en' ? 'עב' : 'EN'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position:       'absolute',
    bottom:         SPACING.l + 56 + SPACING.s, // clears tab bar + room
    right:          SPACING.m,
    pointerEvents:  'box-none',
  },
  fab: {
    width:           44,
    height:          44,
    borderRadius:    R,
    backgroundColor: C.surface,
    borderWidth:     1,
    borderColor:     C.surface2,
    alignItems:      'center',
    justifyContent:  'center',
  },
  fabText: {
    fontSize:   12,
    fontWeight: '700',
    color:      C.text2,
    letterSpacing: 0.4,
  },
});
