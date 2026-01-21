import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeworkScreen() {
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadHomework();
  }, []);

  const loadHomework = async () => {
    const stored = await AsyncStorage.getItem('viola_homework');
    if (stored) {
      // In a real app, you would filter by the student's class here
      // const myClass = 'KG1 A';
      // const filtered = JSON.parse(stored).filter(h => h.class === myClass);
      setAssignments(JSON.parse(stored));
    } else {
      setAssignments([
        { id: 1, subject: 'Math', description: 'Complete worksheet page 42', dueDate: '2026-01-20' },
        { id: 2, subject: 'English', description: 'Read "The Cat in the Hat"', dueDate: '2026-01-21' },
      ]);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={[styles.bar, { backgroundColor: getSubjectColor(item.subject) }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={styles.date}>{item.dueDate}</Text>
        </View>
        <Text style={styles.desc}>{item.description}</Text>
      </View>
    </View>
  );

  const getSubjectColor = (sub: string) => {
    if(sub === 'Math') return '#e74c3c';
    if(sub === 'English') return '#3498db';
    if(sub === 'Science') return '#2ecc71';
    return '#f1c40f';
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#34495e', '#2c3e50']} style={styles.header}>
        <Text style={styles.headerTitle}>Homework</Text>
        <Text style={styles.headerSub}>Active Assignments</Text>
      </LinearGradient>

      <FlatList
        data={assignments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No active homework.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center', marginBottom: 10 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSub: { color: '#ccc', fontSize: 14 },
  
  list: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, overflow: 'hidden' },
  bar: { width: 6 },
  content: { flex: 1, padding: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  subject: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  date: { color: '#e74c3c', fontWeight: 'bold', fontSize: 12 },
  desc: { color: '#666', lineHeight: 20 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});