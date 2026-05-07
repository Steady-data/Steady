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
import { C, R, SPACING } from '../utils/theme';
import AddItemModal from '../components/AddItemModal';

/* ── Colour map per category ── */
const CAT_COLOR = {
  Whiskey:    '#A16207',
  Tequila:    '#D97706',
  Rum:        '#DC2626',
  Vodka:      '#2563EB',
  Gin:        '#059669',
  Liqueurs:   '#7C3AED',
  'Dry Goods':'#6B7280',
  Other:      '#374151',
};

const ALCOHOL = new Set(['Whiskey','Tequila','Rum','Vodka','Gin','Liqueurs','Other']);

/* ── Stock qty pill ── */
function QtyPill({ item }) {
  const isOut = item.qty === 0;
  const isLow = !isOut && item.qty <= item.minQty;
  const color  = isOut ? C.error : isLow ? C.warning : C.accent;
  return (
    <View style={[s.pill, { backgroundColor: color + '18' }]}>
      <Text style={[s.pillText, { color }]}>{item.qty}</Text>
    </View>
  );
}

/* ── Single item row ── */
function ItemRow({ item, onPress }) {
  const dot = CAT_COLOR[item.category] || C.text2;
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.dot, { backgroundColor: dot }]} />
      <View style={s.rowBody}>
        <Text style={s.rowName} numberOfLines={1}>{item.item}</Text>
        <Text style={s.rowMeta} numberOfLines={1}>
          {item.supplier}{item.units ? `  ·  ${item.units}` : ''}
        </Text>
      </View>
      <QtyPill item={item} />
      <Ionicons name="chevron-forward" size={14} color={C.surface2} style={{ marginLeft: 6 }} />
    </TouchableOpacity>
  );
}

/* ── Section header ── */
function SectionHeader({ section }) {
  const dot = CAT_COLOR[section.title] || C.text2;
  return (
    <View style={s.secHeader}>
      <View style={[s.dot, { backgroundColor: dot, marginRight: SPACING.s }]} />
      <Text style={s.secTitle}>{section.title.toUpperCase()}</Text>
      <Text style={s.secCount}>{section.data.length}</Text>
    </View>
  );
}

export default function InventoryScreen() {
  const { inventory, addItem, updateItem, removeItem } = useApp();
  const { t } = useTranslation();

  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);

  /* Build sections */
  const sections = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? inventory.filter(i =>
          i.item.toLowerCase().includes(q) ||
          (i.supplier || '').toLowerCase().includes(q) ||
          (i.category || '').toLowerCase().includes(q)
        )
      : inventory;

    const byCategory = {};
    filtered.forEach(item => {
      const cat = item.category || 'Other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    });

    const alcoholSections = Object.keys(byCategory)
      .filter(c => ALCOHOL.has(c)).sort()
      .map(c => ({ title: c, data: byCategory[c] }));

    const drySections = Object.keys(byCategory)
      .filter(c => !ALCOHOL.has(c)).sort()
      .map(c => ({ title: c, data: byCategory[c] }));

    return [...alcoholSections, ...drySections];
  }, [inventory, search]);

  const openAdd  = () => { setEditing(null); setModal(true); };
  const openEdit = (item) => { setEditing(item); setModal(true); };

  const handleSave = (saved) => {
    if (editing) updateItem(editing.id, saved);
    else         addItem(saved);
    setModal(false);
  };

  const itemPress = (item) =>
    Alert.alert(
      item.item,
      `${t('currentQty')}: ${item.qty}   Min: ${item.minQty}`,
      [
        { text: t('deleteItem'), style: 'destructive', onPress: () =>
            Alert.alert(t('deleteItem'), t('confirmDelete'), [
              { text: t('no'),  style: 'cancel' },
              { text: t('yes'), style: 'destructive', onPress: () => removeItem(item.id) },
            ])
        },
        { text: t('editItem'), onPress: () => openEdit(item) },
        { text: t('cancel'),   style: 'cancel' },
      ]
    );

  /* ── Stats bar ── */
  const outCount = inventory.filter(i => i.qty === 0).length;
  const lowCount = inventory.filter(i => i.qty > 0 && i.qty <= i.minQty).length;

  return (
    <View style={s.root}>

      {/* Stats row */}
      {inventory.length > 0 && (
        <View style={s.statsRow}>
          <View style={s.statChip}>
            <Text style={s.statNum}>{inventory.length}</Text>
            <Text style={s.statLabel}>Total SKUs</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statChip}>
            <Text style={[s.statNum, outCount > 0 && { color: C.error }]}>{outCount}</Text>
            <Text style={s.statLabel}>{t('outOfStock')}</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statChip}>
            <Text style={[s.statNum, lowCount > 0 && { color: C.warning }]}>{lowCount}</Text>
            <Text style={s.statLabel}>{t('lowStock')}</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={16} color={C.text2} style={{ marginRight: SPACING.s }} />
        <TextInput
          style={s.searchInput}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={C.text2}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          selectionColor={C.accent}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={C.text2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Empty state */}
      {inventory.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="cube-outline" size={48} color={C.surface2} />
          <Text style={s.emptyTitle}>No inventory yet</Text>
          <Text style={s.emptyBody}>{t('noItems')}</Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="search-outline" size={40} color={C.surface2} />
          <Text style={s.emptyBody}>No results for "{search}"</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={({ item, index, section }) => (
            <View style={[
              s.cardItem,
              index === 0 && s.cardItemFirst,
              index === section.data.length - 1 && s.cardItemLast,
            ]}>
              {index > 0 && <View style={s.internalSep} />}
              <ItemRow item={item} onPress={() => itemPress(item)} />
            </View>
          )}
          renderSectionHeader={({ section }) => <SectionHeader section={section} />}
          contentContainerStyle={s.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add FAB */}
      <TouchableOpacity style={s.fab} onPress={openAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={22} color={C.bg} />
        <Text style={s.fabText}>{t('addItem')}</Text>
      </TouchableOpacity>

      <AddItemModal
        visible={modal}
        onClose={() => setModal(false)}
        onSave={handleSave}
        editItem={editing}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: C.bg,
  },

  /* Stats bar */
  statsRow: {
    flexDirection:   'row',
    backgroundColor: C.surface,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.m,
    marginHorizontal: SPACING.m,
    marginTop:       SPACING.m,
    borderRadius:    R,
  },
  statChip: {
    flex:       1,
    alignItems: 'center',
  },
  statNum: {
    fontSize:   22,
    fontWeight: '700',
    color:      C.text,
    lineHeight: 26,
  },
  statLabel: {
    fontSize:   11,
    fontWeight: '500',
    color:      C.text2,
    marginTop:  2,
  },
  statDivider: {
    width:           1,
    backgroundColor: C.surface2,
    marginVertical:  4,
  },

  /* Search */
  searchWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.surface,
    borderRadius:    R,
    marginHorizontal: SPACING.m,
    marginTop:       SPACING.s,
    marginBottom:    SPACING.xs,
    paddingHorizontal: SPACING.m,
    height:          44,
  },
  searchInput: {
    flex:     1,
    fontSize: 15,
    color:    C.text,
  },

  /* Section list */
  listContent: {
    paddingHorizontal: SPACING.m,
    paddingBottom:    100,
    paddingTop:        SPACING.s,
  },

  /* Section header */
  secHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingTop:     SPACING.l,
    paddingBottom:  SPACING.s,
    paddingHorizontal: 4,
  },
  secTitle: {
    flex:          1,
    fontSize:      11,
    fontWeight:    '600',
    color:         C.text2,
    letterSpacing: 1,
  },
  secCount: {
    fontSize:  11,
    color:     C.text2,
    fontWeight:'500',
  },

  /* Item card group */
  cardItem: {
    backgroundColor: C.surface,
  },
  cardItemFirst: {
    borderTopLeftRadius:  R,
    borderTopRightRadius: R,
  },
  cardItemLast: {
    borderBottomLeftRadius:  R,
    borderBottomRightRadius: R,
  },
  internalSep: {
    height:          1,
    backgroundColor: C.surface2,
    marginLeft:      SPACING.m + 10 + SPACING.s, // align after dot
  },

  /* Item row */
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: SPACING.m,
    paddingVertical:   14,
  },
  dot: {
    width:        10,
    height:       10,
    borderRadius: R,
    marginRight:  SPACING.s + 2,
    flexShrink:   0,
  },
  rowBody: {
    flex: 1,
    marginRight: SPACING.s,
  },
  rowName: {
    fontSize:     15,
    fontWeight:   '600',
    color:        C.text,
    marginBottom: 3,
  },
  rowMeta: {
    fontSize: 12,
    color:    C.text2,
  },

  /* Qty pill */
  pill: {
    minWidth:        36,
    height:          28,
    borderRadius:    R,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: SPACING.s,
  },
  pillText: {
    fontSize:   14,
    fontWeight: '700',
  },

  /* Empty */
  empty: {
    flex:       1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.m,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize:   18,
    fontWeight: '600',
    color:      C.text,
  },
  emptyBody: {
    fontSize:   14,
    color:      C.text2,
    textAlign:  'center',
    lineHeight: 22,
  },

  /* Add FAB */
  fab: {
    position:         'absolute',
    bottom:           SPACING.l,
    left:             SPACING.xxl,
    right:            SPACING.xxl,
    height:           56,
    backgroundColor:  C.accent,
    borderRadius:     R,
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    gap:              SPACING.s,
  },
  fabText: {
    color:      C.bg,
    fontSize:   16,
    fontWeight: '700',
  },
});
