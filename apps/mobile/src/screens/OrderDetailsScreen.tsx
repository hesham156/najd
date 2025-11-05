/**
 * Order Details Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function OrderDetailsScreen({ route }: any) {
  const { orderId } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>تفاصيل الطلب</Text>
        <Text style={styles.text}>Order ID: {orderId}</Text>
        <Text style={styles.placeholder}>سيتم إضافة التفاصيل الكاملة للطلب هنا</Text>
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
  text: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'right',
  },
  placeholder: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
});

