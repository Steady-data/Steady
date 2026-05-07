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

const CATEGORIES = ['Whiskey', 'Tequila', 'Rum', 'Vodka', 'Gin', 'Liqueurs', 'Dry Goods', 'Other'];

const EMPTY_FORM = {
  item: '',
  units: 'bottle',
  category: 'Other',
  qty: '0',
  minQty: '2',
  costPrice: '',
  barcode: '',
  storageLocation: '',
  expirationDate: '',
  notes: '',
  supplier: '',
};

export default function AddItemModal({ visible, onClose, onSave, editItem }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (visible) {
      if (editItem) {
        setForm({
          item: editItem.item || '',
          units: editItem.units || 'bottle',
          category: editItem.category || 'Other',
          qty: String(editItem.qty ?? 0),
          minQty: String(editItem.minQty ?? 2),
          costPrice: editItem.costPrice ? String(editItem.costPrice) : '',
          barcode: editItem.barcode || '',
          storageLocation: editItem.storageLocation || '',
          expirationDate: editItem.expirationDate || '',
          notes: editItem.notes || '',
          supplier: editItem.supplier || '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [visible, editItem]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.item.trim()) {
      Alert.alert('', 'Item name is required.');
      return;
    }
    const saved = {
      ...(editItem || {}),
      item: form.item.trim(),
      units: form.units.trim() || 'unit',
      category: form.category,
      qty: parseInt(form.qty, 10) || 0,
      minQty: parseInt(form.minQty, 10) || 1,
      costPrice: parseFloat(form.costPrice) || 0,
      barcode: form.barcode.trim(),
      storageLocation: form.storageLocation.trim(),
      expirationDate: form.expirationDate.trim(),
      notes: form.notes.trim(),
      supplier: form.supplier.trim() || 'Unknown',
    };
    onSave(saved);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {editItem ? t('editItem') : t('newItem')}
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
              <Text style={styles.saveText}>{t('save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Item Name */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('itemName')}</Text>
              <TextInput
                style={styles.input}
                value={form.item}
                onChangeText={v => update('item', v)}
                placeholder={t('itemName')}
                placeholderTextColor="#8E8E93"
                returnKeyType="next"
                autoFocus={!editItem}
              />
            </View>

            {/* Units + Current Qty in a row */}
            <View style={styles.row}>
              <View style={[styles.section, styles.flex]}>
                <Text style={styles.sectionLabel}>{t('units')}</Text>
                <TextInput
                  style={styles.input}
                  value={form.units}
                  onChangeText={v => update('units', v)}
                  placeholder="bottle"
                  placeholderTextColor="#8E8E93"
                />
              </View>
              <View style={[styles.section, styles.flex]}>
                <Text style={styles.sectionLabel}>{t('currentQty')}</Text>
                <TextInput
                  style={styles.input}
                  value={form.qty}
                  onChangeText={v => update('qty', v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                />
              </View>
            </View>

            {/* Min Qty + Cost Price in a row */}
            <View style={styles.row}>
              <View style={[styles.section, styles.flex]}>
                <Text style={styles.sectionLabel}>{t('minQty')}</Text>
                <TextInput
                  style={styles.input}
                  value={form.minQty}
                  onChangeText={v => update('minQty', v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor="#8E8E93"
                />
              </View>
              <View style={[styles.section, styles.flex]}>
                <Text style={styles.sectionLabel}>{t('costPrice')}</Text>
                <TextInput
                  style={styles.input}
                  value={form.costPrice}
                  onChangeText={v => update('costPrice', v.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#8E8E93"
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('category')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      form.category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => update('category', cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        form.category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {t(`categories.${cat}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Supplier */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('supplier')}</Text>
              <TextInput
                style={styles.input}
                value={form.supplier}
                onChangeText={v => update('supplier', v)}
                placeholder="Supplier name"
                placeholderTextColor="#8E8E93"
              />
            </View>

            {/* Barcode */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('barcode')}</Text>
              <TextInput
                style={styles.input}
                value={form.barcode}
                onChangeText={v => update('barcode', v)}
                placeholder="0000000000000"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
              />
            </View>

            {/* Storage Location */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('storageLocation')}</Text>
              <TextInput
                style={styles.input}
                value={form.storageLocation}
                onChangeText={v => update('storageLocation', v)}
                placeholder="e.g. Bar, Cellar, Fridge"
                placeholderTextColor="#8E8E93"
              />
            </View>

            {/* Expiration Date */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('expirationDate')}</Text>
              <TextInput
                style={styles.input}
                value={form.expirationDate}
                onChangeText={v => update('expirationDate', v)}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#8E8E93"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('notes')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.notes}
                onChangeText={v => update('notes', v)}
                placeholder="Additional notes..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  headerBtn: {
    minWidth: 70,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  cancelText: {
    fontSize: 17,
    color: '#8E8E93',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'right',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C6C6C8',
  },
  textArea: {
    height: 88,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryRow: {
    gap: 8,
    paddingRight: 4,
  },
  categoryChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C6C6C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
});
