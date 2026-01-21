import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StudentManager() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('KG1 A');
  const [newFee, setNewFee] = useState('1000');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await AsyncStorage.getItem('viola_students');
    if (data) {
      setStudents(JSON.parse(data));
    } else {
      // Default dummy data if empty
      const dummies = [
        { id: '202601', name: 'Kareem Masadeh', grade: 'KG1 A', fee: 1000, paid: 500 },
        { id: '202602', name: 'Sarah Smith', grade: 'KG1 A', fee: 1000, paid: 1000 },
      ];
      setStudents(dummies);
      await AsyncStorage.setItem('viola_students', JSON.stringify(dummies));
    }
  };

  const addStudent = async () => {
    if (!newId || !newName) {
      Alert.alert("Error", "Please fill in ID and Name");
      return;
    }

    if (students.find(s => s.id === newId)) {
        Alert.alert("Error", "Student ID already exists!");
        return;
    }

    const newStudent = { 
        id: newId, 
        name: newName, 
        grade: newGrade, 
        fee: parseInt(newFee), 
        paid: 0,
        password: '123456' // Default password
    };

    const updatedList = [...students, newStudent];
    setStudents(updatedList);
    await AsyncStorage.setItem('viola_students', JSON.stringify(updatedList));
    
    setModalVisible(false);
    resetForm();
    Alert.alert("Success", "Student Added Successfully");
  };

  const deleteStudent = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this student?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            const updatedList = students.filter(s => s.id !== id);
            setStudents(updatedList);
            await AsyncStorage.setItem('viola_students', JSON.stringify(updatedList));
        }}
      ]
    );
  };

  const resetForm = () => {
    setNewId(''); setNewName(''); setNewGrade('KG1 A'); setNewFee('1000');
  };

  // Filter Logic
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toString().includes(search)
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3498db', '#2980b9']} style={styles.header}>
        <Text style={styles.headerTitle}>Student Manager</Text>
        <Text style={styles.headerSub}>Total Students: {students.length}</Text>
      </LinearGradient>

      {/* Search & Add Bar */}
      <View style={styles.toolbar}>
        <TextInput 
            style={styles.searchInput} 
            placeholder="Search by Name or ID..." 
            value={search}
            onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={{fontSize: 24, color: 'white'}}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>{item.grade} • ID: {item.id}</Text>
                <Text style={[styles.fees, {color: item.paid >= item.fee ? '#27ae60' : '#e67e22'}]}>
                    {item.paid >= item.fee ? 'Paid' : `Due: ${item.fee - (item.paid || 0)} JOD`}
                </Text>
            </View>
            <TouchableOpacity onPress={() => deleteStudent(item.id)} style={styles.deleteBtn}>
                <Text style={{color: '#e74c3c'}}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add Student Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add New Student</Text>
                
                <TextInput style={styles.input} placeholder="Student ID (e.g. 202699)" keyboardType="numeric" value={newId} onChangeText={setNewId} />
                <TextInput style={styles.input} placeholder="Full Name" value={newName} onChangeText={setNewName} />
                <TextInput style={styles.input} placeholder="Grade (e.g. KG1 A)" value={newGrade} onChangeText={setNewGrade} />
                <TextInput style={styles.input} placeholder="Total Fees (JOD)" keyboardType="numeric" value={newFee} onChangeText={setNewFee} />

                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.btn, styles.btnCancel]}>
                        <Text style={{color: '#666'}}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={addStudent} style={[styles.btn, styles.btnSave]}>
                        <Text style={{color: 'white', fontWeight: 'bold'}}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  
  toolbar: { flexDirection: 'row', padding: 15, gap: 10 },
  searchInput: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  addBtn: { width: 50, height: 50, backgroundColor: '#27ae60', borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 3 },

  list: { padding: 15 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 10, elevation: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  details: { color: '#7f8c8d', fontSize: 12, marginVertical: 2 },
  fees: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  deleteBtn: { padding: 10, backgroundColor: '#fdecec', borderRadius: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 10, backgroundColor: '#f9f9f9' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee' },
  btnSave: { backgroundColor: '#3498db' }
});