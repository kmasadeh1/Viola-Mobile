import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradebookScreen() {
  const [students, setStudents] = useState([
    { id: '202601', name: 'Kareem Masadeh', grade: '' },
    { id: '202602', name: 'Sarah Smith', grade: '' },
    { id: '202603', name: 'Ali Ahmed', grade: '' },
  ]);

  const updateGrade = (id: string, text: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, grade: text } : s));
  };

  const saveGrades = () => {
    Alert.alert("Success", "Grades published to Parent Portal!");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={['#8e44ad', '#9b59b6']} style={styles.header}>
        <Text style={styles.headerTitle}>Gradebook</Text>
        <Text style={styles.subTitle}>Subject: Mathematics (Exam 1)</Text>
      </LinearGradient>

      <View style={styles.listHeader}>
        <Text style={styles.colName}>Student Name</Text>
        <Text style={styles.colGrade}>Score / 100</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.id}>ID: {item.id}</Text>
            </View>
            <TextInput 
              style={styles.input}
              placeholder="-"
              keyboardType="numeric"
              maxLength={3}
              value={item.grade}
              onChangeText={(text) => updateGrade(item.id, text)}
            />
          </View>
        )}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveGrades}>
        <Text style={styles.saveText}>Publish Grades</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subTitle: { color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  listHeader: { flexDirection: 'row', padding: 15, backgroundColor: '#eee' },
  colName: { flex: 1, fontWeight: 'bold', color: '#555' },
  colGrade: { width: 80, fontWeight: 'bold', color: '#555', textAlign: 'center' },
  list: { padding: 15 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 10, elevation: 2 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  id: { fontSize: 12, color: '#999' },
  input: { width: 70, height: 45, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, textAlign: 'center', fontSize: 18, backgroundColor: '#f9f9f9' },
  saveBtn: { backgroundColor: '#2c3e50', padding: 15, margin: 20, borderRadius: 10, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});