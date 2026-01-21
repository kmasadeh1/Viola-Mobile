import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter(); 
  const [role, setRole] = useState('parent'); // Default tab
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // --- 1. PARENT LOGIN ---
    if (role === 'parent') {
      if (id === '202601' && password === '123456') {
        await AsyncStorage.setItem('viola_user_role', 'parent');
        router.replace('/dashboard'); 
      } else {
        Alert.alert("Error", "Invalid Parent ID (Try 202601 / 123456)");
      }
    } 
    // --- 2. TEACHER LOGIN ---
    else if (role === 'teacher') {
      if (id === 'teach1' && password === 'admin') {
         await AsyncStorage.setItem('viola_user_role', 'teacher');
         router.replace('/teacher/dashboard'); 
      } else {
        Alert.alert("Error", "Invalid Teacher ID (Try: teach1 / admin)");
      }
    }
    // --- 3. ADMIN LOGIN ---
    else if (role === 'admin') {
      if (id === 'admin' && password === 'admin123') {
         await AsyncStorage.setItem('viola_user_role', 'admin');
         router.replace('/admin/dashboard'); 
      } else {
        Alert.alert("Error", "Invalid Admin Credentials (Try: admin / admin123)");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo Area */}
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
            <Text style={{fontSize: 30}}>🎓</Text>
        </View>
        <Text style={styles.brandName}>Viola Academy</Text>
      </View>

      {/* Tabs - THIS IS WHERE THE ADMIN BUTTON IS CREATED */}
      <View style={styles.toggleContainer}>
        {['parent', 'teacher', 'admin'].map((item) => (
          <TouchableOpacity 
            key={item} 
            style={[styles.toggleBtn, role === item && styles.activeBtn]}
            onPress={() => setRole(item)}
          >
            <Text style={[styles.toggleText, role === item && styles.activeText]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>
            {role === 'parent' ? 'Student ID' : 'Username'}
        </Text>
        <TextInput 
          style={styles.input} 
          placeholder={role === 'parent' ? "e.g. 202601" : "..."}
          value={id}
          onChangeText={setId}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="••••••" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f3e5f5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoPlaceholder: {
    width: 80, height: 80, backgroundColor: 'white', borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  brandName: { fontSize: 24, fontWeight: 'bold', color: '#6a1b9a' },
  toggleContainer: {
    flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 30,
    padding: 5, marginBottom: 20, width: '100%', maxWidth: 400
  },
  toggleBtn: { flex: 1, padding: 10, borderRadius: 25, alignItems: 'center' },
  activeBtn: { backgroundColor: 'white', elevation: 2 },
  toggleText: { fontWeight: 'bold', color: '#666' },
  activeText: { color: '#6a1b9a' },
  formContainer: {
    backgroundColor: 'white', borderRadius: 20, padding: 20, width: '100%', maxWidth: 400,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  label: { marginBottom: 5, fontWeight: '600', color: '#333' },
  input: {
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee',
    borderRadius: 8, padding: 12, marginBottom: 15
  },
  loginBtn: {
    backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, alignItems: 'center'
  },
  loginBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});