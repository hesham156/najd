/**
 * Dashboard Screen - توجيه المستخدمين حسب أدوارهم
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// استيراد لوحات التحكم المتخصصة
import CEODashboardScreen from './CEODashboardScreen';
import AccountingDashboardScreen from './AccountingDashboardScreen';
import DesignerDashboardScreen from './DesignerDashboardScreen';
import PrintingDashboardScreen from './PrintingDashboardScreen';

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);

  // توجيه المستخدمين إلى لوحة التحكم المناسبة
  if (user?.role === 'ceo') {
    return <CEODashboardScreen />;
  }

  if (user?.department === 'accounting') {
    return <AccountingDashboardScreen />;
  }

  if (user?.department === 'design') {
    return <DesignerDashboardScreen />;
  }

  if (user?.department === 'printing') {
    return <PrintingDashboardScreen />;
  }

  // لوحة تحكم افتراضية لباقي المستخدمين (Sales، Dispatch، إلخ)
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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
        <Text style={styles.headerTitle}>مرحباً، {user?.displayName}</Text>
        <Text style={styles.headerSubtitle}>نظرة عامة على النظام</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatCard title="إجمالي الطلبات" value="24" icon="📊" color="#3b82f6" />
        <StatCard title="قيد المراجعة" value="5" icon="⏳" color="#f59e0b" />
        <StatCard title="قيد التنفيذ" value="12" icon="🔄" color="#8b5cf6" />
        <StatCard title="مكتملة" value="7" icon="✅" color="#10b981" />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إجراءات سريعة</Text>

        {(user?.role === 'sales' || user?.role === 'sales_head') && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
            onPress={() => navigation.navigate('NewOrder' as never)}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>إنشاء طلب جديد</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#0369a1' }]}
          onPress={() => navigation.navigate('Orders' as never)}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>عرض كل الطلبات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6b7280' }]}
          onPress={() => navigation.navigate('Notifications' as never)}
        >
          <Text style={styles.actionIcon}>🔔</Text>
          <Text style={styles.actionText}>الإشعارات</Text>
        </TouchableOpacity>

        {(user?.department === 'accounting' || user?.department === 'sales') && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
            onPress={() => navigation.navigate('Quotations' as never)}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionText}>عروض الأسعار</Text>
          </TouchableOpacity>
        )}

        {user?.role === 'ceo' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => navigation.navigate('Users' as never)}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>إدارة المستخدمين</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>النشاط الأخير</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>لا توجد أنشطة حديثة</Text>
        </View>
      </View>
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginLeft: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  activityText: {
    color: '#6b7280',
    fontSize: 14,
  },
});

