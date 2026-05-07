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

const PAR_MULTIPLIER = 2;

function getOrderQty(item) {
  const par = Math.max(item.minQty * PAR_MULTIPLIER, item.minQty + 1);
  return Math.max(par - item.qty, 0);
}

function getStatus(item) {
  if (item.qty === 0) return 'out';
  if (item.qty <= item.minQty) return 'low';
  return 'order';
}

function StatusBadge({ status, t }) {
  if (status === 'out') {
    return (
      <View style={[styles.statusBadge, styles.statusBadgeRed]}>
        <Text style={[styles.statusBadgeText, { color: '#FF3B30' }]}>{t('outOfStock')}</Text>
      </View>
    );
  }
  if (status === 'low') {
    return (
      <View style={[styles.statusBadge, styles.statusBadgeOrange]}>
        <Text style={[styles.statusBadgeText, { color: '#FF9500' }]}>{t('lowStock')}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.statusBadge, styles.statusBadgeGreen]}>
      <Text style={[styles.statusBadgeText, { color: '#34C759' }]}>{t('toOrder')}</Text>
    </View>
  );
}

function sendWhatsApp(supplier, items, t) {
  const lines = items
    .map(i => `• ${i.item}: ${i.orderQty} ${i.units || 'units'}`)
    .join('\n');
  const message = `*Order for ${supplier}*\n\n${lines}\n\n_Sent via Steady_`;
  const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
    }
  });
}

function sendPhone(supplier) {
  Alert.alert(
    supplier,
    'No phone number stored for this supplier. Add one in the supplier details.',
    [{ text: 'OK' }]
  );
}

export default function OrdersScreen() {
  const { inventory } = useApp();
  const { t } = useTranslation();

  const supplierGroups = useMemo(() => {
    const orderItems = inventory
      .map(item => ({ ...item, orderQty: getOrderQty(item), status: getStatus(item) }))
      .filter(item => item.orderQty > 0);

    const grouped = {};
    orderItems.forEach(item => {
      const sup = item.supplier || 'Unknown';
      if (!grouped[sup]) grouped[sup] = [];
      grouped[sup].push(item);
    });

    // Sort each group: out-of-stock first, then low stock, then regular
    const statusOrder = { out: 0, low: 1, order: 2 };
    return Object.entries(grouped)
      .map(([supplier, items]) => ({
        supplier,
        items: [...items].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]),
        totalItems: items.length,
        hasUrgent: items.some(i => i.status === 'out' || i.status === 'low'),
      }))
      .sort((a, b) => (b.hasUrgent ? 1 : 0) - (a.hasUrgent ? 1 : 0));
  }, [inventory]);

  if (supplierGroups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>✓</Text>
        </View>
        <Text style={styles.emptyTitle}>{t('noOrders')}</Text>
      </View>
    );
  }

  const renderGroup = ({ item: group }) => (
    <View style={styles.supplierCard}>
      {/* Supplier Header */}
      <View style={styles.supplierHeader}>
        <View style={styles.supplierInfo}>
          <Ionicons name="business-outline" size={18} color="#000000" />
          <Text style={styles.supplierName}>{group.supplier}</Text>
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>{group.totalItems}</Text>
          </View>
        </View>
        <View style={styles.sendButtons}>
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => sendWhatsApp(group.supplier, group.items, t)}
            activeOpacity={0.75}
          >
            <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            <Text style={styles.sendBtnText}>{t('sendOrder')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, styles.sendBtnPhone]}
            onPress={() => sendPhone(group.supplier)}
            activeOpacity={0.75}
          >
            <Ionicons name="call-outline" size={16} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items */}
      {group.items.map((item, idx) => (
        <View
          key={item.id}
          style={[
            styles.orderItem,
            idx < group.items.length - 1 && styles.orderItemBorder,
          ]}
        >
          <View style={[styles.urgencyBar, item.status === 'out' && styles.urgencyRed, item.status === 'low' && styles.urgencyOrange, item.status === 'order' && styles.urgencyGreen]} />
          <View style={styles.orderItemContent}>
            <View style={styles.orderItemLeft}>
              <Text style={styles.orderItemName}>{item.item}</Text>
              <Text style={styles.orderItemStock}>
                {t('currentQty')}: {item.qty}  ·  Min: {item.minQty}
              </Text>
            </View>
            <View style={styles.orderItemRight}>
              <StatusBadge status={item.status} t={t} />
              <View style={styles.orderQtyBox}>
                <Text style={styles.orderQtyLabel}>{t('suggestedOrder')}</Text>
                <Text style={styles.orderQty}>{item.orderQty}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>{t('outOfStock')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
          <Text style={styles.legendText}>{t('lowStock')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.legendText}>{t('toOrder')}</Text>
        </View>
      </View>

      <FlatList
        data={supplierGroups}
        keyExtractor={group => group.supplier}
        renderItem={renderGroup}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  legend: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#3C3C43',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  supplierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F7',
    gap: 12,
  },
  supplierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  supplierName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
  },
  itemCountBadge: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  sendButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
  },
  sendBtnPhone: {
    paddingHorizontal: 10,
  },
  sendBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  orderItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F7',
  },
  urgencyBar: {
    width: 4,
  },
  urgencyRed: {
    backgroundColor: '#FF3B30',
  },
  urgencyOrange: {
    backgroundColor: '#FF9500',
  },
  urgencyGreen: {
    backgroundColor: '#34C759',
  },
  orderItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  orderItemLeft: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 3,
  },
  orderItemStock: {
    fontSize: 12,
    color: '#8E8E93',
  },
  orderItemRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeRed: { backgroundColor: '#FF3B3015' },
  statusBadgeOrange: { backgroundColor: '#FF950015' },
  statusBadgeGreen: { backgroundColor: '#34C75915' },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  orderQtyBox: {
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orderQtyLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  orderQty: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C75920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconText: {
    fontSize: 36,
    color: '#34C759',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C3C43',
    textAlign: 'center',
    lineHeight: 26,
  },
});
