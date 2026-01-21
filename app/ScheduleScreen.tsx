import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// --- TYPES ---
interface ScheduleSlot {
  sub: string;   // Subject
  teach: string; // Teacher
}

interface DaySchedule {
  [time: string]: ScheduleSlot;
}

interface ClassSchedule {
  [dayIndex: string]: DaySchedule;
}

const COLORS = {
  primary: '#2c3e50',
  secondary: '#3498db', // Blue
  light: '#f4f6f9',
  white: '#fff',
  text: '#2c3e50',
  border: '#e1e8ed',
  success: '#2ecc71',
  empty: '#bdc3c7'
};

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export default function ScheduleScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [isArabic, setIsArabic] = useState(false);
  
  // Data State
  const [className, setClassName] = useState<string>('--');
  const [scheduleData, setScheduleData] = useState<ClassSchedule>({});
  const [uniqueTimes, setUniqueTimes] = useState<string[]>([]);

  // Constants
  const t = (en: string, ar: string) => isArabic ? ar : en;

  // --- DATA LOADING ---
  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Language
      const lang = await AsyncStorage.getItem('viola_language');
      setIsArabic(lang === 'ar');

      // 2. Identify Student & Class
      const previewId = await AsyncStorage.getItem('viola_preview_student_id');
      const sessionStudentId = await AsyncStorage.getItem('viola_current_student_id');
      const allStudentsStr = await AsyncStorage.getItem('viola_students');
      const allStudents = allStudentsStr ? JSON.parse(allStudentsStr) : [];
      
      let student = null;
      if (previewId) {
        student = allStudents.find((s: any) => s.id == previewId);
      } else if (sessionStudentId) {
        student = allStudents.find((s: any) => s.id == sessionStudentId);
      } else {
        // Fallback demo
        student = allStudents.find((s: any) => s.name.includes("Kareem")) || allStudents[0];
      }

      const targetClass = student ? student.grade : "KG1 A";
      setClassName(targetClass);

      // 3. Load Schedule
      const scheduleJson = await AsyncStorage.getItem('viola_schedule_v2');
      const allSchedules = scheduleJson ? JSON.parse(scheduleJson) : {};
      const classData: ClassSchedule = allSchedules[targetClass] || {};
      
      setScheduleData(classData);

      // 4. Extract Unique Time Slots for sorting
      const timesSet = new Set<string>();
      for (let i = 0; i < 5; i++) {
        const dayData = classData[i] || {};
        Object.keys(dayData).forEach(k => timesSet.add(normalizeTimeKey(k)));
      }
      const sortedTimes = Array.from(timesSet).sort();
      setUniqueTimes(sortedTimes);

    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // --- HELPERS ---
  const normalizeTimeKey = (k: string) => {
    if(!k) return "";
    let [h, m] = k.split(':');
    if(!m || m === "") m = "00"; 
    if(h.length < 2) h = "0" + h; 
    return `${h}:${m}`;
  };

  const formatTimeDisplay = (time24: string) => {
    if(!time24) return "";
    let [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr);
    const ampm = h >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
    h = h % 12;
    h = h ? h : 12; 
    return `${h}:${mStr} ${ampm}`;
  };

  // --- PDF GENERATION ---
  const generatePDF = async () => {
    try {
      const htmlContent = `
        <html dir="${isArabic ? 'rtl' : 'ltr'}">
          <head>
            <style>
              body { font-family: Helvetica, sans-serif; padding: 20px; }
              h1 { color: #2c3e50; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px; }
              th { background-color: #3498db; color: white; }
              .day-col { font-weight: bold; background-color: #f9f9f9; }
              .subject { font-weight: bold; display: block; }
              .teacher { font-size: 10px; color: #555; }
            </style>
          </head>
          <body>
            <h1>${isArabic ? 'الجدول الدراسي' : 'Weekly Schedule'} - ${className}</h1>
            <table>
              <thead>
                <tr>
                  <th>${isArabic ? 'اليوم' : 'Day'}</th>
                  ${uniqueTimes.map(t => `<th>${formatTimeDisplay(t)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${[0,1,2,3,4].map(i => {
                  const dayName = isArabic ? DAYS_AR[i] : DAYS_EN[i];
                  const dayData = scheduleData[i] || {};
                  
                  // Map columns
                  const rowCells = uniqueTimes.map(timeKey => {
                    // Find matching slot (fuzzy match on normalized time)
                    const originalKey = Object.keys(dayData).find(k => normalizeTimeKey(k) === timeKey);
                    const slot = originalKey ? dayData[originalKey] : null;
                    
                    if (slot) {
                      return `<td><span class="subject">${slot.sub}</span><br/><span class="teacher">${slot.teach}</span></td>`;
                    }
                    return `<td>-</td>`;
                  }).join('');

                  return `<tr><td class="day-col">${dayName}</td>${rowCells}</tr>`;
                }).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      
    } catch (e) {
      Alert.alert('Error', 'Could not generate PDF');
      console.error(e);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.secondary} /></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={[styles.navBar, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>{t('Weekly Schedule', 'الجدول الأسبوعي')}</Text>
           <TouchableOpacity onPress={() => setIsArabic(!isArabic)}>
              <FontAwesome5 name="globe" size={20} color="white" />
           </TouchableOpacity>
        </View>
        <Text style={styles.subTitle}>Academic Year 2025-2026</Text>
      </LinearGradient>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={[styles.classBadge, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
           <FontAwesome5 name="layer-group" size={16} color={COLORS.secondary} />
           <Text style={styles.classLabel}>{t('Class:', 'الصف:')} </Text>
           <Text style={styles.classValue}>{className}</Text>
        </View>
        
        <TouchableOpacity style={styles.pdfBtn} onPress={generatePDF}>
           <FontAwesome5 name="file-pdf" size={16} color="white" />
           <Text style={styles.pdfText}>PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {uniqueTimes.length === 0 ? (
           <View style={styles.emptyContainer}>
              <FontAwesome5 name="calendar-times" size={50} color={COLORS.empty} />
              <Text style={styles.emptyText}>{t('No schedule available yet.', 'لا يوجد جدول متاح بعد.')}</Text>
           </View>
        ) : (
          // Render Days
          [0, 1, 2, 3, 4].map((dayIndex) => {
            const dayName = isArabic ? DAYS_AR[dayIndex] : DAYS_EN[dayIndex];
            const dayData = scheduleData[dayIndex] || {};
            const hasClasses = Object.keys(dayData).length > 0;

            return (
              <View key={dayIndex} style={styles.dayCard}>
                <View style={[styles.dayHeader, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                  <Text style={styles.dayTitle}>{dayName}</Text>
                  {!hasClasses && <Text style={styles.offDayText}>{t('No Classes', 'لا يوجد حصص')}</Text>}
                </View>

                {hasClasses && (
                  <View style={styles.timelineContainer}>
                    {uniqueTimes.map((timeKey, i) => {
                      // Find matching slot
                      const originalKey = Object.keys(dayData).find(k => normalizeTimeKey(k) === timeKey);
                      const slot = originalKey ? dayData[originalKey] : null;

                      if (!slot) return null; // Don't render empty slots in mobile list view to save space

                      return (
                        <View key={timeKey} style={[styles.slotRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                           {/* Time Column */}
                           <View style={styles.timeCol}>
                              <Text style={styles.timeText}>{formatTimeDisplay(timeKey)}</Text>
                           </View>
                           
                           {/* Divider Line */}
                           <View style={styles.dividerCol}>
                              <View style={styles.dot} />
                              <View style={styles.line} />
                           </View>

                           {/* Content Column */}
                           <View style={[styles.contentCol, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}>
                              <Text style={styles.subjectText}>{slot.sub}</Text>
                              <View style={[styles.teacherBadge, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                                 <FontAwesome5 name="chalkboard-teacher" size={12} color={COLORS.success} />
                                 <Text style={styles.teacherText}>{slot.teach}</Text>
                              </View>
                           </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  navBar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  subTitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 12 },

  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classBadge: { alignItems: 'center', gap: 5 },
  classLabel: { color: '#7f8c8d', fontSize: 14 },
  classValue: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
  
  pdfBtn: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    gap: 5,
  },
  pdfText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  scrollContent: { padding: 15, paddingBottom: 50 },
  
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: COLORS.empty, marginTop: 10, fontSize: 16 },

  dayCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dayHeader: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayTitle: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  offDayText: {
    color: COLORS.empty,
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  timelineContainer: {
    padding: 15,
  },
  slotRow: {
    marginBottom: 0, // Timeline flows
    height: 70, // Fixed height for alignment
  },
  timeCol: {
    width: 80,
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  timeText: {
    fontWeight: 'bold',
    color: '#7f8c8d',
    fontSize: 12,
  },
  dividerCol: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
    marginLeft: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    marginBottom: 0,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e1e8ed',
    marginVertical: 2,
  },
  contentCol: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingBottom: 20,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  teacherBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: 'center',
    gap: 5,
  },
  teacherText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: 'bold',
  },
});