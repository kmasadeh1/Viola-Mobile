import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const clearData = async () => {
    Alert.alert("Reset App", "This will clear all students, orders, and messages. Are you sure?", [
        { text: "Cancel" },
        { text: "Reset", style: 'destructive', onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert("Done", "App has been reset to factory settings.");
            router.replace('/');
        }}
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#95a5a6', '#7f8c8d']} style={styles.header}>
        <Text style={styles.headerTitle}>System Settings</Text>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        
        <TouchableOpacity style={styles.row} onPress={() => Alert.alert("Profile", "Edit Admin Profile")}>
            <Text style={styles.rowText}>Edit Admin Profile</Text>
            {/* FIXED: Arrow symbol */}
            <Text>{'>'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => Alert.alert("Notifications", "Manage Notifications")}>
            <Text style={styles.rowText}>Notifications</Text>
             {/* FIXED: Arrow symbol */}
            <Text>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.row} onPress={clearData}>
            <Text style={[styles.rowText, {color: 'red'}]}>Reset Application Data</Text>
            <Text>⚠️</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')}>
          <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  section: { marginTop: 20, backgroundColor: 'white', paddingVertical: 10 },
  sectionTitle: { paddingHorizontal: 20, paddingBottom: 10, color: '#999', fontSize: 13, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  rowText: { fontSize: 16, color: '#333' },
  logoutBtn: { margin: 20, backgroundColor: '#c0392b', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 40 },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});