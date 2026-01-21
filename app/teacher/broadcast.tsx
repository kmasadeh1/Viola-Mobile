import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BroadcastScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const sendBroadcast = async () => {
    if (!title || !message) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    const newMsg = { id: Date.now(), title, message, date: new Date().toLocaleDateString() };
    
    // Save to storage (Parents will read this key)
    const existing = await AsyncStorage.getItem('viola_announcements');
    const list = existing ? JSON.parse(existing) : [];
    list.unshift(newMsg);
    await AsyncStorage.setItem('viola_announcements', JSON.stringify(list));

    Alert.alert("Sent", "Message sent to all parents!");
    setTitle(''); setMessage('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={['#e74c3c', '#c0392b']} style={styles.header}>
        <Text style={styles.headerTitle}>Class Broadcast</Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} placeholder="e.g. Field Trip" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Message</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Message..." multiline numberOfLines={5} value={message} onChangeText={setMessage} />

        <TouchableOpacity style={styles.sendBtn} onPress={sendBroadcast}>
          <Text style={styles.sendText}>Send 📢</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 120, textAlignVertical: 'top' },
  sendBtn: { backgroundColor: '#e74c3c', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  sendText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});