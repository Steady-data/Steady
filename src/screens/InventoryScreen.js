import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/i18n';
import AddItemModal from '../components/AddItemModal';

const CATEGORY_COLORS = {
  Whiskey: '#8B4513',
  Tequila: '#DAA520',
  Rum: '#CD5C5C',
  Vodka: '#4169E1',
  Gin: '#2E8B57',
  Liqueurs: '#9932CC',
  'Dry Goods': '#708090',
  Other: '#778899',
};

const ALCOHOL_CATS = new Set(['Whiskey', 'Tequila', 'Rum', 'Vodka', 'Gin', 'Liqueurs', 'Other']);

function StockBadge({ item }) {
  if (item.qty === 0) {
    return (
      <View style={[styles.badge, styles.badgeRed]}>
        <Text style={styles.badgeText}>0</Text>
      </View>
    );
  }
  if (item.qty <= item.minQty) {
    return (
      <View style={[styles.badge, styles.badgeOrange]}>
        <Text style={styles.badgeText}>{item.qty}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeGreen]}>
      <Text style={styles.badgeText}>{item.qty}</Text>
    </View>
  );
}

function ItemRow({ item, onPress }) {
  const color = CATEGORY_COLORS[item.category] || '#778899';
  return (
    <TouchableOpacity style={styles.itemRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.categoryDot, { backgroundColor: color }]} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.item}</Text>
        <Text style={styles.itemMeta}>
          {item.supplier}
          {item.units ? `  ·  ${item.units}` : ''}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <StockBadge item={item} />
        <Ionicons name="chevron-forward" size={16} color="#C6C6C8" style={{ marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );
}

export default function InventoryScreen() {
  const { inventory, addItem, updateItem, removeItem } = useApp();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const sections = useMemo(() => {
    const query = search.toLowerCase().trim();
    const filtered = query
      ? inventory.filter(
          i =>
            i.item.toLowerCase().includes(query) ||
            (i.supplier || '').toLowerCase().includes(query) ||
            (i.category || '').toLowerCase().includes(query)
        )
      : inventory;

    const grouped = {};
    filtered.forEach(item => {
      const cat = item.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    const alcoholSections = Object.keys(grouped)
      .filter(cat => ALCOHOL_CATS.has(cat))
      .sort()
      .map(cat => ({ title: cat, data: grouped[cat] }));

    const drySections = Object.keys(grouped)
      .filter(cat => !ALCOHOL_CATS.has(cat))
      .sort()
      .map(cat => ({ title: cat, data: grouped[cat] }));

    return [...alcoholSections, ...drySections];
  }, [inventory, search]);

  const openAdd = () => {
    setEditItem(null);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setModalVisible(true);
  };

  const handleSave = (saved) => {
    if (editItem) {
      updateItem(editItem.id, saved);
    } else {
      addItem(saved);
    }
    setModalVisible(false);
  };

  const handleDelete = (item) => {
    Alert.alert(t('deleteItem'), t('confirmDelete'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: () => removeItem(item.id),
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <ItemRow
      item={item}
      onPress={() =>
        Alert.alert(item.item, `${t('currentQty')}: ${item.qty}  ·  Min: ${item.minQty}`, [
          { text: t('deleteItem'), style: 'destructive', onPress: () => handleDelete(item) },
          { text: t('editItem'), onPress: () => openEdit(item) },
          { text: t('cancel'), style: 'cancel' },
        ])
      }
    />
  );

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: CATEGORY_COLORS[section.title] || '#778899' }]} />
      <Text style={styles.sectionTitle}>{t(`categories.${section.title}`)}</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color="#8E8E93" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor="#8E8E93"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {inventory.length === 0 && !search ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={56} color="#C6C6C8" />
          <Text style={styles.emptyText}>{t('noItems')}</Text>
        </View>
      ) : sections.length === 0 && search ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#C6C6C8" />
          <Text style={styles.emptyText}>No results for "{search}"</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Add Item FAB */}
      <TouchableOpacity style={styles.addFab} onPress={openAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
        <Text style={styles.addFabText}>{t('addItem')}</Text>
      </TouchableOpacity>

      <AddItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        editItem={editItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    height: 40,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#3C3C43',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCount: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 1,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 3,
  },
  itemMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    minWidth: 32,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeRed: {
    backgroundColor: '#FF3B3020',
  },
  badgeOrange: {
    backgroundColor: '#FF950020',
  },
  badgeGreen: {
    backgroundColor: '#34C75920',
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginLeft: 44,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  addFab: {
    position: 'absolute',
    bottom: 30,
    left: 80,
    right: 80,
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addFabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
