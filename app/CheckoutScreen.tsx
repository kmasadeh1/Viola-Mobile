import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const data = await AsyncStorage.getItem('viola_cart');
    if (data) {
      const items = JSON.parse(data);
      setCart(items);
      // Calculate total
      const t = items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
      setTotal(t);
    }
  };

  const clearCart = async () => {
    await AsyncStorage.removeItem('viola_cart');
    setCart([]);
    setTotal(0);
    Alert.alert("Cart Cleared");
  };

  const checkout = () => {
      if(cart.length === 0) return;
      Alert.alert("Order Placed", "Your order has been sent to the administration!");
      clearCart();
      router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart 🛒</Text>
      
      <ScrollView contentContainerStyle={styles.list}>
        {cart.length === 0 ? (
            <Text style={{textAlign:'center', color:'#999', marginTop: 50}}>Cart is empty</Text>
        ) : (
            cart.map((item, index) => (
            <View key={index} style={styles.item}>
                <Text style={styles.itemName}>{item.title || item.name}</Text>
                <Text style={styles.itemPrice}>{item.price} JOD</Text>
            </View>
            ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>{total.toFixed(2)} JOD</Text>
        </View>
        <View style={styles.btnRow}>
            <TouchableOpacity onPress={clearCart} style={[styles.btn, styles.clearBtn]}>
                <Text style={{color: 'red'}}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={checkout} style={[styles.btn, styles.payBtn]}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Checkout Now</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  list: { paddingBottom: 100 },
  item: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', elevation: 1 },
  itemName: { fontSize: 16 },
  itemPrice: { fontWeight: 'bold' },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalText: { fontSize: 18, color: '#555' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#27ae60' },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  clearBtn: { backgroundColor: '#fee' },
  payBtn: { backgroundColor: '#27ae60' }
});