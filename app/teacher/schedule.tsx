import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TeacherSchedule() {
  const schedule = [
    { time: '08:00 - 08:45', class: 'KG1-A', subject: 'Math', room: 'Rm 101' },
    { time: '08:45 - 09:30', class: 'KG1-B', subject: 'Math', room: 'Rm 102' },
    { time: '09:30 - 10:00', class: 'Break', subject: 'Duty', room: 'Playground' },
    { time: '10:00 - 10:45', class: 'KG2-A', subject: 'Science', room: 'Lab 1' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2980b9', '#3498db']} style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <Text style={styles.subTitle}>Today's Classes</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.list}>
        {schedule.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.timeBox}>
              <Text style={styles.time}>{item.time.split(' - ')[0]}</Text>
              <Text style={styles.timeEnd}>{item.time.split(' - ')[1]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.classRoom}>{item.class} • {item.room}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subTitle: { color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  list: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: 'white', marginBottom: 15, borderRadius: 10, overflow: 'hidden', elevation: 2 },
  timeBox: { backgroundColor: '#eaf2f8', padding: 15, alignItems: 'center', justifyContent: 'center', width: 90 },
  time: { fontWeight: 'bold', color: '#2980b9' },
  timeEnd: { fontSize: 12, color: '#7f8c8d' },
  info: { padding: 15, justifyContent: 'center' },
  subject: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  classRoom: { color: '#7f8c8d', marginTop: 4 }
});