import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminDashboard() {
  const router = useRouter();

  const adminTools = [
    { title: 'Students', icon: '🎓', route: '/admin/students', color: '#3498db' },
    { title: 'Teachers', icon: '👩‍🏫', route: '/admin/teachers', color: '#9b59b6' },
    { title: 'Shop Orders', icon: '🛍️', route: '/admin/orders', color: '#2ecc71' },
    { title: 'Broadcast', icon: '📢', route: '/teacher/broadcast', color: '#e74c3c' },
    { title: 'Bus Manager', icon: '🚌', route: '/admin/bus', color: '#f1c40f' },
    { title: 'Settings', icon: '⚙️', route: '/admin/settings', color: '#95a5a6' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2c3e50', '#34495e']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Admin Control</Text>
            <Text style={styles.nameText}>Viola Principal</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={{fontSize: 24}}>🛡️</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
            <View style={styles.statItem}><Text style={styles.statNum}>120</Text><Text style={styles.statLabel}>Students</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statNum}>15</Text><Text style={styles.statLabel}>Teachers</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statNum}>3</Text><Text style={styles.statLabel}>Orders</Text></View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        <Text style={styles.sectionTitle}>Management Tools</Text>
        <View style={styles.grid}>
          {adminTools.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.card} 
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                <Text style={{fontSize: 28}}>{item.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT UPDATED TO /login */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/login')}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  nameText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  avatar: { width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 15, padding: 15, justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  gridContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  iconBox: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  logoutBtn: { marginTop: 20, padding: 15, backgroundColor: '#c0392b', borderRadius: 10, alignItems: 'center' },
  logoutText: { color: 'white', fontWeight: 'bold' }
});