/**
 * Profile Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'نعم',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert('خطأ', 'فشل تسجيل الخروج');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0) || '👤'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{getRoleLabel(user?.role || '')}</Text>
      </View>

      <View style={styles.section}>
        <InfoRow label="القسم" value={getDepartmentLabel(user?.department || '')} />
        <InfoRow label="الحالة" value={user?.isActive ? 'نشط' : 'غير نشط'} />
        <InfoRow
          label="رئيس القسم"
          value={user?.isHead ? 'نعم' : 'لا'}
        />
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>تسجيل الخروج</Text>
      </TouchableOpacity>

      <Text style={styles.version}>الإصدار 1.0.0</Text>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ceo: 'المدير التنفيذي',
    sales: 'مبيعات',
    sales_head: 'مدير المبيعات',
    design: 'مصمم',
    design_head: 'مدير التصميم',
    printing: 'طباعة',
    printing_head: 'مدير الطباعة',
    accounting: 'محاسب',
    accounting_head: 'مدير الحسابات',
    dispatch: 'إرسال',
    dispatch_head: 'مدير الإرسال',
  };
  return labels[role] || role;
}

function getDepartmentLabel(department: string): string {
  const labels: Record<string, string> = {
    management: 'الإدارة',
    sales: 'المبيعات',
    design: 'التصميم',
    printing: 'الطباعة',
    accounting: 'الحسابات',
    dispatch: 'الإرسال',
  };
  return labels[department] || department;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#0369a1',
    padding: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 8,
  },
  role: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 32,
  },
});

