/**
 * Accounting Dashboard Screen - لوحة قسم المحاسبة
 */

import React, { useState, useEffect } from 'react';
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
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface DashboardStats {
  quotations: {
    total: number;
    pending: number;
    approved: number;
    sent: number;
  };
  invoices: {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
  };
  payments: {
    totalReceived: number;
    pendingAmount: number;
    thisMonth: number;
  };
}

export default function AccountingDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    quotations: { total: 0, pending: 0, approved: 0, sent: 0 },
    invoices: { total: 0, pending: 0, paid: 0, overdue: 0 },
    payments: { totalReceived: 0, pendingAmount: 0, thisMonth: 0 },
  });

  const fetchData = async () => {
    try {
      // TODO: جلب البيانات الحقيقية من Firestore
      // هذه بيانات تجريبية للعرض
      setStats({
        quotations: { total: 24, pending: 5, approved: 12, sent: 7 },
        invoices: { total: 48, pending: 8, paid: 35, overdue: 5 },
        payments: { totalReceived: 285000, pendingAmount: 45000, thisMonth: 125000 },
      });
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
        <Text style={styles.headerTitle}>💰 لوحة قسم المحاسبة</Text>
        <Text style={styles.headerSubtitle}>إدارة عروض الأسعار والفواتير</Text>
      </View>

      {/* Financial Stats */}
      <View style={styles.statsSection}>
        <FinancialCard
          title="المدفوعات المستلمة"
          amount={stats.payments.totalReceived}
          subtitle={`هذا الشهر: ${stats.payments.thisMonth.toLocaleString()} ر.س`}
          color="#10b981"
          icon="💰"
        />
        <FinancialCard
          title="مبالغ معلقة"
          amount={stats.payments.pendingAmount}
          subtitle={`فواتير معلقة: ${stats.invoices.pending}`}
          color="#f59e0b"
          icon="⏰"
        />
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="عروض الأسعار"
          value={stats.quotations.total.toString()}
          subtitle={`قيد الانتظار: ${stats.quotations.pending}`}
          color="#3b82f6"
          icon="📋"
        />
        <StatCard
          title="الفواتير"
          value={stats.invoices.total.toString()}
          subtitle={`مدفوعة: ${stats.invoices.paid}`}
          color="#8b5cf6"
          icon="📄"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ إجراءات سريعة</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
          onPress={() => {/* TODO: Navigate to new quotation */}}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionText}>إنشاء عرض سعر جديد</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
          onPress={() => {/* TODO: Navigate to new invoice */}}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionText}>إنشاء فاتورة جديدة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6b7280' }]}
          onPress={() => {/* TODO: Navigate to quotations list */}}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>إدارة عروض الأسعار</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6b7280' }]}
          onPress={() => {/* TODO: Navigate to invoices list */}}
        >
          <Text style={styles.actionIcon}>💼</Text>
          <Text style={styles.actionText}>إدارة الفواتير</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 النشاط الأخير</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            سيتم عرض آخر عروض الأسعار والفواتير هنا
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function FinancialCard({
  title,
  amount,
  subtitle,
  color,
  icon,
}: {
  title: string;
  amount: number;
  subtitle: string;
  color: string;
  icon: string;
}) {
  return (
    <View style={[styles.financialCard, { backgroundColor: color }]}>
      <View style={styles.financialIcon}>
        <Text style={styles.financialIconText}>{icon}</Text>
      </View>
      <Text style={styles.financialTitle}>{title}</Text>
      <Text style={styles.financialAmount}>{amount.toLocaleString()} ر.س</Text>
      <Text style={styles.financialSubtitle}>{subtitle}</Text>
    </View>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBg, { backgroundColor: color }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
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
  statsSection: {
    marginBottom: 16,
  },
  financialCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  financialIconText: {
    fontSize: 24,
  },
  financialTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textAlign: 'right',
  },
  financialAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'right',
  },
  financialSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'flex-end',
  },
  statIcon: {
    fontSize: 20,
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
    marginBottom: 4,
    textAlign: 'right',
  },
  statSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'right',
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
    textAlign: 'center',
  },
});

