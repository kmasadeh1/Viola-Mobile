import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BusManager() {
  const [currentStop, setCurrentStop] = useState(2); // Starts at stop 2

  const stops = [
    { id: 1, name: 'Housing Bank Circle' },
    { id: 2, name: 'Nuwayjis Intersection' },
    { id: 3, name: 'Signal 2 (Bakery)' },
    { id: 4, name: 'Viola Academy' },
  ];

  const updateLocation = (stopId: number) => {
    setCurrentStop(stopId);
    // In a real app, this would send a push notification to parents
    Alert.alert("Updated", `Bus is now at: ${stops.find(s => s.id === stopId)?.name}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f1c40f', '#f39c12']} style={styles.header}>
        <Text style={styles.headerTitle}>Bus Control</Text>
        <Text style={styles.headerSub}>Route #4 - Irbid</Text>
      </LinearGradient>

      <View style={styles.mapArea}>
        <Text style={{fontSize: 50}}>🚌</Text>
        <Text style={styles.statusText}>
            Current Location: {stops.find(s => s.id === currentStop)?.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.controls}>
        <Text style={styles.label}>Update Live Location:</Text>
        {stops.map((stop) => (
          <TouchableOpacity 
            key={stop.id} 
            style={[styles.btn, currentStop === stop.id ? styles.activeBtn : styles.inactiveBtn]}
            onPress={() => updateLocation(stop.id)}
          >
            <Text style={[styles.btnText, currentStop === stop.id && {color: 'white'}]}>
                {stop.id}. {stop.name}
            </Text>
            {currentStop === stop.id && <Text style={{color:'white'}}>📍</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  
  mapArea: { backgroundColor: 'white', padding: 40, alignItems: 'center', marginBottom: 20 },
  statusText: { fontSize: 18, fontWeight: 'bold', marginTop: 10, color: '#f39c12', textAlign: 'center' },

  controls: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 15 },
  btn: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderRadius: 12, marginBottom: 10, elevation: 1 },
  activeBtn: { backgroundColor: '#f39c12' },
  inactiveBtn: { backgroundColor: 'white' },
  btnText: { fontSize: 16, fontWeight: 'bold', color: '#555' }
});