/**
 * New Order Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function NewOrderScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>إنشاء طلب جديد</Text>
        <Text style={styles.placeholder}>
          سيتم إضافة نموذج إنشاء الطلب هنا (مشابه لصفحة الويب)
        </Text>
      </View>
    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'right',
  },
  placeholder: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
});

