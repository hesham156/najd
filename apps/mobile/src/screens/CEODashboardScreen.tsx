/**
 * CEO Dashboard Screen - لوحة المدير التنفيذي
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  priority: string;
  isUrgent?: boolean;
  estimatedCost?: number;
  timeline: any[];
}

export default function CEODashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [urgentOrders, setUrgentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef);
      const snapshot = await getDocs(q);
      
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));

      setOrders(allOrders);
      
      // طلبات تحتاج موافقة
      const pending = allOrders.filter(o => o.status === 'pending_ceo_review');
      setPendingOrders(pending);

      // طلبات عاجلة
      const urgent = allOrders.filter(o => 
        (o.isUrgent || o.priority === 'urgent') && 
        !['delivered', 'cancelled'].includes(o.status)
      );
      setUrgentOrders(urgent);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const approveOrder = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const orderRef = doc(db, 'orders', orderId);
      
      const timelineEntry = {
        id: `${Date.now()}_${Math.random()}`,
        status: 'pending_printing',
        userId: user?.uid,
        userName: user?.displayName,
        userRole: user?.role,
        timestamp: Timestamp.now(),
        action: 'موافقة المدير على الطلب',
      };

      await updateDoc(orderRef, {
        status: 'pending_printing',
        updatedAt: Timestamp.now(),
        timeline: [...order.timeline, timelineEntry],
      });

      Alert.alert('نجاح', 'تمت الموافقة على الطلب بنجاح ✓');
      fetchData();
    } catch (error) {
      console.error('Error approving order:', error);
      Alert.alert('خطأ', 'حدث خطأ في الموافقة على الطلب');
    }
  };

  const rejectOrder = async (orderId: string) => {
    Alert.prompt(
      'رفض الطلب',
      'سبب الرفض (اختياري):',
      async (reason) => {
        try {
          const order = orders.find(o => o.id === orderId);
          if (!order) return;

          const orderRef = doc(db, 'orders', orderId);

          const timelineEntry = {
            id: `${Date.now()}_${Math.random()}`,
            status: 'rejected_by_ceo',
            userId: user?.uid,
            userName: user?.displayName,
            userRole: user?.role,
            timestamp: Timestamp.now(),
            action: `رفض الطلب${reason ? `: ${reason}` : ''}`,
            notes: reason || undefined,
          };

          await updateDoc(orderRef, {
            status: 'rejected_by_ceo',
            updatedAt: Timestamp.now(),
            timeline: [...order.timeline, timelineEntry],
          });

          Alert.alert('تم', 'تم رفض الطلب');
          fetchData();
        } catch (error) {
          console.error('Error rejecting order:', error);
          Alert.alert('خطأ', 'حدث خطأ في رفض الطلب');
        }
      }
    );
  };

  // إحصائيات
  const stats = {
    total: orders.length,
    needsReview: pendingOrders.length,
    urgent: urgentOrders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👑 لوحة المدير التنفيذي</Text>
        <Text style={styles.headerSubtitle}>مراقبة شاملة واتخاذ القرار</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatCard title="إجمالي الطلبات" value={stats.total.toString()} icon="📊" color="#3b82f6" />
        <StatCard title="تحتاج موافقتك" value={stats.needsReview.toString()} icon="⏳" color="#f59e0b" />
        <StatCard title="طلبات عاجلة" value={stats.urgent.toString()} icon="🔥" color="#ef4444" />
        <StatCard title="تم التسليم" value={stats.delivered.toString()} icon="✅" color="#10b981" />
      </View>

      {/* Pending Approval Orders */}
      {pendingOrders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏳ طلبات تحتاج موافقة ({pendingOrders.length})</Text>
          {pendingOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <Text style={styles.orderCustomer}>{order.customerName}</Text>
                </View>
                {order.priority === 'urgent' && (
                  <View style={[styles.priorityBadge, { backgroundColor: '#ef4444' }]}>
                    <Text style={styles.priorityText}>عاجل</Text>
                  </View>
                )}
              </View>
              
              {order.estimatedCost && (
                <Text style={styles.orderCost}>💰 {order.estimatedCost.toLocaleString()} ر.س</Text>
              )}

              <View style={styles.orderActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => approveOrder(order.id)}
                >
                  <Text style={styles.actionBtnText}>✓ موافقة</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => rejectOrder(order.id)}
                >
                  <Text style={styles.actionBtnText}>✗ رفض</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.viewBtn]}
                  onPress={() => navigation.navigate('OrderDetails' as never, { orderId: order.id } as never)}
                >
                  <Text style={styles.viewBtnText}>عرض</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Urgent Orders */}
      {urgentOrders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 الطلبات العاجلة ({urgentOrders.length})</Text>
          {urgentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.urgentCard}
              onPress={() => navigation.navigate('OrderDetails' as never, { orderId: order.id } as never)}
            >
              <View style={styles.urgentHeader}>
                <Text style={styles.urgentIcon}>🔥</Text>
                <View style={styles.urgentInfo}>
                  <Text style={styles.urgentNumber}>{order.orderNumber}</Text>
                  <Text style={styles.urgentCustomer}>{order.customerName}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'right',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  statIcon: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'right',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  orderCustomer: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderCost: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#10b981',
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
  },
  viewBtn: {
    backgroundColor: '#e5e7eb',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  urgentCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fca5a5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgentIcon: {
    fontSize: 32,
    marginLeft: 12,
  },
  urgentInfo: {
    flex: 1,
  },
  urgentNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  urgentCustomer: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 2,
  },
});

