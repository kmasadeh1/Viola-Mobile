import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker'; // Requires 'expo-image-picker' dependency

// --- TYPES ---
interface Student {
  id: string;
  name: string;
  grade: string;
  photo?: string;
}

interface Homework {
  id: number;
  class: string;
  subject: string;
  description: string;
  dueDate: string;
}

interface ScheduleItem {
  dayIdx: number;
  dayName: string;
  time: string;
  className: string;
  subject: string;
}

const COLORS = {
  primary: '#4361ee',   // Teacher Blue
  secondary: '#3f37c9',
  accent: '#f1c40f',    // Admin/Warning
  success: '#2ecc71',
  danger: '#e74c3c',
  dark: '#2d3436',
  light: '#f8f9fa',
  white: '#fff',
  grey: '#e1e8ed',
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export default function TeacherDashboardScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [isArabic, setIsArabic] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance');
  
  // Teacher Info
  const [teacherName, setTeacherName] = useState('Ms. Sarah');
  const [className, setClassName] = useState('KG1 A');
  const [isAdminPreview, setIsAdminPreview] = useState(false);

  // Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<{[id: string]: string}>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [subjects, setSubjects] = useState<string[]>(['Math', 'Science', 'English']);
  const [grades, setGrades] = useState<any>({});
  const [currentTerm, setCurrentTerm] = useState("First Semester");
  
  // Inputs
  const [hwSubject, setHwSubject] = useState('');
  const [hwDate, setHwDate] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('class');
  const [newSubject, setNewSubject] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [galleryImage, setGalleryImage] = useState<string | null>(null);

  // Modals
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const t = (en: string, ar: string) => isArabic ? ar : en;

  // --- DATA LOADING ---
  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Language
      const lang = await AsyncStorage.getItem('viola_language');
      setIsArabic(lang === 'ar');

      // 2. Identify User
      const previewTeacher = await AsyncStorage.getItem('viola_preview_teacher');
      const loggedUserStr = await AsyncStorage.getItem('viola_current_user');
      
      let targetClass = "KG1 A";

      if (previewTeacher) {
        const pt = JSON.parse(previewTeacher);
        setIsAdminPreview(true);
        setTeacherName(pt.name);
        setClassName(pt.class);
        targetClass = pt.class;
      } else if (loggedUserStr) {
        const u = JSON.parse(loggedUserStr);
        if (u.role === 'teacher') {
          setTeacherName(u.name);
          setClassName(u.class);
          targetClass = u.class;
        }
      }

      // 3. Load Students
      const studentsJson = await AsyncStorage.getItem('viola_students');
      let allStudents: Student[] = studentsJson ? JSON.parse(studentsJson) : [];
      // Fallback data if empty
      if (allStudents.length === 0) {
        allStudents = [
            { id: "202601", name: "Kareem Masadeh", grade: targetClass },
            { id: "202602", name: "Layla Ahmed", grade: targetClass },
            { id: "202603", name: "Omar Yousef", grade: targetClass }
        ];
        await AsyncStorage.setItem('viola_students', JSON.stringify(allStudents));
      }
      const myStudents = allStudents.filter(s => s.grade === targetClass);
      setStudents(myStudents);

      // 4. Load Other Data
      loadAttendance(targetClass, selectedDate);
      loadSchedule(teacherName);
      loadHomework(targetClass);
      loadGrades(targetClass, currentTerm);
      loadSubjects();

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // --- ATTENDANCE ---
  const loadAttendance = async (cls: string, date: string) => {
    const key = `viola_attendance_${date}`;
    const json = await AsyncStorage.getItem(key);
    if (json) setAttendance(JSON.parse(json));
    else setAttendance({});
  };

  const markAttendance = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newAtt = { ...attendance };
    students.forEach(s => newAtt[s.id] = 'present');
    setAttendance(newAtt);
  };

  const saveAttendance = async () => {
    const key = `viola_attendance_${selectedDate}`;
    await AsyncStorage.setItem(key, JSON.stringify(attendance));
    Alert.alert(t('Saved', 'تم الحفظ'), t('Attendance record saved.', 'تم حفظ سجل الحضور.'));
  };

  const getAttendanceStats = () => {
    const presentCount = Object.values(attendance).filter(v => v === 'present' || v === 'late').length;
    return `${presentCount}/${students.length}`;
  };

  // --- SCHEDULE ---
  const loadSchedule = async (name: string) => {
    const json = await AsyncStorage.getItem('viola_schedule_v2');
    const allSchedules = json ? JSON.parse(json) : {};
    const myClasses: ScheduleItem[] = [];
    const shortName = name.split(' ')[0] || name; // Simple matching

    // Iterate through all classes to find teacher's slots
    for (const [cls, dayData] of Object.entries(allSchedules)) {
        for (const [dayIdx, times] of Object.entries(dayData as any)) {
            for (const [time, details] of Object.entries(times as any)) {
                if ((details as any).teach?.includes(shortName)) {
                    myClasses.push({
                        dayIdx: parseInt(dayIdx),
                        dayName: DAYS[parseInt(dayIdx)],
                        time,
                        className: cls,
                        subject: (details as any).sub
                    });
                }
            }
        }
    }
    // Sort
    myClasses.sort((a, b) => {
        if (a.dayIdx !== b.dayIdx) return a.dayIdx - b.dayIdx;
        return a.time.localeCompare(b.time);
    });
    setSchedule(myClasses);
  };

  // --- GRADES ---
  const loadSubjects = async () => {
    const json = await AsyncStorage.getItem('viola_subjects');
    if (json) setSubjects(JSON.parse(json));
  };

  const addSubject = async () => {
    if (newSubject && !subjects.includes(newSubject)) {
      const newSubs = [...subjects, newSubject];
      setSubjects(newSubs);
      await AsyncStorage.setItem('viola_subjects', JSON.stringify(newSubs));
      setNewSubject('');
      Alert.alert('Success', 'Subject Added');
    }
  };

  const loadGrades = async (cls: string, term: string) => {
    const key = term === "First Semester" ? "viola_grades" : "viola_grades_term2";
    const json = await AsyncStorage.getItem(key);
    if (json) setGrades(JSON.parse(json));
    else setGrades({});
  };

  const updateGrade = (studentId: string, subject: string, value: string) => {
    const safeKey = subject.replace(/\s+/g, '_').toLowerCase();
    setGrades((prev: any) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [safeKey]: value
      }
    }));
  };

  const saveGrades = async () => {
    const key = currentTerm === "First Semester" ? "viola_grades" : "viola_grades_term2";
    await AsyncStorage.setItem(key, JSON.stringify(grades));
    Alert.alert(t('Saved', 'تم الحفظ'), t('Grades updated successfully.', 'تم تحديث الدرجات بنجاح.'));
  };

  // --- HOMEWORK ---
  const loadHomework = async (cls: string) => {
    const json = await AsyncStorage.getItem('viola_homework');
    const allHw: Homework[] = json ? JSON.parse(json) : [];
    setHomeworkList(allHw.filter(h => h.class === cls));
  };

  const postHomework = async () => {
    if (!hwSubject || !hwDate || !hwDesc) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const newHw: Homework = {
      id: Date.now(),
      class: className,
      subject: hwSubject,
      dueDate: hwDate,
      description: hwDesc
    };
    const json = await AsyncStorage.getItem('viola_homework');
    const allHw = json ? JSON.parse(json) : [];
    allHw.unshift(newHw);
    await AsyncStorage.setItem('viola_homework', JSON.stringify(allHw));
    
    setHwSubject(''); setHwDate(''); setHwDesc('');
    loadHomework(className);
    Alert.alert('Success', 'Assignment Posted');
  };

  const deleteHomework = async (id: number) => {
    const json = await AsyncStorage.getItem('viola_homework');
    let allHw: Homework[] = json ? JSON.parse(json) : [];
    allHw = allHw.filter(h => h.id !== id);
    await AsyncStorage.setItem('viola_homework', JSON.stringify(allHw));
    loadHomework(className);
  };

  // --- BROADCAST ---
  const sendBroadcast = async () => {
    if (!broadcastTitle || !broadcastBody) {
      Alert.alert('Error', 'Missing title or message');
      return;
    }
    
    const newMsg = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      targetClass: className,
      sender: teacherName,
      title: broadcastTitle,
      body: broadcastBody,
      targetStudentId: broadcastTarget !== 'class' ? broadcastTarget : undefined,
      isPrivate: broadcastTarget !== 'class'
    };

    const json = await AsyncStorage.getItem('viola_notifications');
    const msgs = json ? JSON.parse(json) : [];
    msgs.unshift(newMsg);
    await AsyncStorage.setItem('viola_notifications', JSON.stringify(msgs));

    setBroadcastTitle(''); setBroadcastBody('');
    Alert.alert('Sent', 'Broadcast message sent.');
  };

  // --- GALLERY & STUDENT PHOTO ---
  const pickImage = async (type: 'gallery' | 'student') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (type === 'gallery') setGalleryImage(base64Img);
      else if (type === 'student' && selectedStudent) {
         // Update student photo locally then save
         const updatedStudent = { ...selectedStudent, photo: base64Img };
         updateStudentPhoto(updatedStudent);
      }
    }
  };

  const publishGalleryPhoto = async () => {
    if (!galleryImage) return;
    const json = await AsyncStorage.getItem('viola_gallery');
    const gallery = json ? JSON.parse(json) : [];
    gallery.unshift({
      id: Date.now(),
      url: galleryImage,
      caption: photoCaption,
      targetClass: className
    });
    await AsyncStorage.setItem('viola_gallery', JSON.stringify(gallery));
    setGalleryImage(null);
    setPhotoCaption('');
    Alert.alert('Success', 'Photo Published');
  };

  const updateStudentPhoto = async (updatedStudent: Student) => {
    const json = await AsyncStorage.getItem('viola_students');
    let all = json ? JSON.parse(json) : [];
    const idx = all.findIndex((s: any) => s.id === updatedStudent.id);
    if (idx !== -1) {
      all[idx] = updatedStudent;
      await AsyncStorage.setItem('viola_students', JSON.stringify(all));
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      setSelectedStudent(updatedStudent); // Update modal view
      Alert.alert('Updated', 'Student photo updated.');
    }
  };

  const handleLogout = async () => {
    if (isAdminPreview) {
      await AsyncStorage.removeItem('viola_preview_teacher');
      navigation.navigate('AdminDashboard');
    } else {
      await AsyncStorage.removeItem('viola_current_user');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  // --- UI RENDER HELPERS ---
  const renderTabContent = () => {
    switch(activeTab) {
      case 'attendance':
        return (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('Daily Attendance', 'سجل الحضور')}</Text>
              <TouchableOpacity onPress={markAllPresent} style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>{t('Mark All Present', 'تحديد الكل')}</Text>
              </TouchableOpacity>
            </View>
            {students.map(s => (
              <View key={s.id} style={[styles.studentRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                <View style={[styles.studentInfo, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                   <TouchableOpacity onPress={() => { setSelectedStudent(s); setShowStudentModal(true); }}>
                      <Image source={{ uri: s.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random` }} style={styles.avatarSmall} />
                   </TouchableOpacity>
                   <View style={{ alignItems: isArabic ? 'flex-end' : 'flex-start' }}>
                      <Text style={styles.studentName}>{s.name}</Text>
                      <Text style={styles.studentId}>{s.id}</Text>
                   </View>
                </View>
                <View style={styles.attToggles}>
                   <TouchableOpacity onPress={() => markAttendance(s.id, 'present')} style={[styles.attBtn, attendance[s.id] === 'present' && { backgroundColor: COLORS.success, borderColor: COLORS.success }]}>
                      <FontAwesome5 name="check" size={14} color={attendance[s.id] === 'present' ? 'white' : COLORS.success} />
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => markAttendance(s.id, 'late')} style={[styles.attBtn, attendance[s.id] === 'late' && { backgroundColor: COLORS.accent, borderColor: COLORS.accent }]}>
                      <FontAwesome5 name="clock" size={14} color={attendance[s.id] === 'late' ? 'white' : COLORS.accent} />
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => markAttendance(s.id, 'absent')} style={[styles.attBtn, attendance[s.id] === 'absent' && { backgroundColor: COLORS.danger, borderColor: COLORS.danger }]}>
                      <FontAwesome5 name="times" size={14} color={attendance[s.id] === 'absent' ? 'white' : COLORS.danger} />
                   </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={saveAttendance}>
               <Text style={styles.saveBtnText}>{t('Save Records', 'حفظ السجل')}</Text>
            </TouchableOpacity>
          </View>
        );

      case 'schedule':
        return (
          <View style={styles.card}>
             <Text style={styles.sectionTitle}>{t('My Weekly Schedule', 'جدولي الأسبوعي')}</Text>
             {schedule.length === 0 ? (
               <Text style={styles.emptyText}>{t('No classes found.', 'لا يوجد حصص.')}</Text>
             ) : (
               schedule.map((item, i) => (
                 <View key={i} style={[styles.scheduleRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.schDay}>{item.dayName}</Text>
                    <Text style={styles.schTime}>{item.time}</Text>
                    <View style={styles.schBadge}><Text style={styles.schBadgeText}>{item.className}</Text></View>
                    <Text style={styles.schSubject}>{item.subject}</Text>
                 </View>
               ))
             )}
          </View>
        );

      case 'grades':
        return (
          <View style={styles.card}>
             <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('Gradebook', 'دفتر الدرجات')}</Text>
                <TouchableOpacity onPress={() => setCurrentTerm(currentTerm === "First Semester" ? "Second Semester" : "First Semester")}>
                   <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{currentTerm === "First Semester" ? "Term 1" : "Term 2"}</Text>
                </TouchableOpacity>
             </View>
             
             {/* Add Subject */}
             <View style={[styles.inputRow, { marginBottom: 15 }]}>
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder={t('New Subject', 'مادة جديدة')} 
                  value={newSubject}
                  onChangeText={setNewSubject}
                />
                <TouchableOpacity style={styles.iconBtn} onPress={addSubject}>
                   <FontAwesome5 name="plus" size={16} color="white" />
                </TouchableOpacity>
             </View>

             <ScrollView horizontal>
               <View>
                 <View style={[styles.gradeHeaderRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                   <Text style={[styles.gradeHeaderCell, { width: 120 }]}>{t('Student', 'الطالب')}</Text>
                   {subjects.map(sub => (
                     <Text key={sub} style={styles.gradeHeaderCell}>{sub}</Text>
                   ))}
                 </View>
                 {students.map(s => (
                   <View key={s.id} style={[styles.gradeRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                      <Text style={[styles.gradeNameCell, { width: 120 }]}>{s.name.split(' ')[0]}</Text>
                      {subjects.map(sub => {
                        const safeKey = sub.replace(/\s+/g, '_').toLowerCase();
                        const val = (grades[s.id] && grades[s.id][safeKey]) ? grades[s.id][safeKey] : "";
                        return (
                          <View key={sub} style={styles.gradeInputCell}>
                             <TextInput 
                               style={styles.gradeInput}
                               value={val}
                               onChangeText={(txt) => updateGrade(s.id, sub, txt)}
                               keyboardType="numeric"
                               maxLength={3}
                             />
                          </View>
                        );
                      })}
                   </View>
                 ))}
               </View>
             </ScrollView>
             <TouchableOpacity style={styles.saveBtn} onPress={saveGrades}>
                <Text style={styles.saveBtnText}>{t('Update Grades', 'تحديث الدرجات')}</Text>
             </TouchableOpacity>
          </View>
        );

      case 'homework':
        return (
          <View style={styles.card}>
             <Text style={styles.sectionTitle}>{t('Post Assignment', 'نشر واجب')}</Text>
             <View style={styles.formGroup}>
                <TextInput style={styles.input} placeholder={t('Subject', 'المادة')} value={hwSubject} onChangeText={setHwSubject} />
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={hwDate} onChangeText={setHwDate} />
                <TextInput style={[styles.input, { height: 80 }]} placeholder={t('Instructions...', 'التعليمات...')} multiline value={hwDesc} onChangeText={setHwDesc} />
                <TouchableOpacity style={styles.saveBtn} onPress={postHomework}>
                   <Text style={styles.saveBtnText}>{t('Post to Parents', 'نشر')}</Text>
                </TouchableOpacity>
             </View>

             <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t('Active Assignments', 'الواجبات النشطة')}</Text>
             {homeworkList.map(h => (
                <View key={h.id} style={styles.hwItem}>
                   <View style={{ flex: 1 }}>
                      <Text style={styles.hwSub}>{h.subject}</Text>
                      <Text style={styles.hwDesc}>{h.description}</Text>
                      <Text style={styles.hwDate}>{t('Due:', 'تسليم:')} {h.dueDate}</Text>
                   </View>
                   <TouchableOpacity onPress={() => deleteHomework(h.id)}>
                      <FontAwesome5 name="trash" size={16} color={COLORS.danger} />
                   </TouchableOpacity>
                </View>
             ))}
          </View>
        );

      case 'gallery':
         return (
           <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t('Classroom Moments', 'لحظات الصف')}</Text>
              <TouchableOpacity style={styles.uploadArea} onPress={() => pickImage('gallery')}>
                 {galleryImage ? (
                    <Image source={{ uri: galleryImage }} style={styles.previewImg} />
                 ) : (
                    <>
                       <FontAwesome5 name="cloud-upload-alt" size={40} color={COLORS.primary} />
                       <Text style={{ color: '#888', marginTop: 10 }}>{t('Tap to Upload', 'اضغط للتحميل')}</Text>
                    </>
                 )}
              </TouchableOpacity>
              <TextInput 
                 style={styles.input} 
                 placeholder={t('Caption...', 'تعليق...')} 
                 value={photoCaption} 
                 onChangeText={setPhotoCaption}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={publishGalleryPhoto}>
                 <Text style={styles.saveBtnText}>{t('Publish Photo', 'نشر الصورة')}</Text>
              </TouchableOpacity>
           </View>
         );

      case 'broadcast':
         return (
            <View style={styles.card}>
               <Text style={styles.sectionTitle}>{t('Send Broadcast', 'إرسال إعلان')}</Text>
               <View style={styles.formGroup}>
                  <Text style={styles.label}>{t('Recipient', 'المستلم')}</Text>
                  <View style={styles.pickerFake}> 
                     {/* Simplified dropdown simulation */}
                     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity onPress={() => setBroadcastTarget('class')} style={[styles.chip, broadcastTarget === 'class' && styles.chipActive]}>
                           <Text style={[styles.chipText, broadcastTarget === 'class' && { color: 'white' }]}>Whole Class</Text>
                        </TouchableOpacity>
                        {students.map(s => (
                           <TouchableOpacity key={s.id} onPress={() => setBroadcastTarget(s.id)} style={[styles.chip, broadcastTarget === s.id && styles.chipActive]}>
                              <Text style={[styles.chipText, broadcastTarget === s.id && { color: 'white' }]}>{s.name.split(' ')[0]}</Text>
                           </TouchableOpacity>
                        ))}
                     </ScrollView>
                  </View>

                  <TextInput style={styles.input} placeholder={t('Title', 'العنوان')} value={broadcastTitle} onChangeText={setBroadcastTitle} />
                  <TextInput style={[styles.input, { height: 100 }]} placeholder={t('Message...', 'الرسالة...')} multiline value={broadcastBody} onChangeText={setBroadcastBody} />
                  
                  <TouchableOpacity style={styles.saveBtn} onPress={sendBroadcast}>
                     <Text style={styles.saveBtnText}>{t('Send Message', 'إرسال الرسالة')}</Text>
                  </TouchableOpacity>
               </View>
            </View>
         );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* ADMIN BANNER */}
      {isAdminPreview && (
         <View style={styles.adminBanner}>
            <Text style={styles.adminText}>Admin Edit Mode</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.exitBtn}>
               <Text style={styles.exitBtnText}>Exit</Text>
            </TouchableOpacity>
         </View>
      )}

      {/* HEADER */}
      <View style={styles.header}>
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome5 name="chalkboard-teacher" size={24} color={COLORS.primary} style={{ marginRight: 10 }} />
            <View>
               <Text style={styles.appName}>Viola<Text style={{ color: COLORS.primary }}>Teach</Text></Text>
               <View style={styles.classBadge}>
                  <Text style={styles.classText}>{className}</Text>
               </View>
            </View>
         </View>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => setIsArabic(!isArabic)}>
               <FontAwesome5 name="globe" size={20} color={COLORS.dark} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
               <FontAwesome5 name="sign-out-alt" size={20} color={COLORS.danger} />
            </TouchableOpacity>
            <Image source={{ uri: 'https://ui-avatars.com/api/?name=Sarah+Teacher&background=random' }} style={styles.avatar} />
         </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
         
         {/* STATS ROW */}
         <View style={styles.statsRow}>
            <View style={styles.statCard}>
               <Text style={styles.statLabel}>{t('Attendance', 'الحضور')}</Text>
               <Text style={styles.statValue}>{getAttendanceStats()}</Text>
            </View>
            <View style={styles.statCard}>
               <Text style={styles.statLabel}>{t('Homework', 'الواجبات')}</Text>
               <Text style={styles.statValue}>{homeworkList.length}</Text>
            </View>
            <View style={styles.statCard}>
               <Text style={styles.statLabel}>{t('Date', 'التاريخ')}</Text>
               <Text style={[styles.statValue, { fontSize: 14 }]}>{new Date().toLocaleDateString()}</Text>
            </View>
         </View>

         {/* TABS SCROLL */}
         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
            {['attendance', 'schedule', 'grades', 'homework', 'gallery', 'broadcast'].map(tab => (
               <TouchableOpacity 
                  key={tab} 
                  style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                  onPress={() => setActiveTab(tab)}
               >
                  <Text style={[styles.tabTitle, activeTab === tab && styles.activeTabTitle]}>
                     {t(tab.charAt(0).toUpperCase() + tab.slice(1), tab === 'attendance' ? 'الحضور' : tab === 'schedule' ? 'الجدول' : tab === 'grades' ? 'الدرجات' : tab === 'homework' ? 'الواجبات' : tab === 'gallery' ? 'الصور' : 'الإعلانات')}
                  </Text>
               </TouchableOpacity>
            ))}
         </ScrollView>

         {/* MAIN CONTENT AREA */}
         {renderTabContent()}

      </ScrollView>

      {/* STUDENT PHOTO MODAL */}
      <Modal visible={showStudentModal} transparent animationType="fade" onRequestClose={() => setShowStudentModal(false)}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <Text style={styles.modalHeader}>{selectedStudent?.name}</Text>
               <Image source={{ uri: selectedStudent?.photo || 'https://via.placeholder.com/150' }} style={styles.modalImg} />
               <TouchableOpacity style={styles.modalBtn} onPress={() => pickImage('student')}>
                  <Text style={styles.modalBtnText}>{t('Change Photo', 'تغيير الصورة')}</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.grey }]} onPress={() => setShowStudentModal(false)}>
                  <Text style={[styles.modalBtnText, { color: COLORS.dark }]}>{t('Close', 'إغلاق')}</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  
  adminBanner: { backgroundColor: COLORS.accent, padding: 30, paddingTop: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  adminText: { fontWeight: 'bold' },
  exitBtn: { backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  exitBtnText: { fontSize: 12, fontWeight: 'bold' },

  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
  },
  appName: { fontSize: 20, fontWeight: 'bold', color: COLORS.dark },
  classBadge: { backgroundColor: '#f0f4ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
  classText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold' },
  avatar: { width: 35, height: 35, borderRadius: 17.5 },

  content: { padding: 15, paddingBottom: 50 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: 'white', width: '31%', padding: 15, borderRadius: 12, elevation: 1 },
  statLabel: { fontSize: 10, color: '#888', fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, marginTop: 5 },

  tabBar: { marginBottom: 15, flexDirection: 'row' },
  tabItem: { paddingHorizontal: 20, paddingVertical: 8, marginRight: 10, borderRadius: 20, backgroundColor: 'white' },
  activeTabItem: { backgroundColor: COLORS.primary },
  tabTitle: { fontWeight: 'bold', color: '#636e72', fontSize: 13 },
  activeTabTitle: { color: 'white' },

  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 2, minHeight: 400 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, marginBottom: 15 },
  
  // Attendance
  outlineBtn: { borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  outlineBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  studentRow: { justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f6fa' },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee' },
  studentName: { fontWeight: 'bold', color: COLORS.dark },
  studentId: { fontSize: 10, color: '#888' },
  attToggles: { flexDirection: 'row', gap: 5 },
  attBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  
  saveBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: 'white', fontWeight: 'bold' },

  // Schedule
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f6fa' },
  schDay: { fontWeight: 'bold', width: 80 },
  schTime: { color: '#888', width: 80 },
  schBadge: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, borderRadius: 10, justifyContent: 'center' },
  schBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold' },
  schSubject: { fontWeight: 'bold', color: COLORS.dark },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 },

  // Grades
  inputRow: { flexDirection: 'row', gap: 10 },
  iconBtn: { backgroundColor: COLORS.primary, width: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  gradeHeaderRow: { flexDirection: 'row', marginBottom: 10 },
  gradeHeaderCell: { width: 70, fontWeight: 'bold', textAlign: 'center', color: '#888', fontSize: 12 },
  gradeRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  gradeNameCell: { fontSize: 12, fontWeight: 'bold' },
  gradeInputCell: { width: 70, alignItems: 'center' },
  gradeInput: { width: 50, height: 35, borderWidth: 1, borderColor: '#eee', borderRadius: 8, textAlign: 'center', backgroundColor: '#f9f9f9' },

  // Forms
  formGroup: { gap: 10 },
  input: { backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e1e8ed' },
  
  // Homework
  hwItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, elevation: 1 },
  hwSub: { fontSize: 10, color: COLORS.primary, fontWeight: 'bold', textTransform: 'uppercase' },
  hwDesc: { fontWeight: 'bold', color: COLORS.dark, marginVertical: 4 },
  hwDate: { fontSize: 10, color: COLORS.danger },

  // Gallery
  uploadArea: { height: 150, borderWidth: 2, borderColor: '#cbd5e0', borderStyle: 'dashed', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15, backgroundColor: '#fafafa' },
  previewImg: { width: '100%', height: '100%', borderRadius: 13 },

  // Broadcast
  label: { fontSize: 12, fontWeight: 'bold', color: '#888' },
  pickerFake: { marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#eee', borderRadius: 15, marginRight: 8 },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 12, color: '#555' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center' },
  modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalImg: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  modalBtn: { width: '100%', padding: 12, borderRadius: 25, backgroundColor: COLORS.primary, alignItems: 'center', marginBottom: 10 },
  modalBtnText: { color: 'white', fontWeight: 'bold' },
});