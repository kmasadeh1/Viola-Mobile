import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TeacherManager() {
  const [teachers, setTeachers] = useState([
    { id: '1', name: 'Ms. Huda', subject: 'KG1 Homeroom', phone: '0790000000' },
    { id: '2', name: 'Mr. John', subject: 'English', phone: '0780000000' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSub, setNewSub] = useState('');

  const addTeacher = () => {
    if (!newName) return;
    setTeachers([...teachers, { id: Date.now().toString(), name: newName, subject: newSub, phone: '079...' }]);
    setModalVisible(false);
    setNewName(''); setNewSub('');
  };

  const removeTeacher = (id: string) => {
    Alert.alert("Remove Teacher", "Are you sure?", [
        { text: "Cancel" },
        { text: "Remove", onPress: () => setTeachers(teachers.filter(t => t.id !== id)) }
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8e44ad', '#9b59b6']} style={styles.header}>
        <Text style={styles.headerTitle}>Teacher Staff</Text>
      </LinearGradient>

      <FlatList
        data={teachers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.subject}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} style={styles.iconBtn}>
                    <Text>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeTeacher(item.id)} style={[styles.iconBtn, {backgroundColor:'#ffebee'}]}>
                    <Text>🗑️</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Add Teacher</Text>
                <TextInput style={styles.input} placeholder="Name" value={newName} onChangeText={setNewName} />
                <TextInput style={styles.input} placeholder="Subject" value={newSub} onChangeText={setNewSub} />
                <TouchableOpacity style={styles.saveBtn} onPress={addTeacher}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
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
  list: { padding: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 20, marginBottom: 15, borderRadius: 12, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  sub: { color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 10, backgroundColor: '#f0f3f6', borderRadius: 20 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, backgroundColor: '#8e44ad', borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: 'white', fontSize: 30, marginTop: -5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 10 },
  saveBtn: { backgroundColor: '#8e44ad', padding: 12, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  saveText: { color: 'white', fontWeight: 'bold' },
  cancelText: { textAlign: 'center', color: '#666' }
});