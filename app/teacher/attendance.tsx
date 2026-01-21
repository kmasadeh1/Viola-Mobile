import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AttendanceScreen() {
  // Dummy student list for KG1-A
  const [students, setStudents] = useState([
    { id: '202601', name: 'Kareem Masadeh', present: true },
    { id: '202602', name: 'Sarah Smith', present: true },
    { id: '202603', name: 'Ali Ahmed', present: false }, // Absent by default example
    { id: '202604', name: 'John Doe', present: true },
  ]);

  const toggleAttendance = (id: string) => {
    setStudents(students.map(s => 
      s.id === id ? { ...s, present: !s.present } : s
    ));
  };

  const submitAttendance = () => {
    const absentCount = students.filter(s => !s.present).length;
    Alert.alert("Submitted", `Attendance Saved.\nPresent: ${students.length - absentCount}\nAbsent: ${absentCount}`);
  };

  const markAllPresent = () => {
    setStudents(students.map(s => ({ ...s, present: true })));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#27ae60', '#2ecc71']} style={styles.header}>
        <Text style={styles.headerTitle}>Daily Attendance</Text>
        <Text style={styles.dateText}>{new Date().toDateString()}</Text>
      </LinearGradient>

      <View style={styles.controls}>
        <TouchableOpacity onPress={markAllPresent}>
            <Text style={{color: '#27ae60', fontWeight: 'bold'}}>Mark All Present</Text>
        </TouchableOpacity>
        <Text style={{color: '#666'}}>Total: {students.length}</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.studentInfo}>
                <View style={styles.avatar}><Text>🎓</Text></View>
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.id}>ID: {item.id}</Text>
                </View>
            </View>
            
            <View style={styles.statusBox}>
                <Text style={{color: item.present ? '#27ae60' : '#e74c3c', fontWeight: 'bold', marginRight: 10}}>
                    {item.present ? 'Present' : 'Absent'}
                </Text>
                <Switch
                    trackColor={{ false: "#ffcdd2", true: "#c8e6c9" }}
                    thumbColor={item.present ? "#2ecc71" : "#e57373"}
                    onValueChange={() => toggleAttendance(item.id)}
                    value={item.present}
                />
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={submitAttendance}>
        <Text style={styles.submitText}>Save Attendance</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  dateText: { color: 'rgba(255,255,255,0.9)', marginTop: 5 },
  
  controls: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
  
  list: { padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  studentInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, backgroundColor: '#eee', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  id: { color: '#999', fontSize: 12 },
  
  statusBox: { flexDirection: 'row', alignItems: 'center' },
  
  submitBtn: { backgroundColor: '#2c3e50', padding: 15, margin: 20, borderRadius: 10, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});