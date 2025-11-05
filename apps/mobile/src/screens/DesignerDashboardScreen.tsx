/**
 * Designer Dashboard Screen - لوحة قسم التصميم
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
  customerPhone: string;
  status: string;
  priority: string;
  printType: string;
  quantity: number;
  designDescription?: string;
  timeline: any[];
}

const OrderStatus = {
  PENDING_DESIGN: 'pending_design',
  IN_DESIGN: 'in_design',
  DESIGN_REVIEW: 'design_review',
  DESIGN_COMPLETED: 'design_completed',
  PENDING_MATERIALS: 'pending_materials',
  MATERIALS_IN_PROGRESS: 'materials_in_progress',
};

export default function DesignerDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [inProgressOrders, setInProgressOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  const fetchData = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef);
      const snapshot = await getDocs(q);
      
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));

      // تصفية الطلبات حسب قسم التصميم
      const designOrders = allOrders.filter((order) =>
        [
          OrderStatus.PENDING_DESIGN,
          OrderStatus.IN_DESIGN,
          OrderStatus.DESIGN_REVIEW,
          OrderStatus.DESIGN_COMPLETED,
          OrderStatus.PENDING_MATERIALS,
          OrderStatus.MATERIALS_IN_PROGRESS,
        ].includes(order.status)
      );

      setOrders(designOrders);
      setNewOrders(designOrders.filter(o => o.status === OrderStatus.PENDING_DESIGN));
      setInProgressOrders(designOrders.filter(o => 
        [OrderStatus.IN_DESIGN, OrderStatus.DESIGN_REVIEW].includes(o.status)
      ));
      setCompletedOrders(designOrders.filter(o => o.status === OrderStatus.DESIGN_COMPLETED));
      
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

  const updateOrderStatus = async (orderId: string, newStatus: string, action: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const orderRef = doc(db, 'orders', orderId);
      
      const timelineEntry = {
        id: `${Date.now()}_${Math.random()}`,
        status: newStatus,
        userId: user?.uid,
        userName: user?.displayName,
        userRole: user?.role,
        timestamp: Timestamp.now(),
        action: action,
      };

      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
        timeline: [...order.timeline, timelineEntry],
      });

      Alert.alert('نجاح', 'تم تحديث الحالة بنجاح ✓');
      fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحديث حالة الطلب');
    }
  };

  const stats = {
    total: orders.length,
    new: newOrders.length,
    inProgress: inProgressOrders.length,
    completed: completedOrders.length,
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
        <Text style={styles.headerTitle}>🎨 لوحة قسم التصميم</Text>
        <Text style={styles.headerSubtitle}>إدارة طلبات التصميم</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatCard title="الإجمالي" value={stats.total.toString()} color="#6b7280" />
        <StatCard title="جديد" value={stats.new.toString()} color="#f59e0b" />
        <StatCard title="قيد العمل" value={stats.inProgress.toString()} color="#3b82f6" />
        <StatCard title="مكتمل" value={stats.completed.toString()} color="#10b981" />
      </View>

      {/* New Orders Section */}
      {newOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 طلبات جديدة</Text>
            <View style={[styles.badge, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.badgeText}>{newOrders.length}</Text>
            </View>
          </View>
          
          {newOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={updateOrderStatus}
              onViewDetails={() => navigation.navigate('OrderDetails' as never, { orderId: order.id } as never)}
            />
          ))}
        </View>
      )}

      {/* In Progress Orders Section */}
      {inProgressOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎨 جاري العمل</Text>
            <View style={[styles.badge, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.badgeText}>{inProgressOrders.length}</Text>
            </View>
          </View>
          
          {inProgressOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={updateOrderStatus}
              onViewDetails={() => navigation.navigate('OrderDetails' as never, { orderId: order.id } as never)}
            />
          ))}
        </View>
      )}

      {/* Completed Orders Section */}
      {completedOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✅ تم الانتهاء</Text>
            <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
              <Text style={styles.badgeText}>{completedOrders.length}</Text>
            </View>
          </View>
          
          {completedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={updateOrderStatus}
              onViewDetails={() => navigation.navigate('OrderDetails' as never, { orderId: order.id } as never)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function OrderCard({
  order,
  onStatusUpdate,
  onViewDetails,
}: {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: string, action: string) => void;
  onViewDetails: () => void;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'مرتفع';
      case 'medium': return 'متوسط';
      default: return 'عادي';
    }
  };

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.orderCustomer}>{order.customerName}</Text>
          <Text style={styles.orderPhone}>📱 {order.customerPhone}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(order.priority) }]}>
          <Text style={styles.priorityText}>{getPriorityLabel(order.priority)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderDetailText}>📦 الكمية: {order.quantity}</Text>
        {order.designDescription && (
          <Text style={styles.orderDescription} numberOfLines={2}>
            {order.designDescription}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.orderActions}>
        {order.status === OrderStatus.PENDING_DESIGN && (
          <TouchableOpacity
            style={[styles.statusBtn, { backgroundColor: '#3b82f6' }]}
            onPress={() => onStatusUpdate(order.id, OrderStatus.IN_DESIGN, 'بدء العمل على التصميم')}
          >
            <Text style={styles.statusBtnText}>▶️ بدء العمل</Text>
          </TouchableOpacity>
        )}

        {order.status === OrderStatus.IN_DESIGN && (
          <>
            <TouchableOpacity
              style={[styles.statusBtn, { backgroundColor: '#f59e0b', flex: 1 }]}
              onPress={() => onStatusUpdate(order.id, OrderStatus.DESIGN_REVIEW, 'إرسال للمراجعة')}
            >
              <Text style={styles.statusBtnText}>للمراجعة</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusBtn, { backgroundColor: '#10b981', flex: 1, marginRight: 8 }]}
              onPress={() => onStatusUpdate(order.id, OrderStatus.DESIGN_COMPLETED, 'اكتمال التصميم')}
            >
              <Text style={styles.statusBtnText}>إنهاء</Text>
            </TouchableOpacity>
          </>
        )}

        {order.status === OrderStatus.DESIGN_COMPLETED && (
          <TouchableOpacity
            style={[styles.statusBtn, { backgroundColor: '#8b5cf6' }]}
            onPress={() => onStatusUpdate(order.id, OrderStatus.PENDING_MATERIALS, 'إرسال للمندوب')}
          >
            <Text style={styles.statusBtnText}>📦 إرسال للمندوب</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.viewBtn}
          onPress={onViewDetails}
        >
          <Text style={styles.viewBtnText}>عرض التفاصيل</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'right',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  orderPhone: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    height: 28,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
    marginBottom: 4,
  },
  orderDescription: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  viewBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});

