import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/i18n';
import { C, R, SPACING } from '../utils/theme';

const PAR = 2; // par level multiplier

function orderQty(item) {
  return Math.max(Math.max(item.minQty * PAR, item.minQty + 1) - item.qty, 0);
}

function status(item) {
  if (item.qty === 0)                     return 'out';
  if (item.qty <= item.minQty)            return 'low';
  return 'order';
}

const STATUS_META = {
  out:   { label: 'OUT',   color: C.error,   bg: C.error   + '18' },
  low:   { label: 'LOW',   color: C.warning, bg: C.warning + '18' },
  order: { label: 'ORDER', color: C.accent,  bg: C.accent  + '18' },
};

/* ── Format WhatsApp message ── */
function formatMsg(supplier, items) {
  const lines = items.map(i => `• ${i.item}: ${i._orderQty} ${i.units || 'units'}`).join('\n');
  return `*Order — ${supplier}*\n\n${lines}\n\n_Sent via Steady_`;
}

function openWhatsApp(supplier, items) {
  const msg = formatMsg(supplier, items);
  const uri = `whatsapp://send?text=${encodeURIComponent(msg)}`;
  Linking.canOpenURL(uri).then(ok => {
    Linking.openURL(ok ? uri : `https://wa.me/?text=${encodeURIComponent(msg)}`);
  });
}

function openPhone() {
  Alert.alert('Phone', 'Add a phone number to each supplier to call directly.');
}

/* ── Components ── */
function StatusTag({ st }) {
  const m = STATUS_META[st];
  return (
    <View style={[s.tag, { backgroundColor: m.bg }]}>
      <Text style={[s.tagText, { color: m.color }]}>{m.label}</Text>
    </View>
  );
}

function OrderItem({ item, isLast }) {
  const st    = item._status;
  const bar   = STATUS_META[st].color;
  return (
    <View style={[s.orderRow, !isLast && s.orderRowBorder]}>
      <View style={[s.urgBar, { backgroundColor: bar }]} />
      <View style={s.orderContent}>
        <View style={s.orderLeft}>
          <Text style={s.orderName} numberOfLines={1}>{item.item}</Text>
          <Text style={s.orderMeta}>
            In stock: <Text style={{ color: C.text }}>{item.qty}</Text>
            {'   '}Min: <Text style={{ color: C.text }}>{item.minQty}</Text>
          </Text>
        </View>
        <View style={s.orderRight}>
          <StatusTag st={st} />
          <View style={s.qtyBox}>
            <Text style={s.qtyNum}>{item._orderQty}</Text>
            <Text style={s.qtyLabel}>need</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SupplierCard({ group }) {
  const { t } = useTranslation();
  return (
    <View style={s.card}>
      {/* Card header */}
      <View style={s.cardHeader}>
        <View style={s.supplierLeft}>
          <View style={s.supplierIcon}>
            <Ionicons name="business" size={14} color={C.text2} />
          </View>
          <View>
            <Text style={s.supplierName} numberOfLines={1}>{group.supplier}</Text>
            <Text style={s.supplierSub}>{group.items.length} item{group.items.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View style={s.sendRow}>
          <TouchableOpacity
            style={s.sendBtn}
            onPress={() => openWhatsApp(group.supplier, group.items)}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={15} color={C.bg} />
            <Text style={s.sendBtnText}>{t('sendOrder')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.phoneBtn}
            onPress={openPhone}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={15} color={C.text2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Item rows */}
      {group.items.map((item, idx) => (
        <OrderItem key={item.id} item={item} isLast={idx === group.items.length - 1} />
      ))}
    </View>
  );
}

export default function OrdersScreen() {
  const { inventory } = useApp();
  const { t } = useTranslation();

  const groups = useMemo(() => {
    const enriched = inventory
      .map(i => ({ ...i, _orderQty: orderQty(i), _status: status(i) }))
      .filter(i => i._orderQty > 0);

    const bySupplier = {};
    enriched.forEach(i => {
      const sup = i.supplier || 'Unknown';
      if (!bySupplier[sup]) bySupplier[sup] = [];
      bySupplier[sup].push(i);
    });

    const ORDER = { out: 0, low: 1, order: 2 };
    return Object.entries(bySupplier).map(([supplier, items]) => ({
      supplier,
      items: [...items].sort((a, b) => ORDER[a._status] - ORDER[b._status]),
    })).sort((a, b) => {
      const urgA = a.items.some(i => i._status !== 'order') ? 0 : 1;
      const urgB = b.items.some(i => i._status !== 'order') ? 0 : 1;
      return urgA - urgB;
    });
  }, [inventory]);

  /* ── Summary KPIs ── */
  const totalOut  = inventory.filter(i => i.qty === 0).length;
  const totalLow  = inventory.filter(i => i.qty > 0 && i.qty <= i.minQty).length;
  const totalOrder = groups.reduce((sum, g) => sum + g.items.length, 0);

  if (groups.length === 0) {
    return (
      <View style={s.emptyRoot}>
        <View style={s.emptyIcon}>
          <Ionicons name="checkmark" size={36} color={C.accent} />
        </View>
        <Text style={s.emptyTitle}>All Stocked Up</Text>
        <Text style={s.emptyBody}>{t('noOrders')}</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>

      {/* KPI strip */}
      <View style={s.kpiStrip}>
        <View style={s.kpi}>
          <Text style={[s.kpiNum, { color: C.error }]}>{totalOut}</Text>
          <Text style={s.kpiLabel}>{t('outOfStock')}</Text>
        </View>
        <View style={s.kpiDivider} />
        <View style={s.kpi}>
          <Text style={[s.kpiNum, { color: C.warning }]}>{totalLow}</Text>
          <Text style={s.kpiLabel}>{t('lowStock')}</Text>
        </View>
        <View style={s.kpiDivider} />
        <View style={s.kpi}>
          <Text style={[s.kpiNum, { color: C.accent }]}>{totalOrder}</Text>
          <Text style={s.kpiLabel}>To Order</Text>
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={g => g.supplier}
        renderItem={({ item: group }) => <SupplierCard group={group} />}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: C.bg,
  },

  /* KPI strip */
  kpiStrip: {
    flexDirection:   'row',
    backgroundColor: C.surface,
    marginHorizontal: SPACING.m,
    marginTop:       SPACING.m,
    borderRadius:    R,
    paddingVertical: SPACING.m,
  },
  kpi: {
    flex:       1,
    alignItems: 'center',
  },
  kpiNum: {
    fontSize:   24,
    fontWeight: '700',
    color:      C.text,
    lineHeight: 28,
  },
  kpiLabel: {
    fontSize:  11,
    fontWeight:'500',
    color:     C.text2,
    marginTop: 2,
  },
  kpiDivider: {
    width:           1,
    backgroundColor: C.surface2,
    marginVertical:  4,
  },

  /* List */
  list: {
    padding:      SPACING.m,
    gap:          SPACING.m,
    paddingBottom: 100,
  },

  /* Supplier card */
  card: {
    backgroundColor: C.surface,
    borderRadius:    R,
    overflow:        'hidden',
  },
  cardHeader: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: SPACING.m,
    paddingVertical:   SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: C.surface2,
  },
  supplierLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.s,
    flex:          1,
    marginRight:   SPACING.s,
  },
  supplierIcon: {
    width:           32,
    height:          32,
    borderRadius:    R,
    backgroundColor: C.surface2,
    alignItems:      'center',
    justifyContent:  'center',
  },
  supplierName: {
    fontSize:   15,
    fontWeight: '700',
    color:      C.text,
  },
  supplierSub: {
    fontSize:  12,
    color:     C.text2,
    marginTop: 1,
  },
  sendRow: {
    flexDirection: 'row',
    gap:           SPACING.s,
  },
  sendBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    height:          36,
    paddingHorizontal: SPACING.m,
    backgroundColor: C.accent,
    borderRadius:    R,
  },
  sendBtnText: {
    fontSize:   13,
    fontWeight: '700',
    color:      C.bg,
  },
  phoneBtn: {
    width:           36,
    height:          36,
    borderRadius:    R,
    backgroundColor: C.surface2,
    alignItems:      'center',
    justifyContent:  'center',
  },

  /* Order item row */
  orderRow: {
    flexDirection: 'row',
    alignItems:    'stretch',
  },
  orderRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.surface2,
  },
  urgBar: {
    width: 4,
  },
  orderContent: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: SPACING.m,
    paddingVertical:   SPACING.m,
    gap:             SPACING.m,
  },
  orderLeft: {
    flex: 1,
  },
  orderName: {
    fontSize:     15,
    fontWeight:   '600',
    color:        C.text,
    marginBottom: 4,
  },
  orderMeta: {
    fontSize: 12,
    color:    C.text2,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap:        SPACING.s,
  },

  /* Status tag */
  tag: {
    paddingHorizontal: SPACING.s,
    paddingVertical:   3,
    borderRadius:      R,
  },
  tagText: {
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 0.6,
  },

  /* Order qty box */
  qtyBox: {
    alignItems:      'center',
    backgroundColor: C.surface2,
    borderRadius:    R,
    paddingHorizontal: SPACING.s,
    paddingVertical:   4,
    minWidth:        40,
  },
  qtyNum: {
    fontSize:   20,
    fontWeight: '700',
    color:      C.text,
    lineHeight: 24,
  },
  qtyLabel: {
    fontSize:   9,
    fontWeight: '600',
    color:      C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  /* Empty */
  emptyRoot: {
    flex:            1,
    backgroundColor: C.bg,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             SPACING.m,
  },
  emptyIcon: {
    width:           72,
    height:          72,
    borderRadius:    R,
    backgroundColor: C.accent + '18',
    alignItems:      'center',
    justifyContent:  'center',
  },
  emptyTitle: {
    fontSize:   22,
    fontWeight: '700',
    color:      C.text,
  },
  emptyBody: {
    fontSize:   14,
    color:      C.text2,
    textAlign:  'center',
    lineHeight: 22,
  },
});
