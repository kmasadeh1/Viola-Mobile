import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LunchScreen() {
  const [activeTab, setActiveTab] = useState('sandwiches');

  const menu = [
    { id: 1, category: 'sandwiches', name: 'Cheese Sandwich', price: 1.5, image: 'https://placehold.co/100x100/orange/white?text=Cheese' },
    { id: 2, category: 'sandwiches', name: 'Turkey Wrap', price: 2.0, image: 'https://placehold.co/100x100/brown/white?text=Turkey' },
    { id: 3, category: 'snacks', name: 'Apple Slices', price: 0.5, image: 'https://placehold.co/100x100/red/white?text=Apple' },
    { id: 4, category: 'snacks', name: 'Juice Box', price: 0.25, image: 'https://placehold.co/100x100/blue/white?text=Juice' },
  ];

  const filteredMenu = menu.filter(item => item.category === activeTab);

  const orderItem = async (item: any) => {
      // Re-using the same cart logic for simplicity
      try {
        const existing = await AsyncStorage.getItem('viola_cart');
        let cart = existing ? JSON.parse(existing) : [];
        cart.push(item);
        await AsyncStorage.setItem('viola_cart', JSON.stringify(cart));
        Alert.alert("Yum!", `${item.name} added to lunch order.`);
      } catch(e) { console.error(e); }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f39c12', '#e67e22']} style={styles.header}>
        <Text style={styles.headerTitle}>Lunch Menu</Text>
        <Text style={styles.headerSub}>Healthy & Delicious</Text>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.tabs}>
        {['sandwiches', 'snacks'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filteredMenu.map((item) => (
          <View key={item.id} style={styles.item}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price.toFixed(2)} JOD</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => orderItem(item)}>
              <Text style={{fontSize:20, color: 'white'}}>+</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  
  tabs: { flexDirection: 'row', padding: 15, justifyContent: 'center' },
  tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginHorizontal: 5, backgroundColor: '#eee' },
  activeTab: { backgroundColor: '#e67e22' },
  tabText: { color: '#666', fontWeight: 'bold' },
  activeTabText: { color: 'white' },

  list: { padding: 20 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginBottom: 15, borderRadius: 15, padding: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  itemImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemPrice: { color: '#e67e22', fontWeight: 'bold' },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2c3e50', justifyContent: 'center', alignItems: 'center' }
});