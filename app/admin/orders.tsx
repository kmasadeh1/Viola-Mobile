import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderManager() {
  const [orders, setOrders] = useState([
    { id: '101', parent: 'Mr. Masadeh', items: 'Summer Uniform (x1)', total: '15 JOD', status: 'Pending' },
    { id: '102', parent: 'Mrs. Smith', items: 'Winter Uniform (x1)', total: '25 JOD', status: 'Pending' },
  ]);

  const markComplete = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'Completed' } : o));
    Alert.alert("Updated", "Order marked as completed.");
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2ecc71', '#27ae60']} style={styles.header}>
        <Text style={styles.headerTitle}>Shop Orders</Text>
      </LinearGradient>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text style={{color: item.status === 'Pending' ? 'orange' : 'green', fontWeight:'bold'}}>{item.status}</Text>
            </View>
            <Text style={styles.parentName}>{item.parent}</Text>
            <Text style={styles.items}>{item.items}</Text>
            
            <View style={styles.footer}>
                <Text style={styles.total}>{item.total}</Text>
                {item.status === 'Pending' && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => markComplete(item.id)}>
                        <Text style={{color: 'white'}}>Mark Done</Text>
                    </TouchableOpacity>
                )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  list: { padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontWeight: 'bold', color: '#999' },
  parentName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  items: { color: '#666', marginVertical: 5 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' },
  total: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
  actionBtn: { backgroundColor: '#2ecc71', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }
});