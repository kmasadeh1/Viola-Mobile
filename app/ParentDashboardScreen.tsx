import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Dashboard() {
  const router = useRouter();

  const menuItems = [
    { title: 'Schedule', icon: '📅', route: '/schedule', color: '#3498db' },
    { title: 'Bus', icon: '🚌', route: '/bus', color: '#e74c3c' },
    { title: 'Homework', icon: '📚', route: '/homework', color: '#9b59b6' },
    { title: 'Gallery', icon: '📷', route: '/gallery', color: '#e67e22' },
    { title: 'Shop', icon: '👕', route: '/shop', color: '#2ecc71' },
    { title: 'Lunch', icon: '🍔', route: '/lunch', color: '#f1c40f' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2c3e50', '#34495e']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>Mr. Parent</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={{fontSize: 20}}>👨‍👩‍👧</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.card} 
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                <Text style={{fontSize: 24}}>{item.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>View Details</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT UPDATED TO /login */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  nameText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  avatar: { width: 50, height: 50, backgroundColor: 'white', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  gridContainer: { padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardSub: { fontSize: 12, color: '#999', marginTop: 5 },
  logoutBtn: { marginTop: 20, padding: 15, backgroundColor: '#e74c3c', borderRadius: 10, alignItems: 'center' },
  logoutText: { color: 'white', fontWeight: 'bold' }
});