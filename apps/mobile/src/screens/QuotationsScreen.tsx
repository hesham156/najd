/**
 * Quotations Screen - شاشة عروض الأسعار
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
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  relatedOrderNumber: string;
  status: string;
  totalAmount: number;
  preparedByName: string;
  createdAt: any;
}

export default function QuotationsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const fetchQuotations = async () => {
    try {
      const quotationsRef = collection(db, 'quotations');
      const q = query(quotationsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Quotation));

      setQuotations(data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل عروض الأسعار');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchQuotations();
    setRefreshing(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quotation_pending_approval':
        return '#f59e0b';
      case 'quotation_approved':
        return '#10b981';
      case 'quotation_sent_to_customer':
        return '#3b82f6';
      case 'quotation_rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      quotation_pending_approval: 'قيد المراجعة',
      quotation_approved: 'تمت الموافقة',
      quotation_sent_to_customer: 'تم الإرسال للعميل',
      quotation_rejected: 'مرفوض',
    };
    return labels[status] || status;
  };

  // تصفية حسب الحالة
  const pendingQuotations = quotations.filter(q => q.status === 'quotation_pending_approval');
  const approvedQuotations = quotations.filter(q => q.status === 'quotation_approved');
  const sentQuotations = quotations.filter(q => q.status === 'quotation_sent_to_customer');

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
        <Text style={styles.headerTitle}>💰 عروض الأسعار</Text>
        <Text style={styles.headerSubtitle}>إدارة ومتابعة عروض الأسعار</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <StatCard
          title="الإجمالي"
          value={quotations.length.toString()}
          color="#3b82f6"
        />
        <StatCard
          title="قيد المراجعة"
          value={pendingQuotations.length.toString()}
          color="#f59e0b"
        />
        <StatCard
          title="تمت الموافقة"
          value={approvedQuotations.length.toString()}
          color="#10b981"
        />
      </View>

      {/* Create New Button */}
      {(user?.department === 'accounting' || user?.department === 'sales') && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {/* TODO: Navigate to create quotation */}}
        >
          <Text style={styles.createButtonIcon}>➕</Text>
          <Text style={styles.createButtonText}>إنشاء عرض سعر جديد</Text>
        </TouchableOpacity>
      )}

      {/* Pending Quotations */}
      {pendingQuotations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⏳ قيد المراجعة</Text>
            <View style={[styles.badge, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.badgeText}>{pendingQuotations.length}</Text>
            </View>
          </View>
          
          {pendingQuotations.map((quotation) => (
            <QuotationCard
              key={quotation.id}
              quotation={quotation}
              onPress={() => {/* TODO: Navigate to quotation details */}}
            />
          ))}
        </View>
      )}

      {/* Approved Quotations */}
      {approvedQuotations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✅ تمت الموافقة</Text>
            <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
              <Text style={styles.badgeText}>{approvedQuotations.length}</Text>
            </View>
          </View>
          
          {approvedQuotations.map((quotation) => (
            <QuotationCard
              key={quotation.id}
              quotation={quotation}
              onPress={() => {/* TODO: Navigate to quotation details */}}
            />
          ))}
        </View>
      )}

      {/* Sent Quotations */}
      {sentQuotations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📤 تم الإرسال للعميل</Text>
            <View style={[styles.badge, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.badgeText}>{sentQuotations.length}</Text>
            </View>
          </View>
          
          {sentQuotations.map((quotation) => (
            <QuotationCard
              key={quotation.id}
              quotation={quotation}
              onPress={() => {/* TODO: Navigate to quotation details */}}
            />
          ))}
        </View>
      )}

      {quotations.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>لا توجد عروض أسعار</Text>
        </View>
      )}
    </ScrollView>
  );
}

function QuotationCard({
  quotation,
  onPress,
}: {
  quotation: Quotation;
  onPress: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quotation_pending_approval':
        return '#f59e0b';
      case 'quotation_approved':
        return '#10b981';
      case 'quotation_sent_to_customer':
        return '#3b82f6';
      case 'quotation_rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      quotation_pending_approval: 'قيد المراجعة',
      quotation_approved: 'تمت الموافقة',
      quotation_sent_to_customer: 'تم الإرسال للعميل',
      quotation_rejected: 'مرفوض',
    };
    return labels[status] || status;
  };

  return (
    <TouchableOpacity
      style={styles.quotationCard}
      onPress={onPress}
    >
      <View style={styles.quotationHeader}>
        <View style={styles.quotationInfo}>
          <Text style={styles.quotationNumber}>{quotation.quotationNumber}</Text>
          <Text style={styles.quotationCustomer}>{quotation.customerName}</Text>
          <Text style={styles.quotationOrder}>للطلب: {quotation.relatedOrderNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quotation.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(quotation.status)}</Text>
        </View>
      </View>

      <View style={styles.quotationFooter}>
        <Text style={styles.quotationAmount}>
          💰 {quotation.totalAmount?.toFixed(2)} ر.س
        </Text>
        <Text style={styles.quotationPreparedBy}>
          أعده: {quotation.preparedByName}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
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
  statsRow: {
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
  statTitle: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'right',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  createButtonIcon: {
    fontSize: 24,
    marginLeft: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
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
  quotationCard: {
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
  quotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quotationInfo: {
    flex: 1,
  },
  quotationNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  quotationCustomer: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  quotationOrder: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quotationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  quotationAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  quotationPreparedBy: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

