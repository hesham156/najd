/**
 * Users Management Screen - شاشة إدارة المستخدمين
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
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  department: string;
  isActive?: boolean;
  createdAt: any;
}

export default function UsersScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // التحقق من صلاحيات الوصول - فقط CEO
  useEffect(() => {
    if (user?.role !== 'ceo') {
      Alert.alert('خطأ', 'ليس لديك صلاحية الوصول لهذه الصفحة');
      navigation.goBack();
    }
  }, [user, navigation]);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: !currentStatus,
      });

      Alert.alert('نجاح', `تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحديث حالة المستخدم');
    }
  };

  // تجميع المستخدمين حسب القسم
  const usersByDepartment = users.reduce((acc, user) => {
    const dept = user.department || 'other';
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  const getDepartmentLabel = (dept: string) => {
    const labels: Record<string, string> = {
      sales: 'المبيعات',
      design: 'التصميم',
      printing: 'الطباعة',
      accounting: 'المحاسبة',
      dispatch: 'الإرسال',
      ceo: 'الإدارة',
      other: 'أخرى',
    };
    return labels[dept] || dept;
  };

  const getDepartmentIcon = (dept: string) => {
    const icons: Record<string, string> = {
      sales: '💼',
      design: '🎨',
      printing: '🖨️',
      accounting: '💰',
      dispatch: '📦',
      ceo: '👑',
      other: '👤',
    };
    return icons[dept] || '👤';
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
        <Text style={styles.headerTitle}>👥 إدارة المستخدمين</Text>
        <Text style={styles.headerSubtitle}>
          عرض وإدارة مستخدمي النظام ({users.length})
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          title="الإجمالي"
          value={users.length.toString()}
          color="#3b82f6"
        />
        <StatCard
          title="نشط"
          value={users.filter(u => u.isActive !== false).length.toString()}
          color="#10b981"
        />
        <StatCard
          title="معطل"
          value={users.filter(u => u.isActive === false).length.toString()}
          color="#ef4444"
        />
      </View>

      {/* Users by Department */}
      {Object.entries(usersByDepartment).map(([dept, deptUsers]) => (
        <View key={dept} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {getDepartmentIcon(dept)} {getDepartmentLabel(dept)}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{deptUsers.length}</Text>
            </View>
          </View>
          
          {deptUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onToggleStatus={() => toggleUserStatus(user.id, user.isActive !== false)}
            />
          ))}
        </View>
      ))}

      {users.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>لا يوجد مستخدمين</Text>
        </View>
      )}
    </ScrollView>
  );
}

function UserCard({
  user,
  onToggleStatus,
}: {
  user: User;
  onToggleStatus: () => void;
}) {
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ceo: 'مدير تنفيذي',
      sales: 'مبيعات',
      sales_head: 'رئيس مبيعات',
      designer: 'مصمم',
      designer_head: 'رئيس قسم التصميم',
      printer: 'موظف طباعة',
      printer_head: 'رئيس قسم الطباعة',
      accountant: 'محاسب',
      accountant_head: 'رئيس قسم المحاسبة',
      dispatch: 'موظف إرسال',
      dispatch_head: 'رئيس قسم الإرسال',
    };
    return labels[role] || role;
  };

  const isActive = user.isActive !== false;

  return (
    <View style={[styles.userCard, !isActive && styles.userCardInactive]}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <View style={styles.userNameContainer}>
            <Text style={styles.userName}>{user.displayName}</Text>
            {!isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>معطل</Text>
              </View>
            )}
          </View>
          <Text style={styles.userRole}>{getRoleLabel(user.role)}</Text>
        </View>
        <Text style={styles.userEmail}>📧 {user.email}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          { backgroundColor: isActive ? '#ef4444' : '#10b981' }
        ]}
        onPress={onToggleStatus}
      >
        <Text style={styles.toggleButtonText}>
          {isActive ? 'تعطيل' : 'تفعيل'}
        </Text>
      </TouchableOpacity>
    </View>
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
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCardInactive: {
    opacity: 0.6,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    marginBottom: 8,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  inactiveBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inactiveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
  userEmail: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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

