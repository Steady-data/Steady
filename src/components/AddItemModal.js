import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/i18n';
import { C, R, SPACING } from '../utils/theme';

const CATEGORIES = ['Whiskey','Tequila','Rum','Vodka','Gin','Liqueurs','Dry Goods','Other'];

const EMPTY = {
  item:            '',
  units:           'bottle',
  category:        'Other',
  qty:             '0',
  minQty:          '2',
  costPrice:       '',
  barcode:         '',
  storageLocation: '',
  expirationDate:  '',
  notes:           '',
  supplier:        '',
};

/* ── Field wrapper ── */
function Field({ label, children }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function AddItemModal({ visible, onClose, onSave, editItem }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!visible) return;
    if (editItem) {
      setForm({
        item:            editItem.item            || '',
        units:           editItem.units           || 'bottle',
        category:        editItem.category        || 'Other',
        qty:             String(editItem.qty      ?? 0),
        minQty:          String(editItem.minQty   ?? 2),
        costPrice:       editItem.costPrice       ? String(editItem.costPrice) : '',
        barcode:         editItem.barcode         || '',
        storageLocation: editItem.storageLocation || '',
        expirationDate:  editItem.expirationDate  || '',
        notes:           editItem.notes           || '',
        supplier:        editItem.supplier        || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [visible, editItem]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.item.trim()) {
      Alert.alert('Required', 'Item name cannot be empty.');
      return;
    }
    onSave({
      ...(editItem || {}),
      item:            form.item.trim(),
      units:           form.units.trim() || 'unit',
      category:        form.category,
      qty:             parseInt(form.qty,       10) || 0,
      minQty:          parseInt(form.minQty,    10) || 1,
      costPrice:       parseFloat(form.costPrice)  || 0,
      barcode:         form.barcode.trim(),
      storageLocation: form.storageLocation.trim(),
      expirationDate:  form.expirationDate.trim(),
      notes:           form.notes.trim(),
      supplier:        form.supplier.trim() || 'Unknown',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.root}>

          {/* Sheet handle + header */}
          <View style={s.handle} />
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={s.headerSide} activeOpacity={0.7}>
              <Text style={s.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>
              {editItem ? t('editItem') : t('newItem')}
            </Text>
            <TouchableOpacity onPress={handleSave} style={[s.headerSide, s.headerSideRight]} activeOpacity={0.85}>
              <Text style={s.saveText}>{t('save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* ── Item name ── */}
            <Field label={t('itemName')}>
              <TextInput
                style={[s.input, s.inputLarge]}
                value={form.item}
                onChangeText={v => set('item', v)}
                placeholder="e.g. Jameson Whiskey"
                placeholderTextColor={C.text2}
                returnKeyType="next"
                autoFocus={!editItem}
                selectionColor={C.accent}
              />
            </Field>

            {/* ── Row: Units + Current Qty ── */}
            <View style={s.row}>
              <Field label={t('units')} style={s.flex}>
                <TextInput
                  style={s.input}
                  value={form.units}
                  onChangeText={v => set('units', v)}
                  placeholder="bottle"
                  placeholderTextColor={C.text2}
                  selectionColor={C.accent}
                />
              </Field>
              <Field label={t('currentQty')} style={s.flex}>
                <TextInput
                  style={s.input}
                  value={form.qty}
                  onChangeText={v => set('qty', v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.text2}
                  selectionColor={C.accent}
                />
              </Field>
            </View>

            {/* ── Row: Min Qty + Cost Price ── */}
            <View style={s.row}>
              <Field label={t('minQty')} style={s.flex}>
                <TextInput
                  style={s.input}
                  value={form.minQty}
                  onChangeText={v => set('minQty', v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor={C.text2}
                  selectionColor={C.accent}
                />
              </Field>
              <Field label={t('costPrice')} style={s.flex}>
                <TextInput
                  style={s.input}
                  value={form.costPrice}
                  onChangeText={v => set('costPrice', v.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={C.text2}
                  selectionColor={C.accent}
                />
              </Field>
            </View>

            {/* ── Category chips ── */}
            <Field label={t('category')}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.chips}
              >
                {CATEGORIES.map(cat => {
                  const active = form.category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[s.chip, active && s.chipActive]}
                      onPress={() => set('category', cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.chipText, active && s.chipTextActive]}>
                        {t(`categories.${cat}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Field>

            {/* ── Supplier ── */}
            <Field label={t('supplier')}>
              <TextInput
                style={s.input}
                value={form.supplier}
                onChangeText={v => set('supplier', v)}
                placeholder="Supplier name"
                placeholderTextColor={C.text2}
                selectionColor={C.accent}
              />
            </Field>

            {/* ── Barcode ── */}
            <Field label={t('barcode')}>
              <View style={s.inputRow}>
                <TextInput
                  style={[s.input, s.flex]}
                  value={form.barcode}
                  onChangeText={v => set('barcode', v)}
                  placeholder="Scan or enter barcode"
                  placeholderTextColor={C.text2}
                  keyboardType="numeric"
                  selectionColor={C.accent}
                />
                <View style={s.barcodeIcon}>
                  <Ionicons name="barcode-outline" size={20} color={C.text2} />
                </View>
              </View>
            </Field>

            {/* ── Storage Location ── */}
            <Field label={t('storageLocation')}>
              <TextInput
                style={s.input}
                value={form.storageLocation}
                onChangeText={v => set('storageLocation', v)}
                placeholder="e.g. Bar, Cellar, Fridge"
                placeholderTextColor={C.text2}
                selectionColor={C.accent}
              />
            </Field>

            {/* ── Expiration Date ── */}
            <Field label={t('expirationDate')}>
              <TextInput
                style={s.input}
                value={form.expirationDate}
                onChangeText={v => set('expirationDate', v)}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={C.text2}
                keyboardType="numbers-and-punctuation"
                selectionColor={C.accent}
              />
            </Field>

            {/* ── Notes ── */}
            <Field label={t('notes')}>
              <TextInput
                style={[s.input, s.textArea]}
                value={form.notes}
                onChangeText={v => set('notes', v)}
                placeholder="Additional notes…"
                placeholderTextColor={C.text2}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                selectionColor={C.accent}
              />
            </Field>

            {/* Save button (bottom of scroll for accessibility) */}
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={s.saveBtnText}>{t('save')}</Text>
            </TouchableOpacity>

            <View style={{ height: SPACING.xxl }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  kav: { flex: 1 },
  root: {
    flex:            1,
    backgroundColor: C.bg,
  },

  /* Handle + header */
  handle: {
    width:           40,
    height:          4,
    borderRadius:    R,
    backgroundColor: C.surface2,
    alignSelf:       'center',
    marginTop:       SPACING.s,
    marginBottom:    SPACING.s,
  },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: SPACING.m,
    paddingBottom:   SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: C.surface2,
  },
  headerSide: {
    minWidth: 64,
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex:       1,
    fontSize:   17,
    fontWeight: '700',
    color:      C.text,
    textAlign:  'center',
  },
  cancelText: {
    fontSize:   16,
    color:      C.text2,
    fontWeight: '500',
  },
  saveText: {
    fontSize:   16,
    color:      C.accent,
    fontWeight: '700',
  },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: {
    padding: SPACING.m,
    gap:     SPACING.xs,
  },
  flex: { flex: 1 },

  /* Field */
  field: {
    marginBottom: SPACING.m,
  },
  fieldLabel: {
    fontSize:      11,
    fontWeight:    '600',
    color:         C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom:  SPACING.s,
  },

  /* Input */
  input: {
    height:          48,
    backgroundColor: C.surface,
    borderRadius:    R,
    paddingHorizontal: SPACING.m,
    fontSize:        15,
    fontWeight:      '400',
    color:           C.text,
  },
  inputLarge: {
    height:    56,
    fontSize:  17,
    fontWeight:'500',
  },
  textArea: {
    height:     88,
    paddingTop: SPACING.m,
  },

  /* Row of fields */
  row: {
    flexDirection: 'row',
    gap:           SPACING.s,
  },

  /* Category chips */
  chips: {
    gap:         SPACING.s,
    paddingRight: SPACING.xs,
  },
  chip: {
    height:          36,
    paddingHorizontal: SPACING.m,
    borderRadius:    R,
    backgroundColor: C.surface,
    alignItems:      'center',
    justifyContent:  'center',
  },
  chipActive: {
    backgroundColor: C.accent,
  },
  chipText: {
    fontSize:   13,
    fontWeight: '500',
    color:      C.text2,
  },
  chipTextActive: {
    color:      C.bg,
    fontWeight: '700',
  },

  /* Barcode row */
  inputRow: {
    flexDirection: 'row',
    gap:           SPACING.s,
    alignItems:    'center',
  },
  barcodeIcon: {
    width:           48,
    height:          48,
    borderRadius:    R,
    backgroundColor: C.surface,
    alignItems:      'center',
    justifyContent:  'center',
  },

  /* Save button */
  saveBtn: {
    height:          56,
    backgroundColor: C.accent,
    borderRadius:    R,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       SPACING.m,
  },
  saveBtnText: {
    fontSize:   16,
    fontWeight: '700',
    color:      C.bg,
  },
});
