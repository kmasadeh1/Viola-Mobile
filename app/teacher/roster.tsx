import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RosterScreen() {
  const students = [
    { id: '202601', name: 'Kareem Masadeh', parent: 'Mr. Masadeh', phone: '0791234567' },
    { id: '202602', name: 'Sarah Smith', parent: 'Mrs. Smith', phone: '0771234567' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f39c12', '#e67e22']} style={styles.header}>
        <Text style={styles.headerTitle}>Class Roster</Text>
      </LinearGradient>
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.parent}>Parent: {item.parent}</Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} style={styles.callBtn}>
              <Text style={{fontSize: 20}}>📞</Text>
            </TouchableOpacity>
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
  card: { flexDirection: 'row', alignItems: 'center', justifyContent:'space-between', backgroundColor: 'white', padding: 20, marginBottom: 15, borderRadius: 12, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  parent: { color: '#666', marginTop: 4 },
  callBtn: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#eefcf1', alignItems: 'center', justifyContent: 'center' }
});